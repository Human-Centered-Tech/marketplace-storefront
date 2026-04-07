import { retrieveCustomer } from "@/lib/data/customer"
import { LoginForm, UserNavigation } from "@/components/molecules"
import { BecomeVendorForm } from "@/components/molecules/BecomeVendorForm/BecomeVendorForm"
import { retrieveVendorStatus } from "@/lib/data/vendor"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Become a Vendor",
}

export default async function BecomeVendorPage() {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const vendorStatus = await retrieveVendorStatus()
  const isAlreadyVendor = vendorStatus.isVendor

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3">
          <h1 className="heading-xl uppercase mb-6">Become a Vendor</h1>

          {isAlreadyVendor ? (
            <div className="border rounded-sm p-8 text-center">
              <h2 className="heading-md text-primary mb-2">
                You&apos;re Already a Vendor
              </h2>
              <p className="text-secondary mb-4">
                You already have a vendor account. Visit your vendor dashboard
                to manage your store.
              </p>
              <a
                href={process.env.NEXT_PUBLIC_VENDOR_URL || "/vendor"}
                className="bg-navy text-white px-6 py-2 rounded-sm text-sm uppercase font-medium inline-block"
              >
                Go to Vendor Dashboard
              </a>
            </div>
          ) : (
            <>
              <p className="text-secondary mb-6">
                Start selling on Catholic Owned. Fill out the form below to
                apply for a vendor account.
              </p>
              <BecomeVendorForm email={user.email} />
            </>
          )}
        </div>
      </div>
    </main>
  )
}
