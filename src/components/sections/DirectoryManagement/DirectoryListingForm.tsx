"use client"

import { useState } from "react"
import { DirectoryCategory, Parish } from "@/types/directory"

type DirectoryFormData = {
  business_name: string
  slug: string
  description: string
  category_id: string
  contact_email: string
  contact_phone: string
  website_url: string
  street: string
  city: string
  state: string
  zip: string
  facebook: string
  instagram: string
  twitter: string
  linkedin: string
}

type DirectoryListingFormProps = {
  initialData?: Partial<DirectoryFormData>
  categories: DirectoryCategory[]
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  submitLabel: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export const DirectoryListingForm = ({
  initialData,
  categories,
  onSubmit,
  submitLabel,
}: DirectoryListingFormProps) => {
  const [form, setForm] = useState<DirectoryFormData>({
    business_name: initialData?.business_name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    category_id: initialData?.category_id || "",
    contact_email: initialData?.contact_email || "",
    contact_phone: initialData?.contact_phone || "",
    website_url: initialData?.website_url || "",
    street: initialData?.street || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zip: initialData?.zip || "",
    facebook: initialData?.facebook || "",
    instagram: initialData?.instagram || "",
    twitter: initialData?.twitter || "",
    linkedin: initialData?.linkedin || "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setForm((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === "business_name" && !initialData?.slug) {
        updated.slug = slugify(value)
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      await onSubmit({
        business_name: form.business_name,
        slug: form.slug,
        description: form.description,
        category_id: form.category_id || undefined,
        contact_email: form.contact_email || undefined,
        contact_phone: form.contact_phone || undefined,
        website_url: form.website_url || undefined,
        address: {
          street: form.street || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          zip: form.zip || undefined,
        },
        social_links: {
          facebook: form.facebook || undefined,
          instagram: form.instagram || undefined,
          twitter: form.twitter || undefined,
          linkedin: form.linkedin || undefined,
        },
      })
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-sm text-sm">
          {error}
        </div>
      )}

      {/* Business Info */}
      <div>
        <h3 className="heading-sm text-primary mb-3">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-sm text-secondary block mb-1">
              Business Name *
            </label>
            <input
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              required
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label-sm text-secondary block mb-1">
              Category
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label-sm text-secondary block mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="heading-sm text-primary mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-sm text-secondary block mb-1">Email</label>
            <input
              name="contact_email"
              type="email"
              value={form.contact_email}
              onChange={handleChange}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">Phone</label>
            <input
              name="contact_phone"
              value={form.contact_phone}
              onChange={handleChange}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label-sm text-secondary block mb-1">
              Website
            </label>
            <input
              name="website_url"
              type="url"
              value={form.website_url}
              onChange={handleChange}
              placeholder="https://"
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="heading-sm text-primary mb-3">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label-sm text-secondary block mb-1">
              Street
            </label>
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">ZIP</label>
            <input
              name="zip"
              value={form.zip}
              onChange={handleChange}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="heading-sm text-primary mb-3">Social Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-sm text-secondary block mb-1">
              Facebook
            </label>
            <input
              name="facebook"
              value={form.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">
              Instagram
            </label>
            <input
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/..."
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">
              Twitter
            </label>
            <input
              name="twitter"
              value={form.twitter}
              onChange={handleChange}
              placeholder="https://twitter.com/..."
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">
              LinkedIn
            </label>
            <input
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/..."
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !form.business_name}
        className="bg-primary text-white px-6 py-2 rounded-sm text-sm uppercase font-medium disabled:opacity-50"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  )
}
