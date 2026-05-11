import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDirectoryListing } from "@/lib/data/directory"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export const metadata: Metadata = {
  title: "Claim Checkout | Catholic Owned®",
}

// Stub — Phase 2 will wire:
//   1. listing-edit form (prefilled with current data)
//   2. Stripe checkout for the $99/yr Catholic Owned Local subscription
//   3. webhook → set owner_id, activate subscription
//   4. Local Boost $150/mo upsell on success page
export default async function ClaimCheckoutStubPage({ params }: Props) {
  const { id } = await params
  const listing = await getDirectoryListing(id)
  if (!listing) notFound()

  return (
    <main className="bg-[#FAF9F5] min-h-screen py-16 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
        <p className="text-[#F2CD69] text-[12px] font-semibold uppercase tracking-[0.2em] mb-3">
          Almost there
        </p>
        <h1 className="font-serif text-3xl font-bold text-navy-dark mb-4">
          Claim flow under construction
        </h1>
        <p className="text-secondary leading-relaxed mb-8">
          Your account is set up. The listing-edit form and the $99/yr Catholic
          Owned Local checkout will appear here once we finish wiring it up.
        </p>
        <p className="text-sm text-secondary mb-8">
          Listing being claimed:{" "}
          <span className="font-bold text-navy-dark">
            {listing.business_name}
          </span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <LocalizedClientLink
            href="/user/directory"
            className="inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl bg-navy-dark text-white hover:bg-navy transition-colors"
          >
            Go to dashboard
          </LocalizedClientLink>
          <LocalizedClientLink
            href={`/directory/${id}`}
            className="inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl bg-white border border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white transition-colors"
          >
            Back to listing
          </LocalizedClientLink>
        </div>
      </div>
    </main>
  )
}
