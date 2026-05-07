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
  return response
}
