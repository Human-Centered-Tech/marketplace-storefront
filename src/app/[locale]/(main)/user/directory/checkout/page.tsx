"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DirectoryListing } from "@/types/directory"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import {
  createDirectorySubscriptionCheckout,
  getMyDirectoryListing,
} from "@/lib/data/directory-actions"

const TIER_DETAILS: Record<
  string,
  { name: string; price: string; annual: string; features: string[] }
> = {
  // Canva "Sales Page Logic" tier set (2026-05).
  local: {
    name: "Catholic Owned Local",
    price: "$99",
    annual: "$99/year",
    features: [
      "Edit your listing",
      "Verified badge",
      "Higher search ranking than unclaimed listings",
      "Eligible for promotions and gift guides",
      "Community networking access",
    ],
  },
  merchant: {
    name: "Marketplace Merchant Membership",
    price: "$99",
    annual: "$99/year + 11% per sale",
    features: [
      "Sell products through the Catholic Owned Marketplace",
      "Vendor storefront with product catalog",
      "Stripe Connect payouts",
      "Directory listing included",
      "11% commission per sale",
    ],
  },
  tier2_nonprofit: {
    name: "Tier 2 — Non-profit",
    price: "$349",
    annual: "$349/year",
    features: [
      "Tier 2 benefits at non-profit pricing",
      "Local Boost upsell available ($150/mo)",
      "Catholic Owned-funded ad placement",
    ],
  },
  tier2_business: {
    name: "Tier 2",
    price: "$699",
    annual: "$699/year",
    features: [
      "Featured directory placement",
      "Catholic Owned-funded ad placement on your listing",
      "Local Boost upsell available ($150/mo)",
    ],
  },
  tier3: {
    name: "Tier 3",
    price: "$2,999",
    annual: "$2,999/year",
    features: [
      "Premium directory placement",
      "Catholic Owned-funded ad placement on your listing",
      "Local Boost upsell available ($150/mo)",
      "Sales-team consultation included",
    ],
  },
  tier4: {
    name: "Tier 4",
    price: "$10,000",
    annual: "$10,000/year",
    features: [
      "Top-tier directory placement",
      "Dedicated account manager",
      "Custom partnership opportunities",
    ],
  },

  // Legacy tiers (kept for in-flight subscriptions until customer migration).
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
  const tier = searchParams.get("tier") || "verified"
  const tierInfo = TIER_DETAILS[tier] || TIER_DETAILS.verified

  const [listing, setListing] = useState<DirectoryListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Listing lookup requires the customer's auth token, which lives
    // in an httpOnly cookie not readable from this client component.
    // Route through the server-action helper.
    getMyDirectoryListing()
      .then((data) => {
        if (data) setListing(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handlePurchase = async () => {
    if (!listing) return
    setPurchasing(true)
    setError("")

    try {
      const successUrl = `${window.location.origin}/user/directory/success?tier=${tier}`
      const cancelUrl = `${window.location.origin}/user/directory/checkout?tier=${tier}`

      const res = await createDirectorySubscriptionCheckout({
        listing_id: listing.id,
        tier,
        success_url: successUrl,
        cancel_url: cancelUrl,
      })

      if (res.ok && res.checkout_url) {
        window.location.href = res.checkout_url
      } else {
        setError(res.ok ? "Could not start checkout" : res.error)
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
