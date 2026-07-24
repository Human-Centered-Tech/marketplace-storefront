import type { MessageAttachment } from "@/lib/data/messaging"

/**
 * Client-side helper for message attachments (images + PDFs). Posts the raw
 * File as multipart to the /api/messaging/upload route handler, which forwards
 * it to the customer-authed backend as base64 JSON.
 *
 * Why an API route and not a server action: server-action multipart parsing
 * dies mid-stream on large/slow uploads with "Unexpected end of form" (Sentry
 * — fixed for barter 7/2 and for directory 7/10). Route handlers stream the
 * body reliably. Files must NEVER go through server actions.
 */

export const ATTACHMENT_MAX_MB = 10

export const ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "application/pdf",
]

/**
 * Upload one attachment. Never throws — every failure (network, auth,
 * validation, backend) comes back as `{ ok: false, error }`, so a failed
 * attachment can't take the message the user typed with it.
 */
export async function uploadMessageAttachment(
  file: File
): Promise<
  { ok: true; attachment: MessageAttachment } | { ok: false; error: string }
> {
  if (!file) return { ok: false, error: "No file selected" }
  if (file.type && !ATTACHMENT_TYPES.includes(file.type)) {
    return { ok: false, error: "Only images or PDFs are allowed" }
  }
  if (file.size > ATTACHMENT_MAX_MB * 1024 * 1024) {
    return {
      ok: false,
      error: `File too large (max ${ATTACHMENT_MAX_MB}MB)`,
    }
  }

  const fd = new FormData()
  fd.append("file", file)

  const res = await fetch("/api/messaging/upload", {
    method: "POST",
    body: fd,
  }).catch(() => null)
  if (!res) {
    return {
      ok: false,
      error: "Upload failed — check your connection and try again.",
    }
  }

  const body = (await res.json().catch(() => null)) as {
    attachment?: MessageAttachment
    error?: string
    message?: string
  } | null

  if (res.ok && body?.attachment?.url) {
    return { ok: true, attachment: body.attachment }
  }
  return {
    ok: false,
    error: body?.error || body?.message || "Upload failed",
  }
}
