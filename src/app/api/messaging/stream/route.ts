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

  // Don't hand upstream.body to Response directly: when the browser drops
  // the EventSource (tab close, nav) or the upstream socket dies, the raw
  // pipe rejects and Next reports "failed to pipe response" to Sentry for
  // every ordinary disconnect. Re-wrap so those end as a clean close.
  const reader = upstream.body.getReader()
  const body = new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read()
        if (done) controller.close()
        else controller.enqueue(value)
      } catch {
        // client disconnect or upstream termination — normal for SSE
        try {
          controller.close()
        } catch {}
      }
    },
    cancel() {
      reader.cancel().catch(() => {})
    },
  })

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
