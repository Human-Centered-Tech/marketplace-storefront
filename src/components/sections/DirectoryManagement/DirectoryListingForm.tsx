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
  always_open: boolean
  // Owner interview
  owner_photo_url: string
  owner_q1_prompt: string
  owner_q1_answer: string
  owner_q2_prompt: string
  owner_q2_answer: string
  owner_q3_prompt: string
  owner_q3_answer: string
  owner_q4_prompt: string
  owner_q4_answer: string
  // Devotional
  devotional_image_url: string
  devotional_question: string
  devotional_answer: string
  // CTA
  cta_type: string
  cta_url: string
}

const CTA_OPTIONS = [
  { value: "visit_shop", label: "Visit Our Shop (auto if vendor has shop)" },
  { value: "book_now", label: "Book Now" },
  { value: "shop_now", label: "Shop Now" },
  { value: "learn_more", label: "Learn More" },
  { value: "book_a_call", label: "Book a Call" },
]

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
    always_open: initialData?.always_open ?? false,
    owner_photo_url: initialData?.owner_photo_url || "",
    owner_q1_prompt: initialData?.owner_q1_prompt || "What inspired you to start this business?",
    owner_q1_answer: initialData?.owner_q1_answer || "",
    owner_q2_prompt: initialData?.owner_q2_prompt || "How does your faith shape your work?",
    owner_q2_answer: initialData?.owner_q2_answer || "",
    owner_q3_prompt: initialData?.owner_q3_prompt || "What's a favorite patron saint or scripture?",
    owner_q3_answer: initialData?.owner_q3_answer || "",
    owner_q4_prompt: initialData?.owner_q4_prompt || "What's one thing you'd like customers to know?",
    owner_q4_answer: initialData?.owner_q4_answer || "",
    devotional_image_url: initialData?.devotional_image_url || "",
    devotional_question: initialData?.devotional_question || "",
    devotional_answer: initialData?.devotional_answer || "",
    cta_type: initialData?.cta_type || "visit_shop",
    cta_url: initialData?.cta_url || "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }
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
        always_open: form.always_open,
        owner_interview: form.owner_q1_answer || form.owner_q2_answer ||
          form.owner_q3_answer || form.owner_q4_answer || form.owner_photo_url
          ? {
              photo_url: form.owner_photo_url || undefined,
              q1_prompt: form.owner_q1_prompt,
              q1_answer: form.owner_q1_answer,
              q2_prompt: form.owner_q2_prompt,
              q2_answer: form.owner_q2_answer,
              q3_prompt: form.owner_q3_prompt,
              q3_answer: form.owner_q3_answer,
              q4_prompt: form.owner_q4_prompt,
              q4_answer: form.owner_q4_answer,
            }
          : undefined,
        devotional: form.devotional_question || form.devotional_image_url
          ? {
              image_url: form.devotional_image_url || undefined,
              question: form.devotional_question || undefined,
              answer: form.devotional_answer || undefined,
            }
          : undefined,
        cta_type: form.cta_type,
        cta_url: form.cta_type === "visit_shop" ? undefined : form.cta_url || undefined,
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
          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-secondary">
              <input
                type="checkbox"
                name="always_open"
                checked={form.always_open}
                onChange={handleChange}
              />
              Always open (skip hours of operation)
            </label>
          </div>
        </div>
      </div>

      {/* Call-to-action */}
      <div>
        <h3 className="heading-sm text-primary mb-3">Listing Call-to-Action</h3>
        <p className="text-xs text-secondary mb-3">
          If you have a shop on Catholic Owned, the CTA defaults to &ldquo;Visit
          Our Shop.&rdquo; Otherwise pick a button type and provide a URL.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-sm text-secondary block mb-1">
              Button Type
            </label>
            <select
              name="cta_type"
              value={form.cta_type}
              onChange={handleChange}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            >
              {CTA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {form.cta_type !== "visit_shop" && (
            <div>
              <label className="label-sm text-secondary block mb-1">
                Button URL *
              </label>
              <input
                name="cta_url"
                type="url"
                value={form.cta_url}
                onChange={handleChange}
                placeholder="https://"
                className="w-full border rounded-sm px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Owner Interview */}
      <div>
        <h3 className="heading-sm text-primary mb-3">Owner Interview</h3>
        <p className="text-xs text-secondary mb-3">
          Optional — share who&apos;s behind the business. Shown on your public
          listing.
        </p>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label-sm text-secondary block mb-1">
              Owner Photo URL
            </label>
            <input
              name="owner_photo_url"
              type="url"
              value={form.owner_photo_url}
              onChange={handleChange}
              placeholder="https://"
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          {([1, 2, 3, 4] as const).map((n) => (
            <div key={n} className="border rounded-sm p-3 space-y-2">
              <div>
                <label className="label-sm text-secondary block mb-1">
                  Question {n}
                </label>
                <input
                  name={`owner_q${n}_prompt`}
                  value={(form as any)[`owner_q${n}_prompt`]}
                  onChange={handleChange}
                  className="w-full border rounded-sm px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="label-sm text-secondary block mb-1">
                  Answer {n}
                </label>
                <textarea
                  name={`owner_q${n}_answer`}
                  value={(form as any)[`owner_q${n}_answer`]}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border rounded-sm px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Devotional */}
      <div>
        <h3 className="heading-sm text-primary mb-3">Devotional</h3>
        <p className="text-xs text-secondary mb-3">
          Optional — a devotional image and reflection shown on your listing.
        </p>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label-sm text-secondary block mb-1">
              Image URL
            </label>
            <input
              name="devotional_image_url"
              type="url"
              value={form.devotional_image_url}
              onChange={handleChange}
              placeholder="https://"
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">
              Question / Prompt
            </label>
            <input
              name="devotional_question"
              value={form.devotional_question}
              onChange={handleChange}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">
              Reflection
            </label>
            <textarea
              name="devotional_answer"
              value={form.devotional_answer}
              onChange={handleChange}
              rows={3}
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
