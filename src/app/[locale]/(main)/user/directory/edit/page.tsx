"use client"

import { useEffect, useState } from "react"
import { DirectoryListingForm } from "@/components/sections/DirectoryManagement/DirectoryListingForm"
import { DirectoryCategory, DirectoryListing } from "@/types/directory"
import {
  getMyDirectoryListing,
  updateDirectoryListing,
} from "@/lib/data/directory-actions"
import { retrieveVendorStatus } from "@/lib/data/vendor"
import { socialLinksToArray } from "@/lib/social"
import { US_STATE_CODES } from "@/lib/us-states"

export default function EditDirectoryListingPage() {
  const [categories, setCategories] = useState<DirectoryCategory[]>([])
  const [listing, setListing] = useState<DirectoryListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)

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
      .then(([catData, listingResult]) => {
        setCategories(catData.categories || [])
        if (!listingResult.authenticated) {
          // No customer session reached the backend — the dashboard's
          // reverse-SSO handoff didn't establish one on this device (e.g. its
          // token mint failed and it bare-redirected here). The data is fine
          // (owner_id matches the account); we just need a session. Re-establish
          // it through login and return here, instead of the "No listing found"
          // dead-end.
          setSigningIn(true)
          const seg = window.location.pathname.split("/").filter(Boolean)
          const locale = seg[0] || "us"
          const back = `/${locale}/user/directory/edit`
          window.location.href = `/${locale}/user?return_to=${encodeURIComponent(
            back
          )}`
          return
        }
        if (listingResult.listing) setListing(listingResult.listing)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [backendUrl])

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!listing) return

    let res: Awaited<ReturnType<typeof updateDirectoryListing>>
    try {
      res = await updateDirectoryListing(listing.id, data)
    } catch {
      // Transport/framework failure — the action never completed and in
      // production Next redacts the real error to a useless digest message.
      // Re-throw something the form's error banner can show honestly, so the
      // save failure is never silent.
      throw new Error(
        "Your changes couldn't be saved — please check your connection and try again. Your edits are still in the form below."
      )
    }
    if (!res.ok) {
      throw new Error(res.error || "Failed to update listing")
    }

    // Where next depends on WHO saved (7/9 fix — this used to bounce
    // everyone to the vendor dashboard): merchants return to the dashboard
    // checklist; a plain Business Owner goes back to their directory hub.
    const { isVendor } = await retrieveVendorStatus().catch(() => ({
      isVendor: false,
    }))
    if (isVendor) {
      const vendorUrl =
        process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:5173"
      window.location.assign(`${vendorUrl}/dashboard`)
    } else {
      const seg = window.location.pathname.split("/").filter(Boolean)
      const locale = seg[0] || "us"
      window.location.assign(`/${locale}/user/directory`)
    }
  }

  if (loading || signingIn) {
    return (
      <main className="container py-8">
        <p className="text-secondary">
          {signingIn ? "Signing you in…" : "Loading..."}
        </p>
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

  // Draft-until-paid: a claimed-but-unpaid listing is unpublished (hidden
  // from the public directory) but stays fully editable — paying the
  // membership is what publishes it. Grandfathered claims
  // (metadata.bubble_paid === "yes") stay live throughout, so they get no
  // banner. Editing is never blocked here.
  // Scoped to claim_payment_due (the claim-draft marker) rather than any
  // non-active status: a fresh merchant-path listing is also "pending"
  // pre-go-live, but their payment path is the vendor dashboard's Go Live
  // ($99+11%), and this banner's subscription CTA would route them into
  // buying a parallel directory-tier membership.
  const meta = (listing as any).metadata || {}
  const unpaidDraft = meta.bubble_paid !== "yes" && !!meta.claim_payment_due

  const addr = listing.address as any
  const interview = listing.owner_interview as any
  const devotional = listing.devotional as any

  return (
    <main className="container py-8">
      <h1 className="heading-xl uppercase mb-6">Edit Directory Listing</h1>
      <div className="max-w-3xl">
        {unpaidDraft && (
          <div className="flex flex-wrap items-center justify-between gap-4 border border-[#BE9B32]/40 bg-[#BE9B32]/10 rounded-sm p-4 mb-6">
            <p className="text-sm text-secondary">
              Your listing is unpublished until you choose your membership —
              you can keep editing in the meantime, and it goes live as soon as
              payment is complete.
            </p>
            <a
              href="/user/directory/subscription"
              className="bg-navy text-white px-4 py-2 rounded-sm text-sm uppercase font-medium whitespace-nowrap"
            >
              Choose your membership
            </a>
          </div>
        )}
        <DirectoryListingForm
          listingId={listing.id}
          subscriptionTier={listing.subscription_tier}
          // listing.seller is populated only when this business is a marketplace
          // merchant with an ACTIVE shop that has published products — lock the
          // CTA to "Visit Our Shop".
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
            // Opt-in only: checked solely when the owner has explicitly turned
            // it on. Default off for everyone (no auto-expose nudge).
            show_precise_location: listing.show_precise_location ?? false,
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
