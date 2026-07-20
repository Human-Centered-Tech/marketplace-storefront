"use client"

import { useEffect, useRef, useState } from "react"
import {
  DirectoryCategory,
  DirectoryParishAffiliation,
  Parish,
} from "@/types/directory"
import { ParishAffiliationsSection } from "./ParishAffiliationsSection"
import { OWNER_INTERVIEW_QUESTIONS } from "@/lib/owner-interview"
import { ImageUploadField } from "./ImageUploadField"
import { GalleryUploadField } from "./GalleryUploadField"
import { US_STATES, US_STATE_CODES } from "@/lib/us-states"
import { SocialIcon } from "./SocialIcon"
import { socialFromUrl } from "@/lib/social"
import { normalizeExternalUrl } from "@/lib/helpers/external-url"

type DirectoryFormData = {
  business_name: string
  slug: string
  description: string
  category_id: string
  secondary_category_id: string
  contact_email: string
  contact_phone: string
  website_url: string
  street: string
  city: string
  state: string
  zip: string
  // States the business serves (2-letter codes). Drives the public
  // directory state filter; stored as a comma-separated string server-side.
  serviced_states: string[]
  // Up to 3 free-form social URLs; the platform/logo is detected per URL.
  social_links: string[]
  // When true, the listing's exact street address/pin is shown publicly on the
  // map. Resolved upstream from `listing.show_precise_location ??
  // listing.precise_location_default ?? false`, so local-only businesses arrive
  // pre-checked. Always sent to the backend as an explicit boolean.
  show_precise_location: boolean
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
  // Photo gallery (up to 8 listing images)
  gallery_urls: string[]
  // CTA
  cta_type: string
  cta_url: string
  // Logo + banner (cover) — business branding shown on the listing.
  logo_url: string
  cover_image_url: string
  // Per-day hours; a missing day = Closed. Ignored when always_open.
  hours_of_operation: Record<string, { open: string; close: string }>
}

const CTA_OPTIONS = [
  { value: "visit_shop", label: "Visit Our Shop (auto if merchant has shop)" },
  { value: "book_now", label: "Book Now" },
  { value: "shop_now", label: "Shop Now" },
  { value: "learn_more", label: "Learn More" },
  { value: "book_a_call", label: "Book a Call" },
]

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

