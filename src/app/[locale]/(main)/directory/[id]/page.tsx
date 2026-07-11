import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDirectoryListing } from "@/lib/data/directory"
import { retrieveCustomer } from "@/lib/data/customer"
import { getAuthHeaders } from "@/lib/data/cookies"
import { sdk } from "@/lib/config"
import { DirectoryDetail } from "@/components/sections/DirectoryDetail/DirectoryDetail"
import { TrackPageView } from "@/components/sections/Analytics/TrackPageView"
import { buildSocialMetadata } from "@/lib/helpers/seo"

type Props = {
  params: Promise<{ id: string; locale: string }>
}

// Public claim status (claim-flow rebuild 7/7): whether a claim is already in
// progress on an unclaimed listing. Sent with auth headers so `mine` is
// populated for the claimant themselves (their own pending claim isn't a
// block — they get a resume link instead). Lives here, not lib/data/directory:
// getAuthHeaders is server-only, and directory.ts is transitively pulled into
// pages/-router client bundles via the sections barrel (build breaker).
const getDirectoryClaimStatus = async (id: string) => {
  const authHeaders = await getAuthHeaders()
  return sdk.client
    .fetch<{
      claimable: boolean
      claim_pending: boolean
      claimed: boolean
      mine?: boolean
    }>(`/store/directory/listings/${id}/claim`, {
      cache: "no-cache",
      headers: { ...(authHeaders as Record<string, string>) },
    })
    .catch(() => null)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await getDirectoryListing(id)

  if (!listing) {
    return { title: "Not Found" }
  }

  const description =
    listing.description?.slice(0, 160) ||
    `${listing.business_name} - Catholic-owned business`

  return {
    title: listing.business_name,
    description,
    ...buildSocialMetadata({
      title: listing.business_name,
      description,
      image: listing.cover_image_url || listing.logo_url,
    }),
  }
}

export default async function DirectoryDetailPage({ params }: Props) {
  const { id } = await params
  const listing = await getDirectoryListing(id)

  if (!listing) {
    notFound()
  }

  // Claim-in-progress treatment: only relevant while unclaimed. Best-effort —
  // a failed status fetch just leaves the normal Claim CTA.
  const claimStatus = !listing.owner_id
    ? await getDirectoryClaimStatus(listing.id)
    : null

  // Viewer, for the "Message business" CTA. Fetched here (not in the client
  // component) because retrieveCustomer is server-only.
  const user = listing.seller?.id ? await retrieveCustomer() : null

  return (
    <main className="bg-[#FAF9F5]">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <TrackPageView entity_type="directory_listing" entity_id={listing.id} />
      <DirectoryDetail
        listing={listing}
        claimPending={!!claimStatus?.claim_pending}
        claimMine={!!claimStatus?.mine}
        user={user}
      />
    </main>
  )
}
