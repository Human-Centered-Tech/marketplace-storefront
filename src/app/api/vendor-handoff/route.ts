import { NextRequest, NextResponse } from "next/server"
import {
  getAuthHeaders,
  getVendorToken,
  removeVendorToken,
} from "@/lib/data/cookies"
import { isVendorTokenStale, mintVendorSession } from "@/lib/data/vendor"

const VENDOR_URL =
  process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:5173"
const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"

export async function GET(req: NextRequest) {
  let token = await getVendorToken()

  // [PART B] No usable vendor cookie (missing, or the pre-PR-#58 stale state:
  // a JWT with an empty actor_id) — but the customer is signed in on this
  // device. Mint a fresh seller token password-lessly from the customer
  // session instead of forcing a SECOND login. The backend endpoint is the
  // authority on ownership (email → member → seller_id); it returns null here
  // for non-vendors, so we only ever upgrade a genuine merchant. A freshly
  // minted token always carries a populated actor_id, so it hands off cleanly.
  if (!token || (await isVendorTokenStale(token))) {
    const minted = await mintVendorSession()
    if (minted) {
      token = minted
    }
  }

  // [PART A] Still no token. Two cases:
  //   • NOT signed in on this device (the cross-device / in-app-browser case):
  //     send them to the login WITH return_to so a successful login lands back
  //     HERE (→ vendor dashboard) instead of stranding on /user. The login
  //     itself (lib/data/customer.login) mints a vendor token when the account
  //     is a merchant, so the return trip hands off cleanly.
  //   • SIGNED IN but we still couldn't mint (the caller isn't a vendor, or a
  //     transient failure): do NOT carry return_to — UserPage auto-redirects
  //     authenticated users to return_to, which would ping-pong /us/user ↔
  //     /api/vendor-handoff. Land them on /us/user instead.
  if (!token) {
    const customerHeaders = await getAuthHeaders()
    const signedIn = customerHeaders && "authorization" in customerHeaders
    if (signedIn) {
      return NextResponse.redirect(new URL("/us/user", STOREFRONT_URL))
    }
    const returnTo =
      req.nextUrl.searchParams.get("return_to") || "/api/vendor-handoff"
    return NextResponse.redirect(
      new URL(
        `/us/user?return_to=${encodeURIComponent(returnTo)}`,
        STOREFRONT_URL
      )
    )
  }

  // Token still stale and we couldn't mint a fresh one: handing it off would
  // land the vendor app in a /dashboard ↔ /login#handoff= reload loop because
  // every authenticated /vendor/* call 401s. Clear the cookie and bounce to a
  // password-prompt page that re-mints a token with a populated actor_id.
  if (await isVendorTokenStale(token)) {
    await removeVendorToken()
    return NextResponse.redirect(
      new URL("/us/user/become-vendor?session_refresh=1", STOREFRONT_URL)
    )
  }

  // NOTE: we intentionally do NOT bounce unverified merchants to the
  // storefront /user page here. A brand-new vendor is always unverified at
  // this moment (they haven't clicked the verify link yet), so doing so dumped
  // every new signup onto the consumer profile page instead of the merchant
  // app. The vendor app's ProtectedRoute already routes unverified merchants to
  // its own /verify-email screen (with resend), and the backend gates /vendor/*
  // regardless — so hand the token off and let the merchant context handle
  // verification.

  // Return an HTML page that redirects via JS to preserve the URL fragment.
  // Fragments (#) are never sent to servers, so the token won't appear in
  // server logs, proxy logs, or Referer headers.
  const targetUrl = `${VENDOR_URL}/login#handoff=${token}`

  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><script>window.location.replace(${JSON.stringify(targetUrl)})</script></head><body></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  )
}
