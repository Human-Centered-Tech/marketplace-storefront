"use client"

import { useState } from "react"

/**
 * "Manage payment method" — Matteo 2026-08-18:
 *
 *   "Possibility for the user to update payment info from their own dashboard."
 *
 * Before this, the only answer on record was for staff to generate a
 * Stripe-hosted payment link by hand and email it to the member. This replaces
 * that with the standard Stripe Billing Portal: one click, Stripe's own hosted
 * UI for cards, invoices and cancellation, then back here.
 *
 * The portal URL is minted server-side by
 * POST /store/directory/subscriptions/:id/portal, which derives the Stripe
 * customer from the authenticated session — never from anything this component
 * sends. All we post is the listing id in the path; the backend still checks
 * that the signed-in customer owns that listing before it talks to Stripe.
 */

type Props = {
  listing: {
    id: string
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    subscription_status?: string | null
  }
}

export const ManagePaymentMethod = ({ listing }: Props) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

  // Only offer this when there is billing to manage. `/me` returns the owner
  // their own full record, so both ids are readable here. A member who has
  // never subscribed gets the tier picker below instead, which is the correct
  // next step for them — showing a portal button that always errors would be
  // worse than showing nothing.
  const hasBilling = Boolean(
    listing?.stripe_customer_id || listing?.stripe_subscription_id
  )
  if (!hasBilling) return null

  const openPortal = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${backendUrl}/store/directory/subscriptions/${listing.id}/portal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
          // The session cookie is the whole authorization story — see the
          // route's doc comment.
          credentials: "include",
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        // The backend returns actionable messages for the two cases that
        // actually happen (portal not configured in Stripe; no membership
        // linked), so show what it said rather than a generic failure.
        setError(
          data?.message ||
            "We couldn't open the billing portal. Please try again, or contact support."
        )
        return
      }

      if (!data?.portal_url) {
        setError("We couldn't open the billing portal. Please contact support.")
        return
      }

      // Full navigation, not a new tab: Stripe's portal has its own "return to
      // Catholic Owned" button pointing back at this page, so a redirect keeps
      // one coherent back-and-forth instead of orphaning a tab.
      window.location.href = data.portal_url
    } catch {
      setError(
        "We couldn't reach the billing portal. Please check your connection and try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-sm p-4 mb-6">
      <h2 className="heading-sm text-primary">Payment method</h2>
      <p className="text-sm text-secondary mt-1">
        Update your card, view past invoices, or cancel your membership. This
        opens Stripe's secure billing portal.
      </p>

      {error && (
        <p className="text-sm text-red-700 mt-3" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        data-testid="manage-payment-method"
        className="mt-3 bg-primary text-white px-4 py-2 rounded-sm text-sm uppercase font-medium disabled:opacity-50"
      >
        {loading ? "Opening…" : "Manage payment method"}
      </button>
    </div>
  )
}
