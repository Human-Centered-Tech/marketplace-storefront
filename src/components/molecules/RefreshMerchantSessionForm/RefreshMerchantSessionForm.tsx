"use client"

import { Button } from "@/components/atoms"
import { PasswordInput } from "@/components/cells/PasswordInput/PasswordInput"
import { refreshVendorSession } from "@/lib/data/vendor"
import { useState } from "react"

/**
 * Shown on /user/become-vendor when /api/vendor-handoff detects a
 * stale token (empty actor_id) and bounces here with ?session_refresh=1.
 *
 * Asks for the customer's password and re-logs as a seller server-side
 * via refreshVendorSession, then bounces back into /api/vendor-handoff
 * with a fresh token in the cookie.
 */
export const RefreshMerchantSessionForm = () => {
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const res = await refreshVendorSession(formData)

    if (res.success) {
      // Full-page navigation so the freshly-set vendor cookie is read
      // by the next /api/vendor-handoff request.
      window.location.assign("/api/vendor-handoff")
      return
    }
    setError(res.error || "Something went wrong")
    setIsSubmitting(false)
  }

  return (
    <div className="border rounded-sm p-6 max-w-lg bg-[rgba(190,155,50,0.06)]">
      <h2 className="heading-md text-primary mb-2">
        Refresh Your Merchant Session
      </h2>
      <p className="text-secondary mb-5 text-sm">
        Your merchant session needs to be refreshed before we can take
        you to the merchant dashboard. Re-enter your account password
        to continue.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          label="Password"
          name="password"
          placeholder="Your account password"
          required
        />
        {error && <p className="label-md text-negative">{error}</p>}
        <Button
          className="w-full bg-navy text-white hover:bg-navy-dark py-3 uppercase tracking-[0.1em] text-[13px] font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Refreshing..." : "Continue to Merchant Dashboard"}
        </Button>
      </form>
    </div>
  )
}
