"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createBarterListing,
  uploadBarterImage,
} from "@/lib/data/barter"
import type { BarterCategory } from "@/types/barter"

const MAX_IMAGES = 8
const MAX_BYTES = 5 * 1024 * 1024

type ImageSlot = {
  file: File
  dataUrl: string
}

export const BarterCreateForm = ({
  categories,
}: {
  categories: BarterCategory[]
}) => {
  const router = useRouter()

  const [form, setForm] = useState({
    title: "",
    description: "",
    listing_type: "sell" as "sell" | "trade" | "barter" | "free",
    condition: "good" as "new" | "like_new" | "good" | "fair" | "poor",
    category_id: "",
    price: "",
    trade_terms: "",
    city: "",
    state: "",
    zip: "",
  })

  const [images, setImages] = useState<ImageSlot[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES} images per listing`)
      return
    }

    const slots: ImageSlot[] = []
    for (const file of files.slice(0, remaining)) {
      if (file.size > MAX_BYTES) {
        setError(`${file.name} exceeds ${MAX_BYTES / 1024 / 1024}MB — skipped`)
        continue
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsDataURL(file)
      })
      slots.push({ file, dataUrl })
    }

    setImages([...images, ...slots])
    setError(null)
    // Reset the file input so the same file can be re-selected
    e.target.value = ""
  }

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim(),
      listing_type: form.listing_type,
      condition: form.condition,
      category_id: form.category_id || undefined,
      trade_terms: form.trade_terms.trim() || undefined,
      location:
        form.city || form.state || form.zip
          ? {
              city: form.city || undefined,
              state: form.state || undefined,
              zip: form.zip || undefined,
            }
          : undefined,
    }
    if (form.listing_type === "sell" && form.price) {
      const cents = Math.round(parseFloat(form.price) * 100)
      if (!isNaN(cents)) payload.price = cents
    }

    const result = await createBarterListing(payload)
    if (!result.ok || !result.data?.listing) {
      setSubmitting(false)
      setError(result.error || "Failed to create listing")
      return
    }

    const listingId = result.data.listing.id

    // Upload images serially so sort_order is stable
    for (let i = 0; i < images.length; i++) {
      const up = await uploadBarterImage(listingId, images[i].dataUrl, i)
      if (!up.ok) {
        setError(
          `Listing created but image ${i + 1} failed: ${up.error || "unknown"}`
        )
      }
    }

    router.push(`/barter/${listingId}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basics */}
      <fieldset className="border border-[#d6d0c4]/40 rounded-xl bg-white p-5 space-y-4">
        <legend className="px-2 text-sm font-semibold text-[#17294A]">
          Basics
        </legend>

        <div>
          <label className="text-xs font-medium text-secondary block mb-1">
            Title *
          </label>
          <input
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            className="w-full border border-[#d6d0c4]/60 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-secondary block mb-1">
            Description *
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full border border-[#d6d0c4]/60 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">
              Type *
            </label>
            <select
              name="listing_type"
              value={form.listing_type}
              onChange={handleChange}
              className="w-full border border-[#d6d0c4]/60 rounded-lg px-3 py-2 text-sm"
            >
              <option value="sell">For sale</option>
              <option value="trade">Trade</option>
              <option value="barter">Barter</option>
              <option value="free">Free</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">
              Condition *
            </label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full border border-[#d6d0c4]/60 rounded-lg px-3 py-2 text-sm"
            >
              <option value="new">New</option>
              <option value="like_new">Like new</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        {categories.length > 0 && (
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">
              Category
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full border border-[#d6d0c4]/60 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">(uncategorized)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {form.listing_type === "sell" && (
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">
              Price (USD)
            </label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              className="w-full border border-[#d6d0c4]/60 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        )}

        {(form.listing_type === "trade" || form.listing_type === "barter") && (
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">
              What are you hoping to trade for?
            </label>
            <textarea
              name="trade_terms"
              rows={2}
              value={form.trade_terms}
              onChange={handleChange}
              className="w-full border border-[#d6d0c4]/60 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        )}
      </fieldset>

      {/* Location */}
      <fieldset className="border border-[#d6d0c4]/40 rounded-xl bg-white p-5 space-y-4">
        <legend className="px-2 text-sm font-semibold text-[#17294A]">
          Location
        </legend>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">
              City
            </label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full border border-[#d6d0c4]/60 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">
              State
            </label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full border border-[#d6d0c4]/60 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">
              ZIP
            </label>
            <input
              name="zip"
              value={form.zip}
              onChange={handleChange}
              className="w-full border border-[#d6d0c4]/60 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </fieldset>

      {/* Images */}
      <fieldset className="border border-[#d6d0c4]/40 rounded-xl bg-white p-5 space-y-4">
        <legend className="px-2 text-sm font-semibold text-[#17294A]">
          Photos ({images.length}/{MAX_IMAGES})
        </legend>

        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-lg overflow-hidden bg-[#faf9f5] border"
              >
                <img
                  src={img.dataUrl}
                  alt={`upload ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs hover:bg-black/80"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < MAX_IMAGES && (
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[#BE9B32] text-[#BE9B32] text-sm font-semibold cursor-pointer hover:bg-[#BE9B32]/5">
            Add photos
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddImages}
              className="hidden"
            />
          </label>
        )}
        <p className="text-xs text-secondary">
          Up to {MAX_IMAGES} images, 5MB each. First photo becomes the cover.
        </p>
      </fieldset>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={submitting || !form.title || !form.description}
          className="bg-[#17294A] text-white px-6 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider hover:bg-[#0d1a38] transition-colors disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Post Listing"}
        </button>
      </div>
    </form>
  )
}
