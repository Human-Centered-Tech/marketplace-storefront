"use client"

import { useState } from "react"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { DirectoryListing } from "@/types/directory"

export const ClaimSuccessPage = ({
  listing,
  boostStatus,
}: {
  listing: DirectoryListing
  boostStatus?: "ok" | "cancelled"
}) => {
  const [boosting, setBoosting] = useState(false)
  const [error, setError] = useState("")

  const backendUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      : "http://localhost:9000"

  const handleAddBoost = async () => {
    setBoosting(true)
    setError("")
    try {
      const origin = window.location.origin
      const res = await fetch(
        `${backendUrl}/store/directory/listings/${listing.id}/local-boost`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
          credentials: "include",
          body: JSON.stringify({
            success_url: `${origin}/directory/${listing.id}/claim/success?boost=ok`,
            cancel_url: `${origin}/directory/${listing.id}/claim/success?boost=cancelled`,
          }),
        }
      )

      const data = await res.json()
      if (!res.ok) {
        setError(data?.message || `Boost checkout failed (${res.status})`)
        return
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        setError("No checkout URL returned")
      }
    } catch (err: any) {
      setError(err?.message || "Network error")
    } finally {
      setBoosting(false)
    }
  }

  return (
    <main className="bg-[#FAF9F5] min-h-screen py-16 px-6">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl border border-[#BE9B32]/30 shadow-sm p-8 lg:p-12 text-center">
          <span
            className="material-symbols-outlined text-[#BE9B32] text-5xl mb-4 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <p className="text-[#BE9B32] text-[12px] font-semibold uppercase tracking-[0.2em] mb-3">
            Listing Claimed
          </p>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-navy-dark mb-4">
            {listing.business_name} is yours.
          </h1>
          <p className="text-secondary leading-relaxed">
            Welcome to Catholic Owned. Your Local membership is active and your
            listing is being re-verified — usually within 1-2 business days.
          </p>
        </div>

        {boostStatus === "ok" ? (
          <div className="bg-white rounded-2xl border border-[#BE9B32]/30 p-6 text-center">
            <p className="text-[#BE9B32] text-[12px] font-semibold uppercase tracking-[0.2em] mb-2">
              Local Boost Active
            </p>
            <p className="text-secondary text-sm">
              Your $150/mo ad placement is live. We&apos;ll reach out shortly
              to confirm targeting details.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 lg:p-10">
            <p className="text-[#BE9B32] text-[12px] font-semibold uppercase tracking-[0.2em] mb-2">
              One more idea
            </p>
            <h2 className="font-serif text-2xl font-bold text-navy-dark mb-3">
              Want 30,000 local Catholic impressions / month?
            </h2>
            <p className="text-secondary text-sm leading-relaxed mb-6">
              Add Local Boost for $150/month and we&apos;ll run paid placements
              on your listing across the Catholic Owned network. We handle the
              ad setup; you get the eyeballs. Cancel any time.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddBoost}
                disabled={boosting}
                className="flex-1 inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl bg-[#BE9B32] text-navy-dark hover:bg-[#d4af4c] shadow-lg transition-colors disabled:opacity-50"
              >
                {boosting
                  ? "Redirecting…"
                  : "Add Local Boost — $150/mo"}
              </button>
              <LocalizedClientLink
                href="/user/directory"
                className="flex-1 inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl bg-white border border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white transition-colors"
              >
                Skip for now
              </LocalizedClientLink>
            </div>
            {boostStatus === "cancelled" && (
              <p className="text-center text-xs text-secondary mt-4">
                No boost added — you can come back to this any time from your
                dashboard.
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <LocalizedClientLink
            href={`/directory/${listing.id}`}
            className="text-sm text-secondary hover:text-navy-dark underline"
          >
            View public listing
          </LocalizedClientLink>
          <span className="text-secondary">·</span>
          <LocalizedClientLink
            href="/user/directory"
            className="text-sm text-secondary hover:text-navy-dark underline"
          >
            Go to dashboard
          </LocalizedClientLink>
        </div>
      </div>
    </main>
  )
}
