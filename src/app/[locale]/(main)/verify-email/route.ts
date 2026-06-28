import { NextRequest, NextResponse } from "next/server"
import { cookies as nextCookies } from "next/headers"
import { revalidateTag } from "next/cache"
import { retrieveVendorStatus } from "@/lib/data/vendor"

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"
const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

/**
 * Email-verification redirect handler. The verification email links here
 * with `?token=...`. We verify via the TOKEN-ONLY backend endpoint
 * (`/store/customers/verify-email`), which needs no login session — the token
 * itself proves email ownership. This is the key fix: the email is almost
 * always opened without the customer's cookie (on their phone, or in the
 * Gmail/Outlook in-app browser), and the old /me endpoint forced a login wall
 * before they could verify.
 *
 * Post-verify redirect is session-aware:
 *  - already signed in (cookie present)  -> straight into the dashboard
 *    (or the vendor SSO handoff for active vendors), no re-login.
 *  - not signed in on this device        -> the /user page, which shows the
 *    login form with a "verified — please sign in" flash.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) {
    return NextResponse.redirect(
      `${STOREFRONT_URL}/us/user?email_verified=error`
    )
  }

  try {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    }
    if (PUBLISHABLE_KEY) headers["x-publishable-api-key"] = PUBLISHABLE_KEY

    const res = await fetch(`${BACKEND_URL}/store/customers/verify-email`, {
      method: "POST",
      headers,
      body: JSON.stringify({ token }),
    })

    if (!res.ok) {
      return NextResponse.redirect(
        `${STOREFRONT_URL}/us/user?email_verified=error`
      )
    }

    const cookies = await nextCookies()
    const jwt = cookies.get("_medusa_jwt")?.value

    // Not signed in on this device (the common cross-device email case):
    // verification still succeeded from the token. Send them to /user, which
    // renders the login form + a "verified, please sign in" flash.
    if (!jwt) {
      return NextResponse.redirect(
        `${STOREFRONT_URL}/us/user?email_verified=1`
      )
    }

    // Signed in: bust the customer cache so the dashboard's next render
    // reflects the freshly-flipped metadata.email_verified flag — without
    // this, the unverified banner sticks around (retrieveCustomer serves
    // stale cached data).
    const cacheId = cookies.get("_medusa_cache_id")?.value
    if (cacheId) revalidateTag(`customers-${cacheId}`)

    // If this customer is also an active vendor (i.e., they completed
    // Become a Merchant before verifying email), bounce them into the
    // vendor dashboard via SSO handoff rather than dropping them on the
    // generic /user page. retrieveVendorStatus only returns true on an
    // affirmative backend response — stale vendor cookies don't trigger
    // this branch (see PR #56).
    const vendorStatus = await retrieveVendorStatus()
    if (vendorStatus.isVendor) {
      // Carry return_to=/api/vendor-handoff so that if the handoff can't
      // complete silently (e.g. opened in an in-app browser / on another
      // device where the vendor token can't be minted) and falls back to a
      // login, that login lands back in the handoff (→ dashboard) instead of
      // stranding the merchant on the consumer /user page.
      const returnTo = encodeURIComponent("/api/vendor-handoff")
      return NextResponse.redirect(
        `${STOREFRONT_URL}/api/vendor-handoff?return_to=${returnTo}`
      )
    }

    return NextResponse.redirect(
      `${STOREFRONT_URL}/us/user?email_verified=1`
    )
  } catch {
    return NextResponse.redirect(
      `${STOREFRONT_URL}/us/user?email_verified=error`
    )
  }
}
