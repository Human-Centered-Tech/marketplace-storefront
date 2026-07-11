import type { Metadata } from "next"
import { Suspense } from "react"
import { VendorOnboardingFunnel } from "@/components/sections/VendorOnboardingFunnel/VendorOnboardingFunnel"
import { retrieveCustomer } from "@/lib/data/customer"
import { getDirectoryListing } from "@/lib/data/directory"

export const metadata: Metadata = {
  title: "Merchant Onboarding | Catholic Owned®",
  description:
    "Tell us about your business and we'll guide you to the right plan for selling on Catholic Owned®.",
}

// Session + claim context are per-request — never cache this page.
export const dynamic = "force-dynamic"

export default async function SellOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ claim_listing?: string }>
}) {
  // Session-aware funnel (Brooke 7/10): signed-in customers see
  // Continue-style CTAs and convert in place instead of re-registering.
  const customer = await retrieveCustomer().catch(() => null)

  // Claim entries attest to ownership inside the funnel — fetch the
  // business name for the attestation copy. Best-effort.
  const { claim_listing } = await searchParams
  let claimBusinessName: string | undefined
  if (claim_listing) {
    const listing = await getDirectoryListing(claim_listing).catch(() => null)
    claimBusinessName = listing?.business_name || undefined
  }

  // Suspense boundary required: the funnel calls useSearchParams()
  // (reads claim_listing/return_to for the claim flow), which Next requires
  // to be wrapped or the production build errors on this route.
  return (
    <Suspense>
      <VendorOnboardingFunnel
        isLoggedIn={Boolean(customer)}
        claimBusinessName={claimBusinessName}
      />
    </Suspense>
  )
}
