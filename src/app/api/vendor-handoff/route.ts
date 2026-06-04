import { NextResponse } from "next/server"
import { getVendorToken, removeVendorToken } from "@/lib/data/cookies"
import { isVendorTokenStale } from "@/lib/data/vendor"

const VENDOR_URL =
  process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:5173"
const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"

export async function GET() {
  const token = await getVendorToken()

  if (!token) {
    return NextResponse.redirect(new URL("/user", STOREFRONT_URL))
  }

  // Detect the pre-PR-#58 stale-token state: JWT with an empty
  // actor_id. Handing this off would land the vendor app in a
  // /dashboard ↔ /login#handoff= reload loop because every authenticated
  // /vendor/* call 401s. Clear the cookie and bounce to a
  // password-prompt page that re-mints a token with a populated
  // actor_id.
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
