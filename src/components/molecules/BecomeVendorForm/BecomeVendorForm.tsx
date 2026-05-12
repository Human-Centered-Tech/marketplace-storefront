"use client"

import { Button } from "@/components/atoms"
import { LabeledInput } from "@/components/cells"
import { becomeVendor } from "@/lib/data/vendor"
import { useState } from "react"
import { useRouter } from "next/navigation"

export const BecomeVendorForm = ({ email }: { email: string }) => {
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
          required
        />
        <div>
          <label className="label-md font-medium text-primary block mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 border rounded-sm bg-gray-50 text-secondary"
          />
          <p className="text-xs text-secondary mt-1">
            Your merchant account will use this email address.
          </p>
        </div>
        <LabeledInput
          label="Password"
          name="password"
          type="password"
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
