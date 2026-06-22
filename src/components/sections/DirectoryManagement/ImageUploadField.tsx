"use client"

import { useRef, useState } from "react"
import { uploadDirectoryImage } from "@/lib/data/directory-actions"

const normalize = (u?: string | null) =>
  u && u.startsWith("//") ? `https:${u}` : u || ""

const MAX_UPLOAD_MB = 10
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]

// Turn the various technical upload failures into something a merchant can
// act on. In production Next.js REDACTS thrown server-action errors (e.g. the
// body-size rejection) to a generic "omitted for security" message with only
// a digest — so a raw message is useless and we fall back to clear guidance.
const friendlyUploadError = (raw?: string): string => {
  const m = (raw || "").toLowerCase()
  if (
    /body exceeded|body size|content too large|payload too large|413|too large|exceeds the 10/.test(
      m
    )
  ) {
    return `That image is too large. Please upload a file under ${MAX_UPLOAD_MB} MB — most phones can export or share a smaller version.`
  }
  if (/unsupported image type|content[- ]?type|not.*(an )?image|invalid.*image/.test(m)) {
    return "That file type isn't supported. Please upload a JPG, PNG, or WebP image."
  }
  if (/no file|empty image/.test(m)) {
    return "Please choose an image to upload."
  }
  if (!raw || /server|digest|omitted|security|unexpected/.test(m)) {
    return `Sorry, that image couldn't be uploaded. Please try a different image under ${MAX_UPLOAD_MB} MB (JPG, PNG, or WebP).`
  }
  return raw
}

type ImageUploadFieldProps = {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
}

/**
 * Image picker for the directory-listing editor. Replaces the old "paste a
 * URL" inputs: the merchant selects a file, it's uploaded (via the
 * uploadDirectoryImage server action → customer-authed backend → MinIO), and
 * the returned URL is stored in the form just like before. Shows a preview of
 * the current image and a Remove control.
 */
export const ImageUploadField = ({
  label,
  value,
  onChange,
  hint,
}: ImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError("")

    // Validate client-side BEFORE calling the server action. An oversized
    // file would otherwise be rejected at the Next.js server-action body
    // boundary, which surfaces to the merchant as a redacted, unhelpful
    // "an error occurred (omitted for security)" message. Catching it here
    // lets us tell them exactly what's wrong.
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      const mb = (file.size / (1024 * 1024)).toFixed(1)
      setError(
        `This image is ${mb} MB, over the ${MAX_UPLOAD_MB} MB limit. Please upload a smaller image (JPG, PNG, or WebP) — most phones can export or share a smaller version.`
      )
      return
    }
    if (file.type && !ACCEPTED_TYPES.includes(file.type)) {
      setError(
        "That file type isn't supported. Please upload a JPG, PNG, or WebP image."
      )
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await uploadDirectoryImage(fd)
      if (res.ok) {
        onChange(res.url)
      } else {
        setError(friendlyUploadError(res.error))
      }
    } catch (e: any) {
      setError(friendlyUploadError(e?.message))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const preview = normalize(value)

  return (
    <div>
      <label className="label-sm text-secondary block mb-1">{label}</label>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 shrink-0 rounded-sm border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-gray-300 text-2xl">
              image
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-semibold uppercase tracking-wide px-3 py-2 rounded-sm border border-gray-300 hover:bg-gray-50 disabled:opacity-60"
            >
              {uploading
                ? "Uploading…"
                : preview
                  ? "Replace image"
                  : "Upload image"}
            </button>
            {preview && !uploading && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs font-semibold uppercase tracking-wide px-3 py-2 rounded-sm text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>
          {hint && <p className="text-xs text-secondary">{hint}</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
