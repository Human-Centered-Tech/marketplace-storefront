"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DirectorySubscriptionCard } from "@/components/sections/DirectoryManagement/DirectorySubscriptionCard"
import { DirectoryListing } from "@/types/directory"

const VALID_TIERS = new Set([
  "local",
  "local_boost",
  "merchant",
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

    fetch(`${backendUrl}/store/directory/listings?limit=1`, {
      headers: {
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.listings?.length) {
          setListing(data.listings[0])
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

      <DirectorySubscriptionCard
        currentTier={listing.subscription_tier}
        subscriptionStatus={listing.subscription_status}
        onSelectTier={handleSelectTier}
      />
    </main>
  )
}
