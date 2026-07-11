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
  {
    name: string
    price: string
    annual: string
    features: string[]
    // Brooke's 7/10 copy: optional lead-in under the price (e.g. the
    // startup/non-profit 50%-off explainer) and trailing note under the list.
    priceSuffix?: string
    subtitle?: string
    footnote?: string
  }
> = {
  // Canva "Sales Page Logic" tier set (2026-05).
  local: {
    name: "Catholic Owned® Local",
    price: "$99",
    annual: "$99/year",
    features: [
      "An Essential directory listing shown to users in your state",
      "The ability to edit and customize your listing",
      "Higher directory placement than unclaimed listings",
      "One parish affiliation",
      "The ability to respond to reviews",
      "A digital Catholic Owned® Local Member badge",
      "A Catholic Owned® Local Member sticker mailed to you",
      "Access to open Catholic Owned® networking opportunities",
      "Eligibility for Local Boost",
    ],
  },
  merchant: {
    name: "Marketplace Merchant",
    price: "$99",
    priceSuffix: "/year + 11% fees per sale",
    annual: "$99/year + 11% fees per sale",
    features: [
      "A dedicated marketplace storefront",
      "The ability to sell products through the Catholic Owned® platform",
      "An Essential directory listing with one parish affiliation",
      "A digital Catholic Owned® Marketplace Merchant badge",
      "Analytics dashboard, direct messaging, and Stripe Connect for payouts",
      "Monthly Merchant Office Hours for storefront support, questions, and practical guidance",
      "Access to open Catholic Owned® networking opportunities",
      "Eligibility for Catholic Owned® Guides",
    ],
  },
  tier2_startup: {
    name: "Featured — Startup & Non-profit",
    price: "$349",
    annual: "$349/year",
    subtitle: "As a qualifying startup or nonprofit, you’re receiving our Featured membership at 50% off the standard annual rate to help your organization build visibility, relationships, and momentum within the Catholic Owned® network.",
    features: [
      "Priority directory placement in every state your business serves",
      "Three parish affiliations",
      "Access to monthly Featured Member Meet-Ups",
      "Access to open Catholic Owned® networking opportunities",
      "A dedicated member connection to help you get established in the network",
      "Eligibility for Catholic Owned® Guides and other curated features",
      "Priority support",
    ],
    footnote: "Featured Member Meet-Ups are monthly opportunities to build relationships, expand your circle of influence, and connect with other committed Catholic business owners. Formats may include member introductions, featured speakers, guided conversations, and structured networking.",
  },
  tier2_nonprofit: {
    name: "Featured — Startup & Non-profit",
    price: "$349",
    annual: "$349/year",
    subtitle: "As a qualifying startup or nonprofit, you’re receiving our Featured membership at 50% off the standard annual rate to help your organization build visibility, relationships, and momentum within the Catholic Owned® network.",
    features: [
      "Priority directory placement in every state your business serves",
      "Three parish affiliations",
      "Access to monthly Featured Member Meet-Ups",
      "Access to open Catholic Owned® networking opportunities",
      "A dedicated member connection to help you get established in the network",
      "Eligibility for Catholic Owned® Guides and other curated features",
      "Priority support",
    ],
    footnote: "Featured Member Meet-Ups are monthly opportunities to build relationships, expand your circle of influence, and connect with other committed Catholic business owners. Formats may include member introductions, featured speakers, guided conversations, and structured networking.",
  },
  // Same $699 Featured plan under its legacy key.
  tier2_business: {
    name: "Featured",
    price: "$699",
    annual: "$699/year",
    features: [
      "Priority directory placement in every state your business serves",
      "Three parish affiliations",
      "Access to monthly Featured Member Meet-Ups",
      "Access to open Catholic Owned® networking opportunities",
      "A dedicated member connection to help you get established in the network",
      "Eligibility for Catholic Owned® Guides and other curated features",
      "Priority support",
    ],
    footnote: "Featured Member Meet-Ups are monthly opportunities to build relationships, expand your circle of influence, and connect with other committed Catholic business owners. Formats may include member introductions, featured speakers, guided conversations, and structured networking.",
  },
  // Same $2,999 Enterprise plan under its legacy key.
  tier3: {
    name: "Enterprise",
    price: "$2,999",
    annual: "$2,999/year",
    features: [
      "Premium, top-of-page directory placement in three states of your choice",
      "Priority directory placement in every other state your business serves",
      "25 parish affiliations",
      "Access to monthly Featured Member Meet-Ups",
      "Four email placements during your membership year",
      "Audience targeting for each email placement",
      "High-visibility positioning across the platform",
      "A dedicated member connection to help you get established in the network",
      "A digital Catholic Owned® Enterprise Member badge",
      "24/7 support",
    ],
    footnote:
      "Enterprise membership gives your business a consistent presence within the Catholic Owned® network while helping you reach the audiences most relevant to your work.",
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
    name: "Essential",
    price: "$50",
    annual: "$50/year",
    features: [
      "Business Directory listing",
      "1 parish affiliation",
      "Search visibility",
      "Marketplace product listings",
      "Member business badge",
    ],
  },
  featured: {
    name: "Featured",
    price: "$699",
    annual: "$699/year",
    features: [
      "Priority directory placement in every state your business serves",
      "Three parish affiliations",
      "Access to monthly Featured Member Meet-Ups",
      "Access to open Catholic Owned® networking opportunities",
      "A dedicated member connection to help you get established in the network",
      "Eligibility for Catholic Owned® Guides and other curated features",
      "Priority support",
    ],
    footnote: "Featured Member Meet-Ups are monthly opportunities to build relationships, expand your circle of influence, and connect with other committed Catholic business owners. Formats may include member introductions, featured speakers, guided conversations, and structured networking.",
  },
  enterprise: {
    name: "Enterprise",
    price: "$2,999",
    annual: "$2,999/year",
    features: [
      "Premium, top-of-page directory placement in three states of your choice",
      "Priority directory placement in every other state your business serves",
      "25 parish affiliations",
      "Access to monthly Featured Member Meet-Ups",
      "Four email placements during your membership year",
      "Audience targeting for each email placement",
      "High-visibility positioning across the platform",
      "A dedicated member connection to help you get established in the network",
      "A digital Catholic Owned® Enterprise Member badge",
      "24/7 support",
    ],
    footnote:
      "Enterprise membership gives your business a consistent presence within the Catholic Owned® network while helping you reach the audiences most relevant to your work.",
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
      .then((res) => {
        if (!res.authenticated) {
          // No customer session on this device (the dashboard handoff didn't
          // establish one). Re-establish via login and return to this checkout
          // (tier query included) rather than rendering an empty page.
          const seg = window.location.pathname.split("/").filter(Boolean)
          const locale = seg[0] || "us"
          const back = window.location.pathname + window.location.search
          window.location.href = `/${locale}/user?return_to=${encodeURIComponent(
            back
          )}`
          return
        }
        if (res.listing) setListing(res.listing)
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
          <div className="mb-6">
            <p className="text-[10px] font-bold text-gold-dark tracking-[0.2em] uppercase mb-1">
              {tierInfo.name}
            </p>
            <p className="font-serif text-4xl font-bold text-navy-dark">
              {tierInfo.price}
              <span className="text-base font-normal text-secondary">
                {tierInfo.priceSuffix ?? "/year"}
              </span>
            </p>
            {tierInfo.subtitle && (
              <p className="text-sm text-secondary mt-3">{tierInfo.subtitle}</p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-[10px] font-bold text-secondary tracking-[0.15em] uppercase mb-3">
              Your membership includes
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
            {tierInfo.footnote && (
              <p className="text-xs text-secondary mt-4 leading-relaxed">
                {tierInfo.footnote}
              </p>
            )}
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

        {/* Temporary kill-switch while Terms of Service are being finalized.
            Backend route returns 503 even if someone bypasses this guard;
            this just makes the UX honest. Flip NEXT_PUBLIC_PAYMENTS_DISABLED
            in Railway when payments reopen. */}
        {process.env.NEXT_PUBLIC_PAYMENTS_DISABLED === "true" && (
          <div className="bg-[rgba(190,155,50,0.1)] border border-[rgba(190,155,50,0.5)] text-primary px-4 py-3 rounded-sm mb-4 text-[14px]">
            Payments are temporarily disabled while we finalize our Terms of
            Service. You can keep setting up your store — we&apos;ll notify you
            when payment is available.
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handlePurchase}
          disabled={
            purchasing ||
            process.env.NEXT_PUBLIC_PAYMENTS_DISABLED === "true"
          }
          className="w-full bg-navy text-white py-4 rounded-xl text-[13px] font-bold uppercase tracking-[0.15em] hover:bg-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
