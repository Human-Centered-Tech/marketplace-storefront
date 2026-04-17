"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DirectoryListing } from "@/types/directory"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const TIER_DETAILS: Record<
  string,
  { name: string; price: string; annual: string; features: string[] }
> = {
  verified: {
    name: "Verified",
    price: "$50",
    annual: "$50/year",
    features: [
      "Business Directory listing",
      "1 parish affiliation",
      "Search visibility",
      "Marketplace product listings",
      "Verified business badge",
    ],
  },
  featured: {
    name: "Featured",
    price: "$400",
    annual: "$400/year",
    features: [
      "Everything in Verified",
      "Featured placement in directory",
      "3 parish affiliations",
      "Priority search ranking",
      "Analytics dashboard",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: "$2,000",
    annual: "$2,000/year",
    features: [
      "Everything in Featured",
      "Top placement across the platform",
      "10 parish affiliations",
      "Full analytics suite",
      "Dedicated support",
      "Custom partnership badge",
    ],
  },
}

export default function DirectoryCheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tier = searchParams.get("tier") || "verified"
  const tierInfo = TIER_DETAILS[tier] || TIER_DETAILS.verified

  const [listing, setListing] = useState<DirectoryListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState("")

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

  const handlePurchase = async () => {
    if (!listing) return
    setPurchasing(true)
    setError("")

    try {
      const successUrl = `${window.location.origin}/user/directory/success?tier=${tier}`
      const cancelUrl = `${window.location.origin}/user/directory/checkout?tier=${tier}`

      const res = await fetch(`${backendUrl}/store/directory/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        credentials: "include",
        body: JSON.stringify({
          listing_id: listing.id,
          tier,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      })

      const data = await res.json()
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        setError(data.message || "Could not start checkout")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setPurchasing(false)
    }
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
          No directory listing found. Please{" "}
          <LocalizedClientLink
            href="/user/directory/create"
            className="text-action underline"
          >
            create a listing
          </LocalizedClientLink>{" "}
          first.
        </p>
      </main>
    )
  }

  return (
    <main className="container py-12">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
          <LocalizedClientLink href="/sell" className="hover:text-primary">
            For Businesses
          </LocalizedClientLink>
          <span>/</span>
          <LocalizedClientLink
            href="/user/directory/subscription"
            className="hover:text-primary"
          >
            Choose Plan
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-primary font-medium">Checkout</span>
        </nav>

        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-navy-dark mb-2">
          Confirm Your Subscription
        </h1>
        <p className="text-secondary mb-10">
          Review your selected plan for{" "}
          <span className="font-medium text-primary">
            {listing.business_name}
          </span>
        </p>

        {/* Order Summary Card */}
        <div className="bg-[#FAF9F5] rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] font-bold text-gold-dark tracking-[0.2em] uppercase mb-1">
                {tierInfo.name} Plan
              </p>
              <p className="font-serif text-4xl font-bold text-navy-dark">
                {tierInfo.price}
                <span className="text-base font-normal text-secondary">
                  /year
                </span>
              </p>
            </div>
            <LocalizedClientLink
              href={`/user/directory/subscription`}
              className="text-xs text-action underline"
            >
              Change plan
            </LocalizedClientLink>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-[10px] font-bold text-secondary tracking-[0.15em] uppercase mb-3">
              What&apos;s included
            </p>
            <ul className="space-y-2">
              {tierInfo.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-primary"
                >
                  <span className="material-symbols-outlined text-green-600 text-base">
                    check_circle
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between px-2 mb-8">
          <span className="text-lg font-medium text-primary">
            Total due today
          </span>
          <span className="font-serif text-2xl font-bold text-navy-dark">
            {tierInfo.price}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-sm text-sm mb-6">
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handlePurchase}
          disabled={purchasing}
          className="w-full bg-navy text-white py-4 rounded-xl text-[13px] font-bold uppercase tracking-[0.15em] hover:bg-navy-dark transition-colors disabled:opacity-50"
        >
          {purchasing ? "Redirecting to payment..." : "Proceed to Payment"}
        </button>

        <p className="text-center text-xs text-secondary mt-4">
          You&apos;ll be redirected to our secure payment processor (Stripe).
          <br />
          Your subscription renews annually. Cancel any time from your dashboard.
        </p>
      </div>
    </main>
  )
}
