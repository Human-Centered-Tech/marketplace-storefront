"use client"

import { useRef, useState } from "react"
import { uploadDirectoryImage } from "@/lib/data/directory-actions"

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
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await uploadDirectoryImage(fd)
      if (res.ok) {
        onChange(res.url)
      } else {
        setError(res.error)
      }
    } catch (e: any) {
      setError(e?.message || "Upload failed")
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
