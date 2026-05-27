import { retrieveCustomer } from "@/lib/data/customer"
import { requiresEmailVerification } from "@/lib/util/email-verification"
import { VerifyEmailGate } from "@/components/molecules/VerifyEmailGate/VerifyEmailGate"

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Gate the whole /user/* dashboard behind email verification. Unauthenticated
  // visitors fall through to the pages (which render the login form). Verified
  // and grandfathered accounts pass; only post-cutoff unverified accounts see
  // the gate (see requiresEmailVerification).
  const customer = await retrieveCustomer().catch(() => null)

  if (customer && requiresEmailVerification(customer)) {
    return <VerifyEmailGate email={customer.email} />
  }

  return <div className="-mt-6">{children}</div>
}
