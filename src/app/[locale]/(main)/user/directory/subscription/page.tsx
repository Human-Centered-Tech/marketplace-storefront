"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DirectorySubscriptionCard } from "@/components/sections/DirectoryManagement/DirectorySubscriptionCard"
import { ManagePaymentMethod } from "@/components/sections/DirectoryManagement/ManagePaymentMethod"
import { DirectoryListing } from "@/types/directory"

const VALID_TIERS = new Set([
  "local",
  "local_boost",
  // HIDDEN tier — deliberately NOT on the picker card or the onboarding
  // questionnaire. Essentials ($99, beyond-local, directory-only) is for the
  // edge case of product businesses that can't/won't sell on the marketplace
  // (e.g. authors selling via Amazon). It's reachable only via an explicit
  // ?tier=essential link, which the dashboard go-live flow mints when an admin
  // manually sets the customer's recommended_tier to "essential".
  "essential",
  "merchant",
  "tier2_startup",
  "tier2_nonprofit",
  "tier2_business",
  "tier3",
  "tier4",
  "verified",
  "featured",
  "enterprise",
])

export default function DirectorySubscriptionPage() {
  const [listing, setListing] = useState<DirectoryListing | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  const backendUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      : "http://localhost:9000"

  useEffect(() => {
    // The chart-recommended tier — set on customer.metadata at register
    // and threaded through go-live's subscribe_url. Skip the picker
    // entirely when present and send them straight to Checkout.
    const tier = searchParams.get("tier")
    if (tier && VALID_TIERS.has(tier)) {
      router.replace(`/user/directory/checkout?tier=${tier}`)
      return
    }

    // Load THIS customer's own listing — not the public browse list.
    // `/store/directory/listings` is the unscoped public-browse endpoint
    // (returns the newest active/unclaimed listing globally), so `?limit=1`
    // there surfaced an unrelated merchant's name + tier. `/me` is
    // auth-scoped to the logged-in customer and returns their own record
    // even while subscription_status is still `pending`.
    fetch(`${backendUrl}/store/directory/listings/me`, {
      headers: {
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.listing) {
          setListing(data.listing)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [backendUrl, router, searchParams])

  const handleSelectTier = (tier: string) => {
    router.push(`/user/directory/checkout?tier=${tier}`)
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
        <p className="text-secondary">
          Create a directory listing first to manage your subscription.
        </p>
      </main>
    )
  }

  return (
    <main className="container py-8">
      <h1 className="heading-xl uppercase mb-2">Directory Subscription</h1>
      <p className="text-secondary mb-6">
        Choose a plan for your listing: {listing.business_name}
      </p>

      {/* Stripe sends the member back here with ?billing=updated after they
          close the portal. Stripe is the source of truth for what actually
          changed, so this only acknowledges the trip rather than claiming a
          specific change was saved. */}
      {searchParams.get("billing") === "updated" && (
        <p className="text-sm text-green-700 mb-4" role="status">
          You're back from Stripe. Any billing changes you made there are saved.
        </p>
      )}

      {/* "Update payment info from their own dashboard" (Matteo 8/18).
          Renders only when there's a membership to manage. */}
      <ManagePaymentMethod listing={listing as any} />

      <DirectorySubscriptionCard
        currentTier={listing.subscription_tier}
        subscriptionStatus={listing.subscription_status}
        onSelectTier={handleSelectTier}
      />
    </main>
  )
}
