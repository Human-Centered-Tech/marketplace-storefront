"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DirectoryListing } from "@/types/directory"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import {
  claimListing,
  createDirectorySubscriptionCheckout,
} from "@/lib/data/directory-actions"

/**
 * Claim step (claim-flow rebuild 7/7): attestation checkbox → then either
 * done (grandfathered member — ownership carried over free) or the membership
 * chooser → Stripe checkout (ownership transfers when payment lands; the
 * listing keeps showing its pre-claim content until then).
 */

const CLAIM_TIERS: Array<{
  key: string
  name: string
  price: string
  blurb: string
}> = [
  {
    key: "local",
    name: "Catholic Owned Local",
    price: "$99/yr",
    blurb: "Service businesses serving their local community.",
  },
  {
    key: "tier2_business",
    name: "Featured",
    price: "$699/yr",
    blurb: "Featured directory placement + Catholic Owned-funded ads.",
  },
  {
    key: "tier2_startup",
    name: "Featured — Startup",
    price: "$349/yr",
    blurb: "Featured benefits at early-stage pricing.",
  },
  {
    key: "tier2_nonprofit",
    name: "Featured — Non-profit",
    price: "$349/yr",
    blurb: "Featured benefits at non-profit pricing.",
  },
  {
    key: "tier3",
    name: "Enterprise",
    price: "$2,999/yr",
    blurb: "Premium placement + sales-team consultation.",
  },
]

type Phase = "attest" | "choose_tier" | "done_grandfathered" | "paid_pending"

