import { NextResponse } from "next/server"
import { cookies as nextCookies } from "next/headers"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

/**
 * Thin proxy that the UnverifiedEmailBanner calls to trigger a fresh
 * verification email. Lives on the storefront so the auth cookie + pub
 * key get attached server-side without exposing them to the browser.
 */
export async function POST() {
  const cookies = await nextCookies()
  const jwt = cookies.get("_medusa_jwt")?.value
  if (!jwt) {
    return NextResponse.json({ error: "not-authenticated" }, { status: 401 })
  }

  const headers: Record<string, string> = {
    authorization: `Bearer ${jwt}`,
    "content-type": "application/json",
  }
  if (PUBLISHABLE_KEY) headers["x-publishable-api-key"] = PUBLISHABLE_KEY

  const res = await fetch(
    `${BACKEND_URL}/store/customers/me/send-verification-email`,
    { method: "POST", headers }
  )
  const body = await res.text()
  return new NextResponse(body, {
    status: res.status,
    headers: { "content-type": "application/json" },
  })
}
