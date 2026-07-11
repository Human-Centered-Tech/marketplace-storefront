import { redirect } from "next/navigation"

// The claim pitch page was removed 7/10 (Liam): Brooke's claim email goes
// Claim This Listing -> Founding Pillars directly, so the per-listing
// interstitial only added a click. Old links land in the funnel.
export default async function ClaimPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  redirect(`/${locale}/sell/onboarding?claim_listing=${id}`)
}
