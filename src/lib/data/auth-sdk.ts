import Medusa from "@medusajs/js-sdk"
import { sdk } from "../config"
import { forwardedClientIpHeaders } from "./client-ip"

/**
 * A request-scoped Medusa SDK that carries the real visitor IP.
 *
 * Why (7/28): `sdk.auth.login/register/logout` take no per-call headers, and
 * the shared `sdk` singleton can't hold a per-visitor one — it's module state
 * shared across concurrent requests. But auth runs through server ACTIONS, so
 * without forwarding, every login on the site arrives at the backend from this
 * server's IP and lands in ONE authRateLimit bucket: 10 auth requests per
 * minute for all users combined, counting logins, registrations, logouts and
 * token refreshes together. That's a brute-force cap that mostly throttles
 * real customers.
 *
 * A fresh client per call is cheap (it's a config object plus fetch), and
 * `globalHeaders` is the only hook the SDK exposes for this.
 *
 * Falls back to the shared singleton when CLAIM_IP_FORWARD_SECRET isn't
 * configured — identical behavior to before, so this is safe to deploy in any
 * order relative to the backend.
 */
export async function getRequestSdk(): Promise<typeof sdk> {
  const ipHeaders = await forwardedClientIpHeaders()
  if (!Object.keys(ipHeaders).length) {
    return sdk
  }

  // Must mirror lib/config.ts exactly apart from globalHeaders — a divergence
  // here would silently change auth behavior.
  return new Medusa({
    baseUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
    debug: process.env.NODE_ENV === "development",
    publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    globalHeaders: ipHeaders,
  })
}
