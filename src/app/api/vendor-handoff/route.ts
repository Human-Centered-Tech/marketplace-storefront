import { NextResponse } from "next/server"
import { getVendorToken } from "@/lib/data/cookies"

const VENDOR_URL =
  process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:5173"

export async function GET() {
  const token = await getVendorToken()

  if (!token) {
    return NextResponse.redirect(
      new URL("/user", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000")
    )
  }

  // Return an HTML page that redirects via JS to preserve the URL fragment.
  // Fragments (#) are never sent to servers, so the token won't appear in
  // server logs, proxy logs, or Referer headers.
  const targetUrl = `${VENDOR_URL}/login#handoff=${token}`

  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><script>window.location.replace(${JSON.stringify(targetUrl)})</script></head><body></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  )
}
