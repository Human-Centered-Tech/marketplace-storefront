import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getDirectoryListing } from "@/lib/data/directory"
import { retrieveCustomer } from "@/lib/data/customer"
import { ClaimListingStart } from "@/components/sections/ClaimListingStart/ClaimListingStart"

// Claim step page (claim-flow rebuild 7/7): attestation → grandfathered
// completion or membership checkout. The sales pitch lives one level up at
// /directory/[id]/claim; this page is the action.

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await getDirectoryListing(id)
  if (!listing) return { title: "Not Found" }
  return { title: `Claim ${listing.business_name} | Catholic Owned®` }
}

// Auth + claim state are per-user — never cache.
export const dynamic = "force-dynamic"

export default async function ClaimStartPage({ params }: Props) {
  const { id, locale } = await params
  const listing = await getDirectoryListing(id)
  if (!listing) notFound()

  // Already claimed — nothing to do here. (The claimant themselves lands on
  // their dashboard's directory section instead.)
  if (listing.owner_id) {
    redirect(`/${locale}/directory/${id}`)
  }

  const customer = await retrieveCustomer()

  return (
    <main className="bg-[#faf9f5] min-h-screen py-16 px-4">
      <ClaimListingStart listing={listing} isAuthenticated={!!customer} />
    </main>
  )
}
