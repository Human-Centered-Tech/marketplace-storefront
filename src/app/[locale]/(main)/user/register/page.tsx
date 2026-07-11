import { RegisterForm } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { getDirectoryListing } from "@/lib/data/directory"
import { redirect } from "next/navigation"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    vendor?: string
    return_to?: string
    recommended_tier?: string
    claim_listing?: string
    pillars_affirmed?: string
  }>
}) {
  const user = await retrieveCustomer()
  const { vendor, return_to, recommended_tier, claim_listing, pillars_affirmed } =
    await searchParams

  if (user) {
    if (vendor === "true") {
      // Forward the funnel context to become-vendor. Dropping these (the
      // pre-7/9 behavior) silently lost the claim: the logged-in claimant
      // became a merchant with a fresh auto-created draft listing while the
      // listing they came to claim stayed unclaimed.
      const forwarded = new URLSearchParams()
      if (claim_listing) forwarded.set("claim_listing", claim_listing)
      if (recommended_tier) forwarded.set("recommended_tier", recommended_tier)
      if (pillars_affirmed) forwarded.set("pillars_affirmed", pillars_affirmed)
      const qs = forwarded.toString()
      redirect(`/user/become-vendor${qs ? `?${qs}` : ""}`)
    }
    redirect(return_to && return_to.startsWith("/") ? return_to : "/user")
  }

  // Claim flow: pre-fill the business name from the listing being claimed so
  // the claimant doesn't retype it, and pass the id through so becomeVendor
  // skips auto-creating a duplicate listing. Best-effort — a failed lookup
  // just leaves the field blank.
  let defaultBusinessName: string | undefined
  if (claim_listing) {
    const listing = await getDirectoryListing(claim_listing).catch(() => null)
    defaultBusinessName = listing?.business_name || undefined
  }

  return (
    <RegisterForm
      vendorFlow={vendor === "true"}
      recommendedTier={recommended_tier}
      claimListingId={claim_listing}
      defaultBusinessName={defaultBusinessName}
      // Forwarded from the /sell/onboarding Founding Pillars gate; persisted
      // on customer.metadata at signup so we have a record the vendor
      // affirmed the pillars.
      pillarsAffirmed={pillars_affirmed === "1"}
    />
  )
}
