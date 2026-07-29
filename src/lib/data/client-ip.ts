import { headers } from "next/headers"

/**
 * Forward the real visitor IP to the backend on abuse-sensitive writes.
 *
 * Why this exists (7/28): the claim/attach/progress helpers are server
 * ACTIONS — the browser talks to the Next server, and the Next server talks
 * to Medusa. So the backend's per-IP rate limiter saw the storefront's egress
 * address for every visitor on earth and collapsed them all into one bucket.
 * A bot walking the whole directory was indistinguishable from normal traffic,
 * and per-IP caps on those routes were decorative.
 *
 * A client-supplied header is obviously forgeable, so the backend only trusts
 * `x-co-client-ip` when `x-co-ip-secret` matches CLAIM_IP_FORWARD_SECRET —
 * a value only the storefront and the backend hold. Unset on either side =
 * the backend ignores the header and falls back to today's behavior.
 */
export async function forwardedClientIpHeaders(): Promise<
  Record<string, string>
> {
  const secret = process.env.CLAIM_IP_FORWARD_SECRET
  if (!secret) return {}

  try {
    const h = await headers()
    // Each proxy hop APPENDS the address it received the connection from, so
    // the entries our own trusted edge adds are on the RIGHT. Read the
    // Nth-from-rightmost (Railway edge = 1) — the left side is caller-controlled.
    // Mirrors clientKey() in the backend's rate-limit middleware.
    const trusted = Math.max(1, Number(process.env.TRUSTED_PROXY_COUNT) || 1)
    const parts = (h.get("x-forwarded-for") || "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
    const ip = parts.length >= trusted ? parts[parts.length - trusted] : ""
    if (!ip) return {}
    return { "x-co-client-ip": ip, "x-co-ip-secret": secret }
  } catch {
    // headers() outside a request scope — nothing to forward.
    return {}
  }
}
