import { NextRequest, NextResponse } from "next/server"

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"

/**
 * OAuth return handler. The backend's /auth-bridge/google route does the
 * customer registration + token refresh, then redirects here with the
 * customer-session JWT in `?token=`. We set it as a cookie and forward to
 * the post-login destination.
 *
 * This is a Route Handler, not a Server Component, so cookie writes
 * actually propagate (Server Components in Next.js 15 are read-only for
 * cookies — the previous page.tsx version silently dropped writes).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const token = searchParams.get("token")
  const error = searchParams.get("error")
  const returnTo = searchParams.get("return_to")

  if (error) {
    return NextResponse.redirect(
      `${STOREFRONT_URL}/us/user?sso_error=${encodeURIComponent(error)}`
    )
  }
  if (!token) {
    return NextResponse.redirect(`${STOREFRONT_URL}/us/user?sso_error=missing-token`)
  }

  const safeReturn = returnTo && returnTo.startsWith("/") ? returnTo : "/us/user"
  const dest = safeReturn.startsWith("http")
    ? safeReturn
    : `${STOREFRONT_URL}${safeReturn}`

  const response = NextResponse.redirect(dest)
  response.cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })

  // Merchants who sign in with Google used to land on the shopper dashboard:
  // the vendor cookie was only ever minted in the password login path, and
  // retrieveVendorStatus() short-circuits to "not a vendor" without it
  // (Scott Wajda, 8/19). Mint it here the same way the vendor handoff does —
  // /store/account/seller-token derives the seller from the caller's own
  // session with ownership + linkage checks, so a non-merchant just 403s.
  // Best-effort: a failure must never break the login itself.
  try {
    const res = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/account/seller-token`,
      {
        headers: {
          authorization: `Bearer ${token}`,
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        cache: "no-store",
      }
    )
    if (res.ok) {
      const { token: vendorToken } = await res.json()
      const payload = vendorToken
        ? JSON.parse(
            Buffer.from(vendorToken.split(".")[1], "base64").toString()
          )
        : null
      if (payload?.actor_id) {
        const secure = process.env.NODE_ENV === "production"
        response.cookies.set("_medusa_vendor_jwt", vendorToken, {
          maxAge: 60 * 60 * 24 * 7,
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure,
        })
        response.cookies.set("_is_vendor", "true", {
          maxAge: 60 * 60 * 24 * 7,
          httpOnly: false,
          sameSite: "lax",
          path: "/",
          secure,
        })
      }
    }
  } catch {
    // Not a vendor / backend hiccup — plain customer login proceeds.
  }

  return response
}
