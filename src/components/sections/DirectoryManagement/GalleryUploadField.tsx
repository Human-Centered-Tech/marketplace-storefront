"use client"

import { useRef, useState } from "react"
import { uploadDirectoryImage } from "@/lib/data/directory-actions"

const normalize = (u?: string | null) =>
  u && u.startsWith("//") ? `https:${u}` : u || ""

type GalleryUploadFieldProps = {
  label: string
  value: string[]
  onChange: (urls: string[]) => void
  max?: number
  hint?: string
}

/**
 * Multi-image picker for the directory listing gallery (up to `max` photos).
 * Reuses the same uploadDirectoryImage server action as ImageUploadField;
 * uploads each selected file and appends the returned URL. Shows thumbnails
 * with per-image remove controls.
 */
export const GalleryUploadField = ({
  label,
  value,
  onChange,
  max = 8,
  hint,
}: GalleryUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const atMax = value.length >= max

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return
    setError("")
    setUploading(true)
    const remaining = max - value.length
    const toUpload = Array.from(files).slice(0, remaining)
    const added: string[] = []
    try {
      for (const file of toUpload) {
        const fd = new FormData()
        fd.append("file", file)
        const res = await uploadDirectoryImage(fd)
        if (res.ok) {
          added.push(res.url)
        } else {
          setError(res.error)
          break
        }
      }
      if (added.length) onChange([...value, ...added])
      if (files.length > remaining) {
        setError(`Only ${max} photos allowed — extra files were skipped.`)
      }
    } catch (e: any) {
      setError(e?.message || "Upload failed")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  return (
    <div>
      <label className="label-sm text-secondary block mb-1">{label}</label>

      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative w-20 h-20 shrink-0 rounded-sm border border-gray-200 bg-gray-50 overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={normalize(url)}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-sm leading-none flex items-center justify-center hover:bg-black/80"
            >
              ×
            </button>
          </div>
        ))}

        {!atMax && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 shrink-0 rounded-sm border border-dashed border-gray-300 text-gray-400 hover:bg-gray-50 disabled:opacity-60 flex flex-col items-center justify-center"
          >
            <span className="material-symbols-outlined">
              {uploading ? "hourglass_empty" : "add_photo_alternate"}
            </span>
          </button>
        )}
      </div>

      <p className="text-xs text-secondary mt-1">
        {value.length}/{max} photos{hint ? ` — ${hint}` : ""}
      </p>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