type DirectoryListingFormProps = {
  initialData?: Partial<DirectoryFormData>
  categories: DirectoryCategory[]
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  submitLabel: string
  // Present only in edit mode. In edit, the parish section persists picks
  // live (it has a listing id); in create mode it runs "deferred" and reports
  // picks via onParishSelectionsChange for the create flow to apply post-save.
  listingId?: string
  subscriptionTier?: string
  initialAffiliations?: DirectoryParishAffiliation[]
  // Create mode only: receives the deferred parish selections so the create
  // page can attach them right after the listing is created.
  onParishSelectionsChange?: (parishes: Parish[]) => void
  // True when this business is a marketplace merchant with an ACTIVE shop on
  // Catholic Owned. Such listings are locked to the "Visit Our Shop" CTA so
  // directory discovery always routes buyers to their on-platform products.
  hasShop?: boolean
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
  listingId,
  subscriptionTier,
  initialAffiliations,
  onParishSelectionsChange,
  hasShop = false,
}: DirectoryListingFormProps) => {
  const [form, setForm] = useState<DirectoryFormData>({
    business_name: initialData?.business_name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    category_id: initialData?.category_id || "",
    secondary_category_id: initialData?.secondary_category_id || "",
    contact_email: initialData?.contact_email || "",
    contact_phone: initialData?.contact_phone || "",
    website_url: initialData?.website_url || "",
    street: initialData?.street || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zip: initialData?.zip || "",
    serviced_states: initialData?.serviced_states || [],
    social_links: initialData?.social_links || [],
    // Effective checked state is computed by the caller (edit page) as
    // listing.show_precise_location ?? listing.precise_location_default ?? false.
    // On create there's no listing yet, so it falls back to unchecked here.
    show_precise_location: initialData?.show_precise_location ?? false,
    always_open: initialData?.always_open ?? false,
    owner_photo_url: initialData?.owner_photo_url || "",
    owner_q1_prompt:
      initialData?.owner_q1_prompt ||
      "What inspired you to start this business?",
    owner_q1_answer: initialData?.owner_q1_answer || "",
    owner_q2_prompt:
      initialData?.owner_q2_prompt || "How does your faith shape your work?",
    owner_q2_answer: initialData?.owner_q2_answer || "",
    owner_q3_prompt:
      initialData?.owner_q3_prompt ||
      "What's a favorite patron saint or scripture?",
    owner_q3_answer: initialData?.owner_q3_answer || "",
    owner_q4_prompt:
      initialData?.owner_q4_prompt ||
      "What's one thing you'd like customers to know?",
    owner_q4_answer: initialData?.owner_q4_answer || "",
    devotional_image_url: initialData?.devotional_image_url || "",
    devotional_question: initialData?.devotional_question || "",
    devotional_answer: initialData?.devotional_answer || "",
    gallery_urls: initialData?.gallery_urls || [],
    // Merchants with a shop are locked to "visit_shop" regardless of any
    // previously-saved value.
    cta_type: hasShop ? "visit_shop" : initialData?.cta_type || "visit_shop",
    cta_url: initialData?.cta_url || "",
    logo_url: initialData?.logo_url || "",
    cover_image_url: initialData?.cover_image_url || "",
    hours_of_operation: initialData?.hours_of_operation || {},
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const errorRef = useRef<HTMLDivElement | null>(null)

  // The form is long enough that submitting from the bottom and getting
  // a top-of-form error banner is easy to miss. Scroll it into view.
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [error])

  const setField = (name: string, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }))

  // Per-day hours editor: blanking both open + close drops the day (= Closed).
  const setHours = (day: string, field: "open" | "close", value: string) =>
    setForm((prev) => {
      const cur = prev.hours_of_operation[day] || { open: "", close: "" }
      const next = { ...cur, [field]: value }
      const updated = { ...prev.hours_of_operation }
      if (!next.open && !next.close) delete updated[day]
      else updated[day] = next
      return { ...prev, hours_of_operation: updated }
    })

  const toggleServicedState = (code: string) =>
    setForm((prev) => {
      const has = prev.serviced_states.includes(code)
      return {
        ...prev,
        serviced_states: has
          ? prev.serviced_states.filter((c) => c !== code)
          : [...prev.serviced_states, code],
      }
    })

  const setServicedStates = (codes: string[]) =>
    setForm((prev) => ({ ...prev, serviced_states: codes }))

  // One of up to 3 free-form social URL slots.
  const setSocialLink = (index: number, value: string) =>
    setForm((prev) => {
      const next = [...prev.social_links]
      next[index] = value
      return { ...prev, social_links: next }
    })

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

    // On a NEW listing, fall back to the business's home state when no service
    // states were picked, so an address alone keeps them filterable instead of
    // invisible. In edit mode we respect the picker exactly — an empty set is
    // treated as a deliberate clear, not re-seeded.
    const homeState = form.state.trim().toUpperCase()
    const servicedStatesForSubmit =
      form.serviced_states.length > 0
        ? form.serviced_states
        : !listingId && US_STATE_CODES.includes(homeState)
          ? [homeState]
          : []

    try {
      await onSubmit({
        business_name: form.business_name,
        slug: form.slug,
        description: form.description,
        // First id = primary; second (optional) = additional. Backend writes
        // the M2M set and mirrors the primary onto category_id.
        category_ids: [form.category_id, form.secondary_category_id].filter(
          Boolean
        ),
        contact_email: form.contact_email || undefined,
        contact_phone: form.contact_phone || undefined,
        // Normalize so protocol-less entries ("www.example.com") don't render
        // as relative links on the public detail page.
        website_url: normalizeExternalUrl(form.website_url) || undefined,
        address: {
          street: form.street || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          zip: form.zip || undefined,
          // Default to the business's own state if they didn't pick any,
          // so setting an address alone makes them visible under that
          // state's directory filter rather than invisible everywhere.
          serviced_states: servicedStatesForSubmit,
        },
        social_links: {
          links: form.social_links
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 3),
        },
        always_open: form.always_open,
        // Explicit boolean — whether the public map shows this listing's exact
        // street-level location. The backend stores it on the listing.
        show_precise_location: form.show_precise_location,
        owner_interview:
          form.owner_q1_answer ||
          form.owner_q2_answer ||
          form.owner_q3_answer ||
          form.owner_q4_answer ||
          form.owner_photo_url
            ? {
                photo_url: form.owner_photo_url || undefined,
                // Questions are hardcoded — always submit the canonical prompts,
                // never an editable form value. (Backend also enforces this.)
                q1_prompt: OWNER_INTERVIEW_QUESTIONS[0],
                q1_answer: form.owner_q1_answer,
                q2_prompt: OWNER_INTERVIEW_QUESTIONS[1],
                q2_answer: form.owner_q2_answer,
                q3_prompt: OWNER_INTERVIEW_QUESTIONS[2],
                q3_answer: form.owner_q3_answer,
                q4_prompt: OWNER_INTERVIEW_QUESTIONS[3],
                q4_answer: form.owner_q4_answer,
              }
            : undefined,
        devotional:
          form.devotional_question || form.devotional_image_url
            ? {
                image_url: form.devotional_image_url || undefined,
                question: form.devotional_question || undefined,
                answer: form.devotional_answer || undefined,
              }
            : undefined,
        gallery_urls: form.gallery_urls,
        cta_type: form.cta_type,
        cta_url:
          form.cta_type === "visit_shop"
            ? undefined
            : normalizeExternalUrl(form.cta_url) || undefined,
        logo_url: form.logo_url || undefined,
        cover_image_url: form.cover_image_url || undefined,
        hours_of_operation: form.always_open
          ? undefined
          : Object.keys(form.hours_of_operation).length
            ? form.hours_of_operation
            : undefined,
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
        <div
          ref={errorRef}
          role="alert"
          aria-live="polite"
          className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-sm text-sm"
        >
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
          <div>
            <label className="label-sm text-secondary block mb-1">
              Primary category *
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
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
          <div>
            <label className="label-sm text-secondary block mb-1">
              Additional category (optional)
            </label>
            <select
              name="secondary_category_id"
              value={form.secondary_category_id}
              onChange={handleChange}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            >
              <option value="">None</option>
              {categories
                .filter((cat) => cat.id !== form.category_id)
                .map((cat) => (
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
            {/* NOT type="url": native validation ("Please enter a URL") fires
                on the protocol-less values we imported ourselves —
                "braunbookkeeping.co" — which is most of the Bubble set, so the
                owner can't save their own listing and the browser won't say
                why. normalizeExternalUrl adds the scheme on blur and on
                submit. */}
            <input
              name="website_url"
              type="text"
              inputMode="url"
              value={form.website_url}
              onChange={handleChange}
              onBlur={(e) => {
                const normalized = normalizeExternalUrl(e.target.value)
                if (normalized && normalized !== e.target.value) {
                  setForm((prev) => ({ ...prev, website_url: normalized }))
                }
              }}
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
            <label className="label-sm text-secondary block mb-1">Street</label>
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
                name="show_precise_location"
                checked={form.show_precise_location}
                onChange={handleChange}
              />
              Show my exact location on the map
            </label>
            <p className="text-xs text-secondary mt-1">
              Off by default. Turn this on to show your exact street location on
              the map so customers can find you. Leave it off if you work from
              home or don&rsquo;t want your street address shown publicly.
            </p>
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

      {/* Hours of Operation — per-day; leave a day blank to show Closed.
          Hidden when "Always open" is checked. */}
      {!form.always_open && (
        <div>
          <h3 className="heading-sm text-primary mb-3">Hours of Operation</h3>
          <p className="text-xs text-secondary mb-3">
            Set open and close times for each day. Leave a day blank to show it
            as Closed.
          </p>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const h = form.hours_of_operation[day]
              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-primary capitalize">
                    {day}
                  </span>
                  <input
                    type="time"
                    value={h?.open || ""}
                    onChange={(e) => setHours(day, "open", e.target.value)}
                    aria-label={`${day} opening time`}
                    className="border rounded-sm px-2 py-1 text-sm"
                  />
                  <span className="text-secondary text-sm">to</span>
                  <input
                    type="time"
                    value={h?.close || ""}
                    onChange={(e) => setHours(day, "close", e.target.value)}
                    aria-label={`${day} closing time`}
                    className="border rounded-sm px-2 py-1 text-sm"
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Logo & Banner — business branding shown on the public listing. */}
      <div>
        <h3 className="heading-sm text-primary mb-3">Logo &amp; Banner</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUploadField
            label="Logo"
            value={form.logo_url}
            onChange={(url) => setField("logo_url", url)}
            hint="Square works best (around 500×500px). JPG, PNG, or WebP, up to 10 MB."
          />
          <ImageUploadField
            label="Banner"
            value={form.cover_image_url}
            onChange={(url) => setField("cover_image_url", url)}
            hint="Wide image (around 1600×500px) shown across the top of your listing."
          />
        </div>
      </div>

      {/* Service area — which states this business serves. Drives the
          public directory state filter. */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="heading-sm text-primary">States You Serve</h3>
          <div className="flex gap-3 text-xs">
            <button
              type="button"
              onClick={() => setServicedStates(US_STATE_CODES)}
              className="text-secondary underline hover:no-underline"
            >
              Nationwide
            </button>
            <button
              type="button"
              onClick={() => setServicedStates([])}
              className="text-secondary underline hover:no-underline"
            >
              Clear
            </button>
          </div>
        </div>
        <p className="text-xs text-secondary mb-3">
          Pick every state you serve so customers there can find you in the
          directory. Leave blank to default to your business&apos;s state
          {form.serviced_states.length > 0
            ? ` — ${form.serviced_states.length} selected`
            : ""}
          .
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {US_STATES.map(({ code, name }) => {
            const on = form.serviced_states.includes(code)
            return (
              <button
                key={code}
                type="button"
                title={name}
                aria-pressed={on}
                onClick={() => toggleServicedState(code)}
                className={`px-2 py-1 text-xs rounded-sm border transition-colors ${
                  on
                    ? "border-transparent text-white"
                    : "border-gray-300 text-secondary hover:bg-gray-50"
                }`}
                style={on ? { backgroundColor: "#17294A" } : undefined}
              >
                {code}
              </button>
            )
          })}
        </div>
      </div>

      {/* Call-to-action */}
      <div>
        <h3 className="heading-sm text-primary mb-3">Listing Call-to-Action</h3>
        {hasShop ? (
          <>
            <p className="text-xs text-secondary mb-3">
              Because you have a shop on Catholic Owned, your call-to-action is
              set to{" "}
              <strong className="text-primary">
                &ldquo;Visit Our Shop&rdquo;
              </strong>{" "}
              — so visitors who discover you in the directory go straight to
              your products. This keeps your sales on-platform and can&rsquo;t
              be changed while your shop is active.
            </p>
            <div className="md:max-w-xs">
              <label className="label-sm text-secondary block mb-1">
                Button Type
              </label>
              <select
                name="cta_type"
                value="visit_shop"
                onChange={handleChange}
                disabled
                aria-readonly="true"
                className="w-full border rounded-sm px-3 py-2 text-sm bg-gray-50 text-secondary cursor-not-allowed"
              >
                <option value="visit_shop">Visit Our Shop</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-secondary mb-3">
              If you have a shop on Catholic Owned, the CTA defaults to
              &ldquo;Visit Our Shop.&rdquo; Otherwise pick a button type and
              provide a URL.
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
                    type="text"
                    inputMode="url"
                    value={form.cta_url}
                    onChange={handleChange}
                    onBlur={(e) => {
                      const normalized = normalizeExternalUrl(e.target.value)
                      if (normalized && normalized !== e.target.value) {
                        setForm((prev) => ({ ...prev, cta_url: normalized }))
                      }
                    }}
                    placeholder="https://"
                    className="w-full border rounded-sm px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Photo Gallery */}
      <div>
        <h3 className="heading-sm text-primary mb-3">Photos</h3>
        <p className="text-xs text-secondary mb-3">
          Optional — add up to 8 photos of your business, products, or space.
          Shown as a gallery on your public listing.
        </p>
        <GalleryUploadField
          label="Listing photos"
          value={form.gallery_urls}
          onChange={(urls) =>
            setForm((prev) => ({ ...prev, gallery_urls: urls }))
          }
          max={8}
        />
      </div>

      {/* Owner Interview — Featured/Enterprise only (matches the public-listing
          gate at DirectoryDetail). Local/Verified vendors shouldn't be offered
          fields/onboarding steps for content that will never display. */}
      {(subscriptionTier === "featured" ||
        subscriptionTier === "enterprise") && (
        <div>
          <h3 className="heading-sm text-primary mb-3">Owner Interview</h3>
          <p className="text-xs text-secondary mb-3">
            Optional — share who&apos;s behind the business. Shown on your
            public listing.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <ImageUploadField
              label="Owner Photo"
              value={form.owner_photo_url}
              onChange={(url) => setField("owner_photo_url", url)}
              hint="Square photo works best (around 1000×1000px) — it's shown as a square. JPG, PNG, or WebP, up to 10 MB. Larger images are resized automatically."
            />
            {([1, 2, 3, 4] as const).map((n) => (
              <div key={n} className="border rounded-sm p-3 space-y-2">
                <div>
                  <label className="label-sm text-secondary block mb-1">
                    Question {n}
                  </label>
                  {/* Questions are fixed platform-wide — shown as static text.
                    Merchants edit only their answer below. */}
                  <p className="text-sm text-primary font-medium">
                    {OWNER_INTERVIEW_QUESTIONS[n - 1]}
                  </p>
                </div>
                <div>
                  <label className="label-sm text-secondary block mb-1">
                    Your answer
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
      )}

      {/* Parish Affiliations — shown in both create and edit. In edit
          (listingId present) picks persist live; in create the section runs
          deferred and reports selections up so the create page applies them
          once the listing exists. */}
      <ParishAffiliationsSection
        listingId={listingId}
        tier={subscriptionTier}
        initialAffiliations={initialAffiliations ?? []}
        onDeferredChange={onParishSelectionsChange}
      />

      {/* Devotional */}
      <div>
        <h3 className="heading-sm text-primary mb-3">Devotional</h3>
        <p className="text-xs text-secondary mb-3">
          Optional — a devotional image and reflection shown on your listing.
        </p>
        <div className="grid grid-cols-1 gap-4">
          <ImageUploadField
            label="Devotional Image"
            value={form.devotional_image_url}
            onChange={(url) => setField("devotional_image_url", url)}
            hint="Square image works best (around 1000×1000px) — it's shown as a square. JPG, PNG, or WebP, up to 10 MB. Larger images are resized automatically."
          />
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

      {/* Social Links — up to 3, any platform. The logo is detected from the URL. */}
      <div>
        <h3 className="heading-sm text-primary mb-3">Social Media</h3>
        <p className="text-xs text-secondary mb-3">
          Add up to 3 social profiles — any platform (Instagram, Facebook, X,
          LinkedIn, YouTube, TikTok, Pinterest, etc.). Paste the full URL and
          we&rsquo;ll show the right logo automatically.
        </p>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => {
            const value = form.social_links[i] || ""
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="shrink-0 w-9 h-9 rounded-lg bg-gray-100 text-navy-dark flex items-center justify-center">
                  {value.trim() ? (
                    <SocialIcon url={value} className="w-5 h-5" />
                  ) : (
                    <span className="text-secondary text-xs">{i + 1}</span>
                  )}
                </span>
                <input
                  value={value}
                  onChange={(e) => setSocialLink(i, e.target.value)}
                  placeholder="https://social-platform.com/your-business"
                  className="w-full border rounded-sm px-3 py-2 text-sm"
                  aria-label={
                    value.trim()
                      ? `Social link ${i + 1} (${socialFromUrl(value).label})`
                      : `Social link ${i + 1}`
                  }
                />
              </div>
            )
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !form.business_name}
        // Inline styles instead of Tailwind theme classes. The previous
        // `bg-primary text-white` resolved to transparent-on-gray because
        // the storefront's `--bg-primary` CSS variable isn't reliably
        // scoped through Next.js's CSS chunking for this client component
        // (and `text-white` falls back to the page's cascading `--outline`
        // color of #75777f). Inline-style this so it works regardless of
        // which CSS chunk landed in the bundle for this route.
        style={{
          backgroundColor: "#17294A",
          color: "#ffffff",
          opacity: submitting || !form.business_name ? 0.5 : 1,
          cursor: submitting || !form.business_name ? "not-allowed" : "pointer",
        }}
        className="px-6 py-2 rounded-sm text-sm uppercase font-medium"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  )
}
