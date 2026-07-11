"use client"

import { convertToMerchant } from "@/lib/data/vendor"
import { useEffect, useRef, useState } from "react"

/**
 * Replaces the old become-vendor form (7/10): signed-in customers no longer
 * re-enter their password or type a business name here — the conversion runs
 * automatically on mount and drops them straight into the merchant dashboard,
 * where the "Create your directory listing" step collects the business name.
 */
export const AutoConvertToMerchant = ({
  claimListingId,
  recommendedTier,
  pillarsAffirmed,
}: {
  claimListingId?: string
  recommendedTier?: string
  pillarsAffirmed?: boolean
}) => {
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)
  // React 18 strict mode double-mounts effects in dev; the ref guard keeps
  // the conversion from firing twice (it's idempotent anyway, belt+braces).
  const started = useRef(false)

  useEffect(() => {
    if (started.current && attempt === 0) return
    started.current = true
    setError("")

    const run = async () => {
      // Breadcrumb intent recorded by the funnel's progress hooks — attach
      // marks it completed.
      const claimIntentId = claimListingId
        ? sessionStorage.getItem(`claim_intent_${claimListingId}`) || undefined
        : undefined
      const res = await convertToMerchant({
        claimListingId,
        claimIntentId,
        recommendedTier,
        pillarsAffirmed,
      })
      if (res.success) {
        window.location.assign("/api/vendor-handoff")
      } else {
        setError(res.error || "Something went wrong")
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt])

  if (error) {
    return (
      <div className="border rounded-sm p-8 text-center max-w-lg">
        <h2 className="heading-md text-primary mb-2">
          We couldn&apos;t finish setting up your business
        </h2>
        <p className="text-secondary mb-4">{error}</p>
        <button
          type="button"
          onClick={() => setAttempt((a) => a + 1)}
          className="bg-navy text-white px-6 py-2 rounded-sm text-sm uppercase font-medium inline-block hover:bg-navy-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="border rounded-sm p-12 text-center max-w-lg">
      <div
        className="mx-auto mb-6 h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent"
        aria-hidden
      />
      <h2 className="heading-md text-primary mb-2">
        Setting up your business&hellip;
      </h2>
      <p className="text-secondary text-[15px]">
        One moment — we&apos;re preparing your dashboard
        {claimListingId ? " and attaching your listing" : ""}.
      </p>
    </div>
  )
}
