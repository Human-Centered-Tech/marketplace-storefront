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
          Thank You for Registering!
        </h2>
        <p className="text-secondary mb-4">
          Your vendor account is pending admin authorization. You&apos;ll
          receive a confirmation email shortly.
        </p>
        <button
          onClick={() => router.push("/user")}
          className="bg-navy text-white px-6 py-2 rounded-sm text-sm uppercase font-medium"
        >
          Back to Account
        </button>
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
            Your vendor account will use this email address.
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
          {isSubmitting ? "Submitting..." : "Become a Vendor"}
        </Button>
      </form>
    </div>
  )
}