export const ClaimListingStart = ({
  listing,
  isAuthenticated,
}: {
  listing: DirectoryListing
  isAuthenticated: boolean
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paidReturn = searchParams.get("success") === "1"

  const [phase, setPhase] = useState<Phase>(
    paidReturn ? "paid_pending" : "attest"
  )
  const [attested, setAttested] = useState(false)
  const [busy, setBusy] = useState(false)
  const [busyTier, setBusyTier] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [grandfatheredMsg, setGrandfatheredMsg] = useState("")

  const claimPath = `/directory/${listing.id}/claim/start`

  const submitAttestation = async () => {
    setBusy(true)
    setError("")
    const res = await claimListing(listing.id)
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    if (res.status === "completed") {
      setGrandfatheredMsg(res.message || "")
      setPhase("done_grandfathered")
      router.refresh()
    } else {
      setPhase("choose_tier")
    }
  }

  const startCheckout = async (tier: string) => {
    setBusyTier(tier)
    setError("")
    const res = await createDirectorySubscriptionCheckout({
      listing_id: listing.id,
      tier,
      success_url: `${window.location.origin}${window.location.pathname}?success=1`,
      cancel_url: `${window.location.origin}${window.location.pathname}`,
    })
    if (res.ok && res.checkout_url) {
      window.location.href = res.checkout_url
      return
    }
    setBusyTier(null)
    setError(res.ok ? "Could not start checkout" : res.error)
  }

  if (phase === "paid_pending") {
    return (
      <div className="rounded-2xl border border-[#BE9B32]/30 bg-white p-8 md:p-12 text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl font-semibold text-[#001435]">
          Payment received — finalizing your ownership
        </h2>
        <p className="text-sm text-secondary mt-3">
          {listing.business_name} is being transferred to your account. This
          usually takes under a minute. You&rsquo;ll find it under your
          dashboard&rsquo;s directory section.
        </p>
        <LocalizedClientLink
          href="/user/directory"
          className="inline-block mt-6 rounded-full bg-[#BE9B32] px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-[#001435] hover:bg-[#F2CD69] transition-colors"
        >
          Go to my listing
        </LocalizedClientLink>
      </div>
    )
  }

  if (phase === "done_grandfathered") {
    return (
      <div className="rounded-2xl border border-[#BE9B32]/30 bg-white p-8 md:p-12 text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl font-semibold text-[#001435]">
          {listing.business_name} is yours
        </h2>
        <p className="text-sm text-secondary mt-3">
          {grandfatheredMsg ||
            "Your existing membership carried over — no payment needed. You can edit your listing from your dashboard."}
        </p>
        {/* Brooke (7/10): grandfathered members should still SEE new-site
            pricing — some choose to upgrade, others appreciate their
            grandfathered deal. Without this, the instant-free path skipped
            the upgrade moment her email conversations used to provide. */}
        <p className="text-xs text-secondary mt-4">
          You keep your original grandfathered price. Want more visibility?
          Upgrade anytime — Featured $699/yr, Startup or Non-profit $349/yr,
          Enterprise $2,999/yr —{" "}
          <LocalizedClientLink
            href="/user/directory/subscription"
            className="underline decoration-[#BE9B32] underline-offset-4 text-[#001435]"
          >
            see membership options
          </LocalizedClientLink>
          .
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <LocalizedClientLink
            href="/user/directory"
            className="rounded-full bg-[#BE9B32] px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-[#001435] hover:bg-[#F2CD69] transition-colors"
          >
            Edit my listing
          </LocalizedClientLink>
          <LocalizedClientLink
            href={`/directory/${listing.id}`}
            className="rounded-full border border-[#001435] px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-[#001435] hover:bg-[#001435] hover:text-white transition-colors"
          >
            View listing
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-[#BE9B32]/30 bg-white p-8 md:p-12 text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl font-semibold text-[#001435]">
          Sign in to claim {listing.business_name}
        </h2>
        <p className="text-sm text-secondary mt-2">
          Create a free account (or sign in) and you&rsquo;ll come right back
          here to finish your claim. No storefront or merchant setup required.
        </p>
        <LocalizedClientLink
          href={`/user?return_to=${encodeURIComponent(claimPath)}`}
          className="inline-block mt-6 rounded-full bg-[#BE9B32] px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-[#001435] hover:bg-[#F2CD69] transition-colors"
        >
          Sign in / create account
        </LocalizedClientLink>
      </div>
    )
  }

  if (phase === "choose_tier") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#001435]">
            Choose your membership
          </h2>
          <p className="text-sm text-secondary mt-2">
            Your attestation is recorded. Pick a plan to complete your claim —
            ownership and your edits publish as soon as payment goes through.
            Until then, the listing stays live exactly as it is today.
          </p>
        </div>
        {error && (
          <p className="text-sm text-red-600 text-center mb-4">{error}</p>
        )}
        <div className="space-y-3">
          {CLAIM_TIERS.map((tier) => (
            <div
              key={tier.key}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5"
            >
              <div>
                <p className="font-serif text-lg font-bold text-[#001435]">
                  {tier.name}{" "}
                  <span className="text-[#755b00] text-base font-normal">
                    {tier.price}
                  </span>
                </p>
                <p className="text-sm text-secondary">{tier.blurb}</p>
              </div>
              <button
                onClick={() => startCheckout(tier.key)}
                disabled={busyTier !== null}
                className="shrink-0 rounded-full bg-[#001435] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-[#1e3660] transition-colors disabled:opacity-50"
              >
                {busyTier === tier.key ? "Starting…" : "Select"}
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-secondary text-center mt-6">
          Planning to sell products on the marketplace?{" "}
          <LocalizedClientLink
            href={`/sell/onboarding?claim_listing=${listing.id}&return_to=${encodeURIComponent(`/directory/${listing.id}/claim/checkout`)}`}
            className="underline decoration-[#BE9B32] underline-offset-4"
          >
            Set up a merchant storefront instead.
          </LocalizedClientLink>
        </p>
      </div>
    )
  }

  // phase === "attest"
  return (
    <div className="rounded-2xl border border-[#BE9B32]/30 bg-white p-8 md:p-10 max-w-2xl mx-auto">
      <h2 className="font-serif text-2xl font-semibold text-[#001435]">
        Claim {listing.business_name}
      </h2>
      <p className="text-sm text-secondary mt-2">
        Claiming gives you ownership of this listing and the ability to keep
        its information accurate. Your listing stays visible the whole time.
      </p>

      <label className="flex items-start gap-3 mt-6 p-4 rounded-xl border border-gray-200 bg-[#faf9f5] cursor-pointer">
        <input
          type="checkbox"
          checked={attested}
          onChange={(e) => setAttested(e.target.checked)}
          className="mt-0.5 w-5 h-5 accent-[#BE9B32]"
        />
        <span className="text-sm text-[#001435]">
          I affirm that I am the rightful owner (or an authorized
          representative) of <strong>{listing.business_name}</strong>, and I
          understand that claims made falsely are removed without refund under
          the{" "}
          <LocalizedClientLink
            href="/terms"
            className="underline decoration-[#BE9B32] underline-offset-4"
          >
            claim terms
          </LocalizedClientLink>
          .
        </span>
      </label>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <button
        onClick={submitAttestation}
        disabled={!attested || busy}
        className="mt-6 rounded-full bg-[#BE9B32] px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-[#001435] hover:bg-[#F2CD69] transition-colors disabled:opacity-40"
      >
        {busy ? "Submitting…" : "Claim this listing"}
      </button>
    </div>
  )
}
