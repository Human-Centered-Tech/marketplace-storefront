import { retrieveCustomer } from "@/lib/data/customer"
import { LoginForm, UserNavigation } from "@/components/molecules"
import { AutoConvertToMerchant } from "@/components/molecules/AutoConvertToMerchant/AutoConvertToMerchant"
import { RefreshMerchantSessionForm } from "@/components/molecules/RefreshMerchantSessionForm/RefreshMerchantSessionForm"
import { retrieveVendorStatus } from "@/lib/data/vendor"
import { requiresEmailVerification } from "@/lib/util/email-verification"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Add Your Business",
}

/**
 * 7/10 simplification (Liam): no more form here. A signed-in customer arriving
 * from the funnel is converted to a merchant automatically (no password
 * re-entry, no business-name field — that's collected by the dashboard's
 * "Create your directory listing" step, which go-live requires). Existing
 * merchants skip straight to their dashboard instead of the old "You're
 * Already a Merchant" interstitial.
 */
export default async function BecomeVendorPage({
  searchParams,
}: {
  searchParams?: Promise<{
    session_refresh?: string
    // Funnel context forwarded by /user/register for logged-in customers —
    // claim_listing especially must survive to the convert, or the claim
    // is silently lost (the 7/9 walk-through bug).
    claim_listing?: string
    recommended_tier?: string
    pillars_affirmed?: string
  }>
}) {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const params = (await searchParams) || {}
  const sessionRefresh = params.session_refresh === "1"
  const claimListingId = params.claim_listing
  const pillarsAffirmed = params.pillars_affirmed === "1"

  const vendorStatus = await retrieveVendorStatus()
  const isAlreadyVendor = vendorStatus.isVendor
  // Use the shared grandfather-aware gate (verified OR created before the
  // EMAIL_VERIFICATION_ENFORCED_AFTER cutoff) rather than a raw
  // `email_verified === true` check — otherwise existing/grandfathered
  // accounts get wrongly bounced to the "Verify Your Email First" screen.
  const needsEmailVerification = requiresEmailVerification(user)

  // Existing merchant with nothing to claim: straight to the dashboard —
  // the old "You're Already a Merchant" screen was just a click in the way.
  // (With a claim we fall through to the auto-convert, which is idempotent
  // and still runs the attach.)
  if (isAlreadyVendor && !claimListingId && !sessionRefresh) {
    redirect("/api/vendor-handoff")
  }

  // Everyone reaches merchant setup through the funnel (Brooke's model). A
  // bare visit with no funnel context shouldn't silently mint a merchant
  // account — send them to the front door instead.
  if (!sessionRefresh && !claimListingId && !pillarsAffirmed && !isAlreadyVendor) {
    redirect("/sell/onboarding")
  }

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3">
          <h1 className="heading-xl uppercase mb-6">Add Your Business</h1>

          {sessionRefresh ? (
            // Bounced here by /api/vendor-handoff because the stored
            // vendor JWT had an empty actor_id (the pre-PR-#58
            // stale-token bug). Show a focused password prompt that
            // re-mints a good token via refreshVendorSession.
            <RefreshMerchantSessionForm />
          ) : needsEmailVerification ? (
            <div className="border rounded-sm p-8 text-center bg-[rgba(190,155,50,0.06)]">
              <h2 className="heading-md text-primary mb-2">
                Verify Your Email First
              </h2>
              <p className="text-secondary mb-4">
                Merchant accounts require a verified email address. Please
                check your inbox for a verification link or request a new one
                from your account dashboard.
              </p>
              <a
                href="/us/user"
                className="bg-navy text-white px-6 py-2 rounded-sm text-sm uppercase font-medium inline-block"
              >
                Back to My Account
              </a>
            </div>
          ) : (
            <AutoConvertToMerchant
              claimListingId={claimListingId}
              recommendedTier={params.recommended_tier}
              pillarsAffirmed={pillarsAffirmed}
            />
          )}
        </div>
      </div>
    </main>
  )
}
