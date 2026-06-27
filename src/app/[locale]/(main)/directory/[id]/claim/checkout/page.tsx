import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getDirectoryListing } from "@/lib/data/directory"

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export const metadata: Metadata = {
  title: "Claim Your Listing | Catholic Owned®",
}

export default async function ClaimCheckoutPage({ params }: Props) {
  const { id, locale } = await params

  const listing = await getDirectoryListing(id)

  if (!listing) notFound()
  if (listing.owner_id) {
    // Already claimed — bounce back to the public listing. This also catches
    // returning claimers: Flow A's attach sets owner_id during onboarding, so
    // anyone who comes back through this URL afterward lands on their listing
    // rather than re-entering the claim funnel.
    redirect(`/${locale}/directory/${id}`)
  }

  // Single claim flow (Flow A): EVERY claimer — authenticated or not — goes
  // through the onboarding questionnaire, which assigns a recommended_tier and
  // (on register / become-merchant) ATTACHES this listing with no up-front
  // charge. They then pay/activate it via the standard go-live → subscription
  // path and edit their details at /user/directory/edit. The old pay-now claim
  // checkout (Flow B) that rendered ClaimListingForm here has been retired.
  redirect(
    `/${locale}/sell/onboarding?claim_listing=${id}&return_to=${encodeURIComponent(
      `/directory/${id}/claim/checkout`
    )}`
  )
}
