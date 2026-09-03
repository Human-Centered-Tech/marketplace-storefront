"use client"

/**
 * First-party analytics client. Fires events to the Medusa
 * /store/analytics/events endpoint. Intentionally simple — no queues,
 * no batching, no retry. Events are best-effort; network failures are
 * silently swallowed so analytics never disrupts user flow.
 *
 * Session ID is generated lazily and persisted in sessionStorage.
 * Platform is detected from the user agent.
 */

type EventType =
  | "page_view"
  | "button_click"
  | "product_view"
  | "favorite"
  | "search"
  | "session_start"
  | "session_end"
  | "cart_add"
  | "purchase"
  | "registry_add"
  // Browse fell back to the Medusa catalog because the Algolia search index
  // didn't answer. Emitted from the product listing; count these to see how
  // often shoppers hit a search outage (and whether it clusters by
  // seller/category/time) instead of finding out from a support ticket.
  | "search_unavailable"

type TrackArgs = {
  event_type: EventType
  entity_type: string
  entity_id: string
  metadata?: Record<string, unknown>
}

const SESSION_KEY = "co_session_id"
const SESSION_START_KEY = "co_session_start"
const SESSION_LAST_KEY = "co_session_last"

// A tab left open in a background window keeps sessionStorage alive, so a raw
// (pagehide - start) span counted hours of nobody-looking-at-it as "time on
// app" — prod showed a 129-minute average. Measure the ENGAGED window
// instead: start → last tracked activity. Anything past this idle gap is not
// part of the session (30 min is the GA convention).
const IDLE_GAP_MS = 30 * 60 * 1000

// Session lifecycle (SOW Exhibit A §11.3 "Login and session tracking",
// §11.4 "Average time spent on app"): a session_start fires once when the
// session id is minted, and session_end fires on pagehide with the elapsed
// duration. Next's client-side navigations don't unload the page, so
// pagehide ≈ tab close / refresh / external navigation. Refreshes emit a
// session_end per unload — consumers must take MAX(duration_ms) per
// session, not the sum.
let sessionLifecycleArmed = false

function armSessionLifecycle() {
  if (sessionLifecycleArmed || typeof window === "undefined") return
  sessionLifecycleArmed = true
  window.addEventListener("pagehide", () => {
    try {
      const id = window.sessionStorage.getItem(SESSION_KEY)
      const start = Number(window.sessionStorage.getItem(SESSION_START_KEY))
      if (!id || !Number.isFinite(start) || start <= 0) return
      // Engaged window: start → last activity, not start → whenever the tab
      // finally closed. Falls back to now for a session that never tracked
      // anything after session_start.
      const last = Number(window.sessionStorage.getItem(SESSION_LAST_KEY))
      const end = Number.isFinite(last) && last > start ? last : Date.now()
      track({
        event_type: "session_end",
        entity_type: "session",
        entity_id: id,
        metadata: { duration_ms: Math.max(0, end - start) },
      })
    } catch {
      // analytics must never disrupt user flow
    }
  })
}

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY)
    // Idle longer than the gap? That's a new visit, not a continuation of the
    // old one — retire the id so the next session starts clean and the old
    // session's duration isn't stretched across the break.
    if (id) {
      const last = Number(window.sessionStorage.getItem(SESSION_LAST_KEY))
      if (Number.isFinite(last) && last > 0 && Date.now() - last > IDLE_GAP_MS) {
        window.sessionStorage.removeItem(SESSION_KEY)
        window.sessionStorage.removeItem(SESSION_START_KEY)
        window.sessionStorage.removeItem(SESSION_LAST_KEY)
        id = null
      }
    }
    if (!id) {
      id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
      // Persist BEFORE emitting session_start: track() re-enters
      // getSessionId, and the stored id terminates the recursion.
      window.sessionStorage.setItem(SESSION_KEY, id)
      window.sessionStorage.setItem(SESSION_START_KEY, String(Date.now()))
      track({
        event_type: "session_start",
        entity_type: "session",
        entity_id: id,
      })
    }
    return id
  } catch {
    return ""
  }
}

function detectPlatform(): "web" | "ios" | "android" {
  if (typeof navigator === "undefined") return "web"
  const ua = navigator.userAgent || ""
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios"
  if (/Android/i.test(ua)) return "android"
  return "web"
}

let backendUrl: string | null = null
let publishableKey: string | null = null

function ensureConfig() {
  if (backendUrl === null) {
    backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  }
  if (publishableKey === null) {
    publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
  }
  return { backendUrl, publishableKey }
}

export function track(args: TrackArgs) {
  if (typeof window === "undefined") return
  const { backendUrl, publishableKey } = ensureConfig()
  if (!backendUrl || !publishableKey) return

  armSessionLifecycle()

  const sessionId = getSessionId()
  // Stamp activity AFTER resolving the id (getSessionId reads the previous
  // stamp to decide whether the session has gone stale).
  try {
    if (sessionId && args.event_type !== "session_end") {
      window.sessionStorage.setItem(SESSION_LAST_KEY, String(Date.now()))
    }
  } catch {
    // analytics must never disrupt user flow
  }

  const body = JSON.stringify({
    ...args,
    session_id: sessionId,
    platform: detectPlatform(),
  })

  // Use fetch with keepalive — NOT sendBeacon. The Medusa /store/* gate
  // requires the x-publishable-api-key header, which sendBeacon cannot set,
  // so every beacon was silently rejected at the gate (and sendBeacon's
  // "queued" success even suppressed this keyed fallback — which is why the
  // analytics table was empty). keepalive lets the request survive page
  // navigation/unload, covering the same case sendBeacon was meant for.
  void fetch(`${backendUrl}/store/analytics/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": publishableKey,
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Silently swallow — analytics must not disrupt user flow.
  })
}

export function trackPageView(entity_type: string, entity_id: string) {
  track({
    event_type: "page_view",
    entity_type,
    entity_id,
    metadata:
      typeof window !== "undefined"
        ? { path: window.location.pathname, referrer: document.referrer }
        : undefined,
  })
  // The conversion funnel's first step is product_view; before this fired
  // the admin funnel fell back to ALL page views (listings, guides, ...)
  // which inflated the step. A PDP view emits both: page_view feeds
  // per-entity counts, product_view feeds the funnel.
  if (entity_type === "product") {
    track({ event_type: "product_view", entity_type, entity_id })
  }
}

// Search-term logging (SOW Exhibit A §11.3). Debounced and deduped
// module-side so keystroke-driven callers can invoke it freely: only a
// query that survives 1.5s unchanged and differs from the last emitted
// one produces an event. entity_id is the normalized term so identical
// searches aggregate; the raw text and source surface ride in metadata.
let searchTimer: ReturnType<typeof setTimeout> | null = null
let lastEmittedSearch = ""

export function trackSearch(rawQuery: string, source: string) {
  if (typeof window === "undefined") return
  const normalized = rawQuery.trim().toLowerCase().replace(/\s+/g, " ")
  if (normalized.length < 3) return
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (normalized === lastEmittedSearch) return
    lastEmittedSearch = normalized
    track({
      event_type: "search",
      entity_type: "search_query",
      entity_id: normalized,
      metadata: { raw: rawQuery.trim(), source },
    })
  }, 1500)
}

export function trackButtonClick(
  entity_type: string,
  entity_id: string,
  button: string
) {
  track({
    event_type: "button_click",
    entity_type,
    entity_id,
    metadata: { button },
  })
}
