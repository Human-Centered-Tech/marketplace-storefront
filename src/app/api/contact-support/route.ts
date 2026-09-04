import { NextResponse } from "next/server"

/**
 * Contact Support (sales page / quiz result). Forwards the form to the
 * backend, which emails support@catholicowned.com through the transactional
 * sender. Kept server-side so the publishable key never ships to the browser
 * in a form-post context and the backend URL is not exposed.
 */
const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 })
  }

  const forwarded = req.headers.get("x-forwarded-for") || ""
  try {
    const res = await fetch(`${BACKEND_URL}/store/support-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
        // Let the backend rate-limit by the real client, not by our server.
        "x-forwarded-for": forwarded,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "We couldn't send your message. Please try again." },
        { status: res.status }
      )
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[contact-support] forward failed", e)
    return NextResponse.json(
      { message: "We couldn't reach our support system. Please try again in a moment." },
      { status: 502 }
    )
  }
}
