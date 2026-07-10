"use client"

import { useRef, useState } from "react"
import {
  ACCEPTED_TYPES,
  MAX_UPLOAD_MB,
  friendlyUploadError,
  uploadDirectoryImage,
} from "@/lib/helpers/directory-upload"

const normalize = (u?: string | null) =>
  u && u.startsWith("//") ? `https:${u}` : u || ""

type ImageUploadFieldProps = {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
}

/**
 * Image picker for the directory-listing editor. Replaces the old "paste a
 * URL" inputs: the merchant selects a file, it's uploaded (multipart to the
 * /api/directory/upload route → customer-authed backend → MinIO), and the
 * returned URL is stored in the form just like before. Shows a preview of
 * the current image and a Remove control. Files must NEVER go through a
 * server action — see @/lib/helpers/directory-upload.
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

    // Validate client-side BEFORE uploading, so an oversized/unsupported
    // file gets an immediate, specific message instead of a round-trip.
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
      const res = await uploadDirectoryImage(file)
      if (res.ok) {
        onChange(res.url)
      } else {
        setError(res.error)
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
