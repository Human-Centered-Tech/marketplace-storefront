"use client"

import { Button } from "@/components/atoms"
import { LabeledInput } from "@/components/cells"
import { PasswordInput } from "@/components/cells/PasswordInput/PasswordInput"
import { becomeVendor } from "@/lib/data/vendor"
import { useState } from "react"
import { useRouter } from "next/navigation"

export const BecomeVendorForm = ({
  email,
  claimListingId,
  recommendedTier,
  pillarsAffirmed,
  defaultBusinessName,
}: {
  email: string
  // Funnel context forwarded through /user/register → become-vendor for
  // logged-in claimants; becomeVendor/becomeMerchant attach the claimed
  // listing instead of auto-creating a duplicate draft.
  claimListingId?: string
  recommendedTier?: string
  pillarsAffirmed?: boolean
  defaultBusinessName?: string
}) => {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    formData.set("email", email)
    if (claimListingId) {
      formData.set("claim_listing", claimListingId)
      // Breadcrumb intent from the funnel's progress hooks (7/9) — attach
      // marks it completed.
      const intentId = sessionStorage.getItem(`claim_intent_${claimListingId}`)
      if (intentId) formData.set("claim_intent_id", intentId)
    }
    if (recommendedTier) formData.set("recommended_tier", recommendedTier)
    if (pillarsAffirmed) formData.set("founding_pillars_affirmed", "true")

    const res = await becomeVendor(formData)

    if (res.success) {
      setSuccess(true)
    } else {
      setError(res.error || "Something went wrong")
    }
    setIsSubmitting(false)
  }

  if (success) {
    return (
      <div className="border rounded-sm p-8 text-center">
        <h2 className="heading-md text-primary mb-2">
          You&apos;re a Merchant!
        </h2>
        <p className="text-secondary mb-4">
          Your merchant account is ready. Next, head to your dashboard to
          complete Stripe Connect onboarding — once Stripe approves and
          you&apos;ve paid your annual fee, your shop publishes
          automatically.
        </p>
        <a
          href="/api/vendor-handoff"
          className="bg-navy text-white px-6 py-2 rounded-sm text-sm uppercase font-medium inline-block"
        >
          Go to Merchant Dashboard
        </a>
      </div>
    )
  }

  return (
    <div className="border rounded-sm p-6 max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <LabeledInput
          label="Business / Company Name"
          name="name"
          placeholder="Your business name"
          defaultValue={defaultBusinessName}
          required
        />
        {claimListingId && (
          <p className="text-xs text-secondary -mt-3">
            You&apos;re claiming this business&apos;s directory listing — it
            will be attached to your merchant account.
          </p>
        )}
        <div>
          <label className="label-md font-medium text-primary block mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            readOnly
            // text-primary (not text-secondary) so the prepopulated email
            // reads clearly even though the field is locked — vendors
            // need to see which email they're signing up with.
            className="w-full px-3 py-2 border rounded-sm bg-gray-50 text-primary font-medium cursor-not-allowed"
          />
          <p className="text-xs text-secondary mt-1">
            Your merchant account will use this email address.
          </p>
        </div>
        <PasswordInput
          label="Password"
          name="password"
          placeholder="Confirm your account password"
          required
        />
        <p className="text-xs text-secondary">
          Enter your current account password to verify your identity.
        </p>
        {error && <p className="label-md text-negative">{error}</p>}
        <Button
          className="w-full bg-navy text-white hover:bg-navy-dark py-3 uppercase tracking-[0.1em] text-[13px] font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Become a Merchant"}
        </Button>
      </form>
    </div>
  )
}
