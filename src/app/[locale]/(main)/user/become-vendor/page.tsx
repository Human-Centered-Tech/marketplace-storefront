import { retrieveCustomer } from "@/lib/data/customer"
import { LoginForm, UserNavigation } from "@/components/molecules"
import { BecomeVendorForm } from "@/components/molecules/BecomeVendorForm/BecomeVendorForm"
import { RefreshMerchantSessionForm } from "@/components/molecules/RefreshMerchantSessionForm/RefreshMerchantSessionForm"
import { retrieveVendorStatus } from "@/lib/data/vendor"
import { requiresEmailVerification } from "@/lib/util/email-verification"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Become a Merchant",
}

export default async function BecomeVendorPage({
  searchParams,
}: {
  searchParams?: Promise<{ session_refresh?: string }>
}) {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const params = (await searchParams) || {}
  const sessionRefresh = params.session_refresh === "1"

  const vendorStatus = await retrieveVendorStatus()
  const isAlreadyVendor = vendorStatus.isVendor
  // Use the shared grandfather-aware gate (verified OR created before the
  // EMAIL_VERIFICATION_ENFORCED_AFTER cutoff) rather than a raw
  // `email_verified === true` check — otherwise existing/grandfathered
  // accounts get wrongly bounced to the "Verify Your Email First" screen.
  const needsEmailVerification = requiresEmailVerification(user)

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3">
          <h1 className="heading-xl uppercase mb-6">Become a Merchant</h1>

          {sessionRefresh ? (
            // Bounced here by /api/vendor-handoff because the stored
            // vendor JWT had an empty actor_id (the pre-PR-#58
            // stale-token bug). Show a focused password prompt that
            // re-mints a good token via refreshVendorSession.
            <RefreshMerchantSessionForm />
          ) : isAlreadyVendor ? (
            <div className="border rounded-sm p-8 text-center">
              <h2 className="heading-md text-primary mb-2">
                You&apos;re Already a Merchant
              </h2>
              <p className="text-secondary mb-4">
                You already have a merchant account. Visit your merchant
                dashboard to manage your store.
              </p>
              <a
                href="/api/vendor-handoff"
                className="bg-navy text-white px-6 py-2 rounded-sm text-sm uppercase font-medium inline-block"
              >
                Go to Merchant Dashboard
              </a>
            </div>
          ) : needsEmailVerification ? (
            <div className="border rounded-sm p-8 text-center bg-[rgba(190,155,50,0.06)]">
              <h2 className="heading-md text-primary mb-2">
                Verify Your Email First
              </h2>
              <p className="text-secondary mb-4">
                Merchant applications require a verified email address. Please
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
            <>
              <p className="text-secondary mb-6">
                Start selling on Catholic Owned. Fill out the form below to
                apply for a merchant account.
              </p>
              <BecomeVendorForm email={user.email} />
            </>
          )}
        </div>
      </div>
    </main>
  )
}
