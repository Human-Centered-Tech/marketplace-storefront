import { NextRequest, NextResponse } from "next/server"
import { cookies as nextCookies } from "next/headers"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const MAX_BYTES = 10 * 1024 * 1024

/**
 * Proxy for directory-listing image uploads (logo / cover / owner photo /
 * devotional / gallery). The listing editor posts the raw File here as
 * multipart form data — files must NEVER go through server actions, whose
 * multipart parsing dies mid-stream with "Unexpected end of form" (Sentry;
 * same class of bug as the 7/2 barter-upload fix — see /api/barter/upload).
 * We base64 the bytes server-side and forward to the backend's JSON endpoint
 * with the auth cookie + pub key attached.
 *
 * Form fields: file (File)
 */
export async function POST(req: NextRequest) {
  const cookies = await nextCookies()
  const jwt = cookies.get("_medusa_jwt")?.value
  if (!jwt) {
    return NextResponse.json({ error: "not-authenticated" }, { status: 401 })
  }

  // req.formData() buffers the entire body before we can check file.size, so
  // reject obviously-oversized requests up front from the content-length
  // header (1MB of slack over MAX_BYTES covers multipart framing overhead).
  const contentLength = Number(req.headers.get("content-length"))
  if (Number.isFinite(contentLength) && contentLength > MAX_BYTES + 1024 * 1024) {
    return NextResponse.json(
      { error: `Image too large (max ${MAX_BYTES / 1024 / 1024}MB)` },
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
      { error: `Image too large (max ${MAX_BYTES / 1024 / 1024}MB)` },
      { status: 422 }
    )
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images allowed" }, { status: 422 })
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
      filename: file.name || "image",
      content_type: file.type || "image/jpeg",
      data_base64: base64,
    }),
  })
  const body = await res.text()
  return new NextResponse(body, {
    status: res.status,
    headers: { "content-type": "application/json" },
  })
}
