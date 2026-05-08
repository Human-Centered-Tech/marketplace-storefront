import { NextRequest, NextResponse } from "next/server"
import { cookies as nextCookies } from "next/headers"

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"
const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

/**
 * Email-verification redirect handler. The verification email links here
 * with `?token=...`; we proxy to the backend with the customer's auth
 * cookie + publishable key, then forward to the dashboard with a flash
 * query (`?email_verified=1` on success, `?email_verified=error` on fail).
 *
 * The user must be signed in for this to work — verifying as anon would
 * leak nothing (Medusa rejects without an actor) but the UX is to bounce
 * unauthenticated users to login first with return_to set.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) {
    return NextResponse.redirect(
      `${STOREFRONT_URL}/us/user?email_verified=error`
    )
  }

  const cookies = await nextCookies()
  const jwt = cookies.get("_medusa_jwt")?.value
  if (!jwt) {
    // Send them to login first; LoginForm.resolveReturnTo will bring them
    // back here with the token preserved.
    return NextResponse.redirect(
      `${STOREFRONT_URL}/us/user?return_to=${encodeURIComponent(
        `/us/verify-email?token=${token}`
      )}`
    )
  }

  try {
    const headers: Record<string, string> = {
      authorization: `Bearer ${jwt}`,
      "content-type": "application/json",
    }
    if (PUBLISHABLE_KEY) headers["x-publishable-api-key"] = PUBLISHABLE_KEY

    const res = await fetch(
      `${BACKEND_URL}/store/customers/me/verify-email`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ token }),
      }
    )

    if (!res.ok) {
      return NextResponse.redirect(
        `${STOREFRONT_URL}/us/user?email_verified=error`
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
