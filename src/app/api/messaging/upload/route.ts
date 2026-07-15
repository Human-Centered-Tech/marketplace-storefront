import { NextRequest, NextResponse } from "next/server"
import { cookies as nextCookies } from "next/headers"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const MAX_BYTES = 10 * 1024 * 1024

// Images + PDFs (matches what the message thread knows how to render).
const ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "application/pdf",
]

/**
 * Proxy for message-attachment uploads. The composer posts the raw File here
 * as multipart form data — files must NEVER go through a server action, whose
 * multipart parsing dies mid-stream with "Unexpected end of form" (the 7/2
 * barter fix, /api/barter/upload, and the 7/10 directory fix,
 * /api/directory/upload). This closes the last instance of that bug class.
 * We base64 the bytes server-side and forward to the backend's customer-authed
 * JSON upload endpoint with the auth cookie + pub key attached.
 *
 * Form fields: file (File)
 */
export async function POST(req: NextRequest) {
  const cookies = await nextCookies()
  const jwt = cookies.get("_medusa_jwt")?.value
  if (!jwt) {
    return NextResponse.json({ error: "not-authenticated" }, { status: 401 })
  }

  // req.formData() buffers the whole body before we can look at file.size, so
  // reject obviously-oversized requests from content-length first (1MB of
  // slack covers multipart framing overhead).
  const contentLength = Number(req.headers.get("content-length"))
  if (Number.isFinite(contentLength) && contentLength > MAX_BYTES + 1024 * 1024) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB)` },
      { status: 413 }
    )
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: "invalid-form-data" }, { status: 400 })
  }

  const file = form.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB)` },
      { status: 422 }
    )
  }
  if (!ATTACHMENT_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only images or PDFs are allowed" },
      { status: 422 }
    )
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")

  const headers: Record<string, string> = {
    authorization: `Bearer ${jwt}`,
    "content-type": "application/json",
  }
  if (PUBLISHABLE_KEY) headers["x-publishable-api-key"] = PUBLISHABLE_KEY

  const res = await fetch(`${BACKEND_URL}/store/directory/uploads`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      filename: file.name || "attachment",
      content_type: file.type,
      data_base64: base64,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    return new NextResponse(text || JSON.stringify({ error: "Upload failed" }), {
      status: res.status,
      headers: { "content-type": "application/json" },
    })
  }

  const body = (await res.json().catch(() => null)) as { url?: string } | null
  if (!body?.url) {
    return NextResponse.json({ error: "Upload failed" }, { status: 502 })
  }

  return NextResponse.json({
    attachment: {
      url: body.url,
      type: file.type,
      name: file.name,
      size: file.size,
    },
  })
}
