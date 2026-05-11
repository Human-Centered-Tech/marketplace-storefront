import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDirectoryListing } from "@/lib/data/directory"
import { ClaimSuccessPage } from "@/components/sections/ClaimListingForm/ClaimSuccessPage"

type Props = {
  params: Promise<{ id: string; locale: string }>
  searchParams: Promise<{ session_id?: string; boost?: string }>
}

export const metadata: Metadata = {
  title: "Listing Claimed! | Catholic Owned®",
}

export default async function ClaimSuccess({ params, searchParams }: Props) {
  const { id } = await params
  const search = await searchParams
  const listing = await getDirectoryListing(id)
  if (!listing) notFound()

  return (
    <ClaimSuccessPage
      listing={listing}
      boostStatus={search.boost as "ok" | "cancelled" | undefined}
    />
  )
}
