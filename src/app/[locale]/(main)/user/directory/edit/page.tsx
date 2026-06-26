"use client"

import { useEffect, useState } from "react"
import { DirectoryListingForm } from "@/components/sections/DirectoryManagement/DirectoryListingForm"
import { DirectoryCategory, DirectoryListing } from "@/types/directory"
import {
  getMyDirectoryListing,
  updateDirectoryListing,
} from "@/lib/data/directory-actions"
import { socialLinksToArray } from "@/lib/social"
import { US_STATE_CODES } from "@/lib/us-states"

export default function EditDirectoryListingPage() {
  const [categories, setCategories] = useState<DirectoryCategory[]>([])
  const [listing, setListing] = useState<DirectoryListing | null>(null)
  const [loading, setLoading] = useState(true)

  const backendUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      : "http://localhost:9000"

  useEffect(() => {
    const headers: Record<string, string> = {
      "x-publishable-api-key":
        process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
    }

    Promise.all([
      // Categories are public — fine to fetch unauthenticated.
      fetch(`${backendUrl}/store/directory/categories`, { headers }).then((r) =>
        r.json()
      ),
      // Listing requires the customer's auth token, which lives in an
      // httpOnly cookie not readable from this client component. Use
      // the server-action helper which reads the cookie via next/headers.
      getMyDirectoryListing(),
    ])
      .then(([catData, listingData]) => {
        setCategories(catData.categories || [])
        if (listingData) setListing(listingData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [backendUrl])

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!listing) return

    const res = await updateDirectoryListing(listing.id, data)
    if (!res.ok) {
      throw new Error(res.error || "Failed to update listing")
    }

    // Vendors arrive here via the setup-checklist storefront handoff from
    // the vendor dashboard. After saving, send them straight back to the
    // dashboard so the catholic_owned checklist rows reflect the edit.
    // Cross-origin nav, so use window.location instead of next/navigation.
    const vendorUrl =
      process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:5173"
    window.location.assign(`${vendorUrl}/dashboard`)
  }

  if (loading) {
    return (
      <main className="container py-8">
        <p className="text-secondary">Loading...</p>
      </main>
    )
  }

  if (!listing) {
    return (
      <main className="container py-8">
        <p className="text-secondary">No listing found. Create one first.</p>
      </main>
    )
  }

  const addr = listing.address as any
  const interview = listing.owner_interview as any
  const devotional = listing.devotional as any

  return (
    <main className="container py-8">
      <h1 className="heading-xl uppercase mb-6">Edit Directory Listing</h1>
      <div className="max-w-3xl">
        <DirectoryListingForm
          listingId={listing.id}
          subscriptionTier={listing.subscription_tier}
          initialAffiliations={listing.affiliations ?? []}
          // listing.seller is populated only when this business is a marketplace
          // merchant with an ACTIVE shop — lock the CTA to "Visit Our Shop".
          hasShop={Boolean((listing as any).seller)}
          initialData={{
            business_name: listing.business_name,
            slug: listing.slug,
            description: listing.description || "",
            category_id: listing.category_id || "",
            // Pre-fill the additional (non-primary) category from the pivot.
            secondary_category_id:
              listing.category_links?.find((l) => !l.is_primary)?.category_id ||
              "",
            contact_email: listing.contact_email || "",
            contact_phone: listing.contact_phone || "",
            website_url: listing.website_url || "",
            street: addr?.street || "",
            city: addr?.city || "",
            state: addr?.state || "",
            zip: addr?.zip || "",
            // Stored as a comma-separated string; the picker works in codes.
            // Restrict to real US state codes (US_STATE_CODES, which excludes
            // DC) so a legacy/imported value like "DC" is dropped on load —
            // otherwise it stays in form state (counted as "selected" and
            // re-saved) even though the picker has no DC button to show it.
            serviced_states: (addr?.serviced_states || "")
              .split(",")
              .map((s: string) => s.trim().toUpperCase())
              .filter((s: string) => US_STATE_CODES.includes(s)),
            social_links: socialLinksToArray(listing.social_links),
            always_open: listing.always_open ?? false,
            owner_photo_url: interview?.photo_url || "",
            owner_q1_prompt: interview?.q1_prompt,
            owner_q1_answer: interview?.q1_answer || "",
            owner_q2_prompt: interview?.q2_prompt,
            owner_q2_answer: interview?.q2_answer || "",
            owner_q3_prompt: interview?.q3_prompt,
            owner_q3_answer: interview?.q3_answer || "",
            owner_q4_prompt: interview?.q4_prompt,
            owner_q4_answer: interview?.q4_answer || "",
            devotional_image_url: devotional?.image_url || "",
            devotional_question: devotional?.question || "",
            devotional_answer: devotional?.answer || "",
            gallery_urls: listing.gallery_urls || [],
            cta_type: listing.cta_type || "visit_shop",
            cta_url: listing.cta_url || "",
            logo_url: listing.logo_url || "",
            cover_image_url: listing.cover_image_url || "",
            hours_of_operation: listing.hours_of_operation || {},
          }}
          categories={categories}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </main>
  )
}
