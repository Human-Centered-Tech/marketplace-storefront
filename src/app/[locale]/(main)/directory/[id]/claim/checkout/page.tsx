import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { retrieveCustomer } from "@/lib/data/customer"
import { getDirectoryListing } from "@/lib/data/directory"
import { ClaimListingForm } from "@/components/sections/ClaimListingForm/ClaimListingForm"

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export const metadata: Metadata = {
  title: "Claim Your Listing | Catholic Owned®",
}

export default async function ClaimCheckoutPage({ params }: Props) {
  const { id, locale } = await params

  const [customer, listing] = await Promise.all([
    retrieveCustomer(),
    getDirectoryListing(id),
  ])

  if (!listing) notFound()
  if (listing.owner_id) {
    // Already claimed — bounce back to the public listing.
    redirect(`/${locale}/directory/${id}`)
  }

  if (!customer) {
    // Force registration before claiming.
    redirect(
      `/${locale}/user/register?vendor=true&claim_listing=${id}&return_to=${encodeURIComponent(
        `/directory/${id}/claim/checkout`
      )}`
    )
  }

  return <ClaimListingForm listing={listing} />
}
