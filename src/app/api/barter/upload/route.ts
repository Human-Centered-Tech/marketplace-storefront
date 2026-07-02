import { NextRequest, NextResponse } from "next/server"
import { cookies as nextCookies } from "next/headers"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const MAX_BYTES = 5 * 1024 * 1024

/**
 * Proxy for barter listing image uploads. The create form posts the raw
 * File here as multipart form data — server actions can't carry
 * multi-megabyte payloads (Sentry JAVASCRIPT-NEXTJS-S), route handlers
 * can. We base64 the bytes server-side and forward to the backend's
 * JSON endpoint with the auth cookie + pub key attached.
 *
 * Form fields: file (File), listing_id, sort_order (optional int)
 */
export async function POST(req: NextRequest) {
  const cookies = await nextCookies()
  const jwt = cookies.get("_medusa_jwt")?.value
  if (!jwt) {
    return NextResponse.json({ error: "not-authenticated" }, { status: 401 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: "invalid-form-data" }, { status: 400 })
  }

  const file = form.get("file")
  const listingId = form.get("listing_id")
  if (!(file instanceof File) || typeof listingId !== "string" || !listingId) {
    return NextResponse.json(
      { error: "file and listing_id are required" },
      { status: 400 }
    )
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

  const sortOrderRaw = form.get("sort_order")
  const sortOrder =
    typeof sortOrderRaw === "string" && sortOrderRaw !== ""
      ? parseInt(sortOrderRaw, 10)
      : undefined

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")

  const headers: Record<string, string> = {
    authorization: `Bearer ${jwt}`,
    "content-type": "application/json",
  }
  if (PUBLISHABLE_KEY) headers["x-publishable-api-key"] = PUBLISHABLE_KEY

  const res = await fetch(
    `${BACKEND_URL}/store/barter/listings/${encodeURIComponent(
      listingId
    )}/images`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        filename: file.name || undefined,
        base64_content: base64,
        mime_type: file.type || "image/jpeg",
        ...(Number.isFinite(sortOrder) ? { sort_order: sortOrder } : {}),
      }),
    }
  )
  const body = await res.text()
  return new NextResponse(body, {
    status: res.status,
    headers: { "content-type": "application/json" },
  })
}
