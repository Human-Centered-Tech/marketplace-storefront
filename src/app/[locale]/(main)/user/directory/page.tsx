import { retrieveCustomer } from "@/lib/data/customer"
import { LoginForm, UserNavigation } from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { listDirectoryListings } from "@/lib/data/directory"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Directory Listing",
}

export default async function UserDirectoryPage() {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const result = await listDirectoryListings({
    q: user.id,
    limit: 1,
  })

  const listing = result.listings?.[0]

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3">
          <h1 className="heading-xl uppercase mb-6">My Directory Listing</h1>

          {listing ? (
            <div className="space-y-6">
              {/* Listing summary */}
              <div className="border rounded-sm p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="heading-md text-primary">
                      {listing.business_name}
                    </h2>
                    <p className="text-sm text-secondary mt-1">
                      Status:{" "}
                      <span
                        className={
                          listing.verification_status === "approved"
                            ? "text-green-700"
                            : listing.verification_status === "rejected"
                              ? "text-red-700"
                              : "text-yellow-700"
                        }
                      >
                        {listing.verification_status}
                      </span>
                    </p>
                    <p className="text-sm text-secondary">
                      Tier: {listing.subscription_tier} | Subscription:{" "}
                      {listing.subscription_status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <LocalizedClientLink
                      href="/user/directory/edit"
                      className="bg-primary text-white px-4 py-2 rounded-sm text-sm uppercase font-medium"
                    >
                      Edit
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/user/directory/subscription"
                      className="border border-primary text-primary px-4 py-2 rounded-sm text-sm uppercase font-medium"
                    >
                      Subscription
                    </LocalizedClientLink>
                  </div>
                </div>

                {listing.description && (
                  <p className="text-secondary mt-4 text-sm">
                    {listing.description}
                  </p>
                )}
              </div>

              {/* Quick stats placeholder */}
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-sm p-4 text-center">
                  <p className="heading-sm text-primary">—</p>
                  <p className="text-xs text-secondary">Profile Views</p>
                </div>
                <div className="border rounded-sm p-4 text-center">
                  <p className="heading-sm text-primary">—</p>
                  <p className="text-xs text-secondary">Website Clicks</p>
                </div>
                <div className="border rounded-sm p-4 text-center">
                  <p className="heading-sm text-primary">—</p>
                  <p className="text-xs text-secondary">Phone Calls</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-sm p-8 text-center">
              <h2 className="heading-md text-primary mb-2">
                List Your Business
              </h2>
              <p className="text-secondary mb-4">
                Get your Catholic-owned business discovered by the community.
              </p>
              <LocalizedClientLink
                href="/user/directory/create"
                className="bg-primary text-white px-6 py-2 rounded-sm text-sm uppercase font-medium inline-block"
              >
                Create Listing
              </LocalizedClientLink>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
