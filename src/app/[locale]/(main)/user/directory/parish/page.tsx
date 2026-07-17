"use client"

import { useEffect, useState } from "react"
import { ParishAffiliationsSection } from "@/components/sections/DirectoryManagement/ParishAffiliationsSection"
import { DirectoryListing } from "@/types/directory"
import { getMyDirectoryListing } from "@/lib/data/directory-actions"
import { retrieveVendorStatus } from "@/lib/data/vendor"

// Parish affiliation on its own page, separate from the directory listing
// edit form. Parish add/remove save immediately via ParishAffiliationsSection's
// own server actions, so there's no form submit here — a "Done" button returns
// the vendor to wherever they came from (dashboard for merchants, the directory
// hub for plain Business Owners), mirroring the listing edit page.
export default function ParishAffiliationPage() {
  const [listing, setListing] = useState<DirectoryListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Listing requires the customer's auth token (httpOnly cookie) — the
    // server-action helper reads it via next/headers.
    getMyDirectoryListing()
      .then((listingResult) => {
        if (!listingResult.authenticated) {
          // Reverse-SSO handoff didn't establish a session on this device;
          // re-establish it through login and return here (rather than the
          // "No listing found" dead-end).
          setSigningIn(true)
          const seg = window.location.pathname.split("/").filter(Boolean)
          const locale = seg[0] || "us"
          const back = `/${locale}/user/directory/parish`
          window.location.href = `/${locale}/user?return_to=${encodeURIComponent(
            back
          )}`
          return
        }
        if (listingResult.listing) setListing(listingResult.listing)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDone = async () => {
    setLeaving(true)
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

  return (
    <main className="container py-8">
      <h1 className="heading-xl uppercase mb-6">Parish Affiliation</h1>
      <div className="max-w-3xl">
        <ParishAffiliationsSection
          listingId={listing.id}
          tier={listing.subscription_tier}
          initialAffiliations={listing.affiliations ?? []}
        />

        <button
          type="button"
          onClick={handleDone}
          disabled={leaving}
          // Inline styles for the same reason the listing form's submit button
          // uses them — the storefront's theme CSS vars aren't reliably scoped
          // through Next's CSS chunking for client components on this route.
          style={{
            backgroundColor: "#17294A",
            color: "#ffffff",
            opacity: leaving ? 0.5 : 1,
            cursor: leaving ? "not-allowed" : "pointer",
          }}
          className="mt-8 px-6 py-2 rounded-sm text-sm uppercase font-medium"
        >
          {leaving ? "…" : "Done"}
        </button>
      </div>
    </main>
  )
}
