/**
 * Client-side helper for directory-listing image uploads (logo / cover /
 * owner photo / devotional / gallery). Posts the raw File as multipart to
 * the /api/directory/upload route handler, which forwards it to the
 * customer-authed backend as base64 JSON.
 *
 * Why an API route and not a server action: server-action multipart parsing
 * dies mid-stream on large/slow uploads with "Unexpected end of form"
 * (Sentry, POST /us/user/directory/edit) — the same class of bug fixed for
 * barter uploads on 7/2. Route handlers stream the body reliably. Files must
 * NEVER go through server actions.
 */

export const MAX_UPLOAD_MB = 10

export const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]

// Turn the various technical upload failures into something a merchant can
// act on.
export const friendlyUploadError = (raw?: string): string => {
  const m = (raw || "").toLowerCase()
  if (
    /body exceeded|body size|content too large|payload too large|413|too large|exceeds the 10/.test(
      m
    )
  ) {
    return `That image is too large. Please upload a file under ${MAX_UPLOAD_MB} MB — most phones can export or share a smaller version.`
  }
  if (
    /unsupported image type|content[- ]?type|not.*(an )?image|only images|invalid.*image/.test(
      m
    )
  ) {
    return "That file type isn't supported. Please upload a JPG, PNG, or WebP image."
  }
  if (/no file|empty image/.test(m)) {
    return "Please choose an image to upload."
  }
  if (/not-authenticated|not signed in|unauthorized|401/.test(m)) {
    return "Your session has expired. Please refresh the page and sign in again, then retry the upload."
  }
  if (!raw || /server|digest|omitted|security|unexpected|network|fetch/.test(m)) {
    return `Sorry, that image couldn't be uploaded. Please check your connection and try again with an image under ${MAX_UPLOAD_MB} MB (JPG, PNG, or WebP).`
  }
  return raw
}

/**
 * Upload one image; resolves to the stored public URL. Never throws — all
 * failures (network, auth, validation, backend) come back as a
 * merchant-readable `{ ok: false, error }`.
 */
export async function uploadDirectoryImage(
  file: File
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const fd = new FormData()
  fd.append("file", file)

  const res = await fetch("/api/directory/upload", {
    method: "POST",
    body: fd,
  }).catch(() => null)
  if (!res) {
    return { ok: false, error: friendlyUploadError("network") }
  }

  const body = await res
    .json()
    .catch(() => null as { url?: string; error?: string; message?: string } | null)

  if (res.ok && body?.url) {
    return { ok: true, url: body.url }
  }
  return {
    ok: false,
    error: friendlyUploadError(body?.error || body?.message),
  }
}
