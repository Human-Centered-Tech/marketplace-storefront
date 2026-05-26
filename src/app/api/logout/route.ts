import { NextResponse } from "next/server"

import { signout } from "@/lib/data/customer"

/**
 * GET-able logout endpoint.
 *
 * The vendor portal delegates authentication to the storefront via reverse
 * SSO (the `/api/vendor-handoff` flow). Its own "log out" only clears the
 * vendor-side token, so without also ending the storefront customer session
 * the handoff immediately re-authenticates the user — an endless reload loop.
 *
 * This route lets the vendor portal end the storefront session with a plain
 * redirect. It reuses the existing `signout()` server action, which clears the
 * customer + vendor tokens, revalidates caches, and redirects to `/`.
 */
export async function GET(request: Request) {
  await signout()
  // signout() redirects internally; this is a defensive fallback only.
  return NextResponse.redirect(new URL("/us/user", request.url))
}
