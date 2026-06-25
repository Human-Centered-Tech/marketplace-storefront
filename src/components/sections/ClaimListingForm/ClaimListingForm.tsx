"use client"

import { useState } from "react"
import { DirectoryListing } from "@/types/directory"

const FIELD_BASE =
  "w-full p-3 rounded-xl border border-[#001435]/15 bg-white text-[15px] text-[#001435] focus:border-[#BE9B32] focus:outline-none"

const LABEL_BASE =
  "text-[13px] font-semibold text-[#001435] mb-1 block tracking-wide"

const CLAIM_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

type ClaimEdits = {
  business_name: string
  description: string
  contact_email: string
  contact_phone: string
  website_url: string
  address: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
  always_open: boolean
  hours_of_operation: Record<string, { open: string; close: string }>
}

export const ClaimListingForm = ({
  listing,
}: {
  listing: DirectoryListing
}) => {
  const [edits, setEdits] = useState<ClaimEdits>({
    business_name: listing.business_name || "",
    description: listing.description || "",
    contact_email: listing.contact_email || "",
    contact_phone: listing.contact_phone || "",
    website_url: listing.website_url || "",
    address: {
      street: listing.address?.street || "",
      city: listing.address?.city || "",
      state: listing.address?.state || "",
      zip: listing.address?.zip || "",
    },
    always_open: Boolean(listing.always_open),
    hours_of_operation: listing.hours_of_operation || {},
  })
  // Per-day hours editor: blanking both open + close drops the day (= Closed).
  const setHours = (day: string, field: "open" | "close", value: string) =>
    setEdits((prev) => {
      const cur = prev.hours_of_operation[day] || { open: "", close: "" }
      const next = { ...cur, [field]: value }
      const updated = { ...prev.hours_of_operation }
      if (!next.open && !next.close) delete updated[day]
      else updated[day] = next
      return { ...prev, hours_of_operation: updated }
    })
  const [includeLocalBoost, setIncludeLocalBoost] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const backendUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      : "http://localhost:9000"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError("")

    try {
      const origin = window.location.origin
      const res = await fetch(
        `${backendUrl}/store/directory/listings/${listing.id}/claim`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
          credentials: "include",
          body: JSON.stringify({
            edits,
            include_local_boost: includeLocalBoost,
            success_url: `${origin}/directory/${listing.id}/claim/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/directory/${listing.id}/claim`,
          }),
        }
      )

      const data = await res.json()
      if (!res.ok) {
        setError(data?.message || `Checkout creation failed (${res.status})`)
        return
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        setError("No checkout URL returned")
      }
    } catch (err: any) {
      setError(err?.message || "Network error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="bg-[#FAF9F5] min-h-screen py-12 px-6">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <header>
          <p className="text-[#BE9B32] text-[12px] font-semibold uppercase tracking-[0.2em] mb-2">
            Claim {listing.business_name}
          </p>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-navy-dark mb-2">
            Confirm your listing details
          </h1>
          <p className="text-secondary text-sm leading-relaxed">
            Review and update the info we have on file. Once you complete the
            $99/yr payment, this becomes your listing — moderation will
            re-verify the changes within 1-2 business days.
          </p>
        </header>

        <section className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 space-y-4">
          <div>
            <label className={LABEL_BASE} htmlFor="business_name">
              Business name
            </label>
            <input
              id="business_name"
              className={FIELD_BASE}
              value={edits.business_name}
              onChange={(e) =>
                setEdits({ ...edits, business_name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className={LABEL_BASE} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className={`${FIELD_BASE} min-h-[120px]`}
              value={edits.description}
              onChange={(e) =>
                setEdits({ ...edits, description: e.target.value })
              }
              placeholder="Tell shoppers what you do, who you serve, and what sets you apart."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_BASE} htmlFor="contact_email">
                Contact email
              </label>
              <input
                id="contact_email"
                type="email"
                className={FIELD_BASE}
                value={edits.contact_email}
                onChange={(e) =>
                  setEdits({ ...edits, contact_email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className={LABEL_BASE} htmlFor="contact_phone">
                Contact phone
              </label>
              <input
                id="contact_phone"
                type="tel"
                className={FIELD_BASE}
                value={edits.contact_phone}
                onChange={(e) =>
                  setEdits({ ...edits, contact_phone: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className={LABEL_BASE} htmlFor="website_url">
              Website
            </label>
            <input
              id="website_url"
              type="url"
              className={FIELD_BASE}
              value={edits.website_url}
              onChange={(e) =>
                setEdits({ ...edits, website_url: e.target.value })
              }
              placeholder="https://example.com"
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 space-y-4">
          <h2 className="font-serif text-lg font-bold text-navy-dark">
            Location
          </h2>
          <div>
            <label className={LABEL_BASE} htmlFor="address_street">
              Street
            </label>
            <input
              id="address_street"
              className={FIELD_BASE}
              value={edits.address.street}
              onChange={(e) =>
                setEdits({
                  ...edits,
                  address: { ...edits.address, street: e.target.value },
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={LABEL_BASE} htmlFor="address_city">
                City
              </label>
              <input
                id="address_city"
                className={FIELD_BASE}
                value={edits.address.city}
                onChange={(e) =>
                  setEdits({
                    ...edits,
                    address: { ...edits.address, city: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className={LABEL_BASE} htmlFor="address_state">
                State
              </label>
              <input
                id="address_state"
                className={FIELD_BASE}
                value={edits.address.state}
                onChange={(e) =>
                  setEdits({
                    ...edits,
                    address: { ...edits.address, state: e.target.value },
                  })
                }
                maxLength={2}
              />
            </div>
            <div>
              <label className={LABEL_BASE} htmlFor="address_zip">
                ZIP
              </label>
              <input
                id="address_zip"
                className={FIELD_BASE}
                value={edits.address.zip}
                onChange={(e) =>
                  setEdits({
                    ...edits,
                    address: { ...edits.address, zip: e.target.value },
                  })
                }
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-[#44474e]">
            <input
              type="checkbox"
              checked={edits.always_open}
              onChange={(e) =>
                setEdits({ ...edits, always_open: e.target.checked })
              }
            />
            We&apos;re always open (24/7)
          </label>
          {!edits.always_open && (
            <div className="mt-4">
              <p className="text-[13px] text-[#44474e] mb-2">
                Hours of operation — leave a day blank to show it as Closed.
              </p>
              <div className="space-y-2">
                {CLAIM_DAYS.map((day) => {
                  const h = edits.hours_of_operation[day]
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <span className="w-24 text-[13px] text-[#001435] capitalize">
                        {day}
                      </span>
                      <input
                        type="time"
                        value={h?.open || ""}
                        onChange={(e) => setHours(day, "open", e.target.value)}
                        aria-label={`${day} opening time`}
                        className="rounded-lg border border-[#001435]/15 bg-white px-2 py-1 text-[13px]"
                      />
                      <span className="text-[13px] text-[#44474e]">to</span>
                      <input
                        type="time"
                        value={h?.close || ""}
                        onChange={(e) => setHours(day, "close", e.target.value)}
                        aria-label={`${day} closing time`}
                        className="rounded-lg border border-[#001435]/15 bg-white px-2 py-1 text-[13px]"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        <section className="bg-[#FAF9F5] rounded-2xl p-6 lg:p-8 border border-[#BE9B32]/40">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLocalBoost}
              onChange={(e) => setIncludeLocalBoost(e.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="block font-serif text-lg font-bold text-navy-dark">
                Add Local Boost &mdash; $150/month
              </span>
              <span className="block text-[13px] text-secondary leading-relaxed mt-1">
                30,000 local Catholic impressions delivered to your listing
                every month. We handle the ad setup. You can skip now and add
                it later from your dashboard.
              </span>
            </span>
          </label>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-navy-dark text-white font-semibold text-[13px] uppercase tracking-[0.15em] hover:bg-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting
            ? "Redirecting to payment…"
            : `Continue to Payment — $99/yr${includeLocalBoost ? " + $150/mo" : ""}`}
        </button>
        <p className="text-center text-xs text-secondary">
          You&apos;ll be redirected to Stripe for secure payment. Your
          listing publishes the moment payment succeeds.
        </p>
      </form>
    </main>
  )
}
