"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DirectorySubscriptionCard } from "@/components/sections/DirectoryManagement/DirectorySubscriptionCard"
import { DirectoryListing } from "@/types/directory"

export default function DirectorySubscriptionPage() {
  const [listing, setListing] = useState<DirectoryListing | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const backendUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      : "http://localhost:9000"

  useEffect(() => {
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
  }, [backendUrl])

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
