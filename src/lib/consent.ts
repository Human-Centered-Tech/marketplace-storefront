/**
 * EU/EEA cookie-consent helpers.
 *
 * We are hosted on Railway edge, which — unlike Cloudflare/Vercel — injects no
 * visitor-country header, so there is no server-side geo signal to read in
 * middleware. Instead we use the browser's IANA time zone as a cheap, private,
 * dependency-free proxy for "this visitor is probably in the EEA/UK".
 *
 * It is a heuristic, deliberately:
 *   - over-inclusive (`Europe/*` catches non-EEA Europe like Moscow/Istanbul —
 *     showing them a banner is harmless),
 *   - fail-safe (if the time zone can't be resolved we assume consent IS
 *     required rather than silently skipping the banner),
 *   - and only decides whether to SHOW THE BANNER. Whether the GA tag itself
 *     may write cookies is additionally governed by Google Consent Mode region
 *     defaults (see EEA_REGION_CODES), which use Google's own IP geolocation.
 *     So a European visitor our heuristic misses is still covered by the tag's
 *     default-denied state.
 *
 * If the site ever sits behind Cloudflare, swap `isLikelyEeaVisitor()` for a
 * `CF-IPCountry` check in middleware — that is the only piece that changes.
 */

export const CONSENT_STORAGE_KEY = "co_cookie_consent"

/**
 * Bump when the set of things we ask consent FOR changes (e.g. if ad/remarketing
 * tags are ever added). A stored decision with an older version is ignored, so
 * affected visitors are re-prompted instead of being silently opted in.
 */
export const CONSENT_VERSION = 1

export type ConsentStatus = "unknown" | "granted" | "denied"

/**
 * Set `NEXT_PUBLIC_CONSENT_FORCE_BANNER=true` to show the banner regardless of
 * detected region — the only practical way to QA this from the US.
 */
export const CONSENT_FORCE_BANNER =
  process.env.NEXT_PUBLIC_CONSENT_FORCE_BANNER === "true"

/**
 * ISO-3166 codes for Google Consent Mode's `region` parameter: EU 27 + the
 * three EEA/EFTA states + UK + Switzerland (not EEA, but its revFADP mirrors
 * GDPR closely enough that treating it the same is the cheap safe call).
 */
export const EEA_REGION_CODES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", // EU 27
  "IS", "LI", "NO", // EEA/EFTA
  "GB", "CH", // UK + Switzerland
]

/**
 * EEA/GDPR-covered zones that do NOT start with "Europe/". Two groups:
 * Cyprus (canonically Asia/* on modern tzdata), and the EU outermost regions
 * and territories where GDPR applies (Spanish/Portuguese Atlantic islands,
 * Ceuta, the French DOMs).
 */
const EEA_TIME_ZONES = new Set([
  "Asia/Nicosia",
  "Asia/Famagusta",
  "Atlantic/Reykjavik",
  "Atlantic/Canary",
  "Atlantic/Madeira",
  "Atlantic/Azores",
  "Atlantic/Faroe",
  // Some ICU builds canonicalize Atlantic/Faroe to the older Faeroe spelling,
  // and Atlantic/Jan_Mayen to Arctic/Longyearbyen — list every form, since what
  // resolvedOptions() hands back depends on the browser's ICU version.
  "Atlantic/Faeroe",
  "Atlantic/Jan_Mayen",
  "Arctic/Longyearbyen",
  "Africa/Ceuta",
  "Indian/Reunion",
  "Indian/Mayotte",
  "America/Cayenne",
  "America/Guadeloupe",
  "America/Martinique",
  "America/Marigot",
  "America/St_Barthelemy",
  "America/Miquelon",
])

/**
 * Best-effort "is this visitor in the EEA/UK?". Returns true when detection
 * fails, so a browser that won't tell us gets the banner rather than silent
 * tracking.
 */
export function isLikelyEeaVisitor(): boolean {
  if (CONSENT_FORCE_BANNER) {
    return true
  }

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!timeZone) {
      return true
    }
    return timeZone.startsWith("Europe/") || EEA_TIME_ZONES.has(timeZone)
  } catch {
    return true
  }
}

type StoredConsent = {
  v: number
  status: Exclude<ConsentStatus, "unknown">
  ts: number
}

export function readStoredConsent(): ConsentStatus {
  if (typeof window === "undefined") {
    return "unknown"
  }

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) {
      return "unknown"
    }

    const parsed = JSON.parse(raw) as Partial<StoredConsent>
    if (parsed?.v !== CONSENT_VERSION) {
      return "unknown"
    }
    if (parsed.status === "granted" || parsed.status === "denied") {
      return parsed.status
    }
    return "unknown"
  } catch {
    // Malformed value, or storage blocked (Safari private mode / iframe).
    return "unknown"
  }
}

export function writeStoredConsent(status: Exclude<ConsentStatus, "unknown">) {
  if (typeof window === "undefined") {
    return
  }

  try {
    const payload: StoredConsent = {
      v: CONSENT_VERSION,
      status,
      ts: Date.now(),
    }
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Storage blocked — the choice applies to this page load only. Nothing we
    // can do, and it must not throw into the click handler.
  }
}
