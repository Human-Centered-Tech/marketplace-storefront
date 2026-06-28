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

type TrackArgs = {
  event_type: EventType
  entity_type: string
  entity_id: string
  metadata?: Record<string, unknown>
}

const SESSION_KEY = "co_session_id"

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
      window.sessionStorage.setItem(SESSION_KEY, id)
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

  const body = JSON.stringify({
    ...args,
    session_id: getSessionId(),
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
