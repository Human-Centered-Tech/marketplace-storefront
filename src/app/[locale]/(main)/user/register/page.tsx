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
  }>
}) {
  const user = await retrieveCustomer()
  const { vendor, return_to, recommended_tier, claim_listing } =
    await searchParams

  if (user) {
    if (vendor === "true") {
      redirect("/user/become-vendor")
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
    />
  )
}
