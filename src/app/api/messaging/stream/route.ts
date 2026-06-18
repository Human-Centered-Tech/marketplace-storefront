import { cookies } from "next/headers"

// Same-origin SSE proxy. The browser's EventSource can't send an
// Authorization header, so it connects here (same origin) and we forward to
// the Medusa backend's /store/messaging/stream with the auth token read from
// the httpOnly cookie. The upstream stream is piped straight back.

const backendUrl = () =>
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

const publishableKey = () =>
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const token = (await cookies()).get("_medusa_jwt")?.value
  if (!token) {
    return new Response("Unauthorized", { status: 401 })
  }

  let upstream: Response
  try {
    upstream = await fetch(`${backendUrl()}/store/messaging/stream`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key": publishableKey(),
        Accept: "text/event-stream",
      },
      // Abort the upstream request when the browser disconnects.
      signal: req.signal,
      cache: "no-store",
    })
  } catch {
    return new Response("Upstream unavailable", { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: 502 })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
