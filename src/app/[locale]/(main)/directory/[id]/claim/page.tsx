import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getDirectoryListing } from "@/lib/data/directory"
import { ClaimListingSalesPage } from "@/components/sections/ClaimListingSalesPage/ClaimListingSalesPage"

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await getDirectoryListing(id)
  if (!listing) return { title: "Not Found" }
  return {
    title: `Claim ${listing.business_name}`,
    description: `Claim the ${listing.business_name} listing on Catholic Owned®.`,
  }
}

export default async function ClaimListingPage({ params }: Props) {
  const { id, locale } = await params
  const listing = await getDirectoryListing(id)
  if (!listing) notFound()

  // If the listing is already claimed, the claim page doesn't apply — bounce
  // back to the public detail page.
  if (listing.owner_id) {
    redirect(`/${locale}/directory/${id}`)
  }

  return <ClaimListingSalesPage listing={listing} />
}
