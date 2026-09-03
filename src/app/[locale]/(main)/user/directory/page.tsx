import { retrieveCustomer } from "@/lib/data/customer"
import { LoginForm, UserNavigation } from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getMyDirectoryListing } from "@/lib/data/directory-actions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Directory Listing",
}

export default async function UserDirectoryPage() {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  // Resolve the owner's listing by owner_id, NOT by search. This page used to
  // call listDirectoryListings({ q: user.id }), but `q` on the public browse
  // endpoint is an ilike over business_name/description only — a customer id
  // never matches either, so it returned zero rows and every Business Owner
  // landed on the "List Your Business" empty state while their listing was
  // visible on every sibling page (Suzi/Hixon Law, 7/29). /me also skips the
  // public-visibility filters, so a pending (pre-go-live) listing resolves too.
  const { authenticated, listing } = await getMyDirectoryListing()

  // The `authenticated` flag used to be dropped here. We already know the
  // customer is signed in (retrieveCustomer above), so a false value means the
  // /me lookup itself failed — and falling through rendered "List Your
  // Business" to an owner who has one, which is the same lie as the Suzi/Hixon
  // regression described below. Say the truth instead.
  const lookupFailed = !authenticated

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3">
          <h1 className="heading-xl uppercase mb-6">My Directory Listing</h1>

          {lookupFailed ? (
            <div
              role="alert"
              className="border rounded-sm p-8 text-center border-red-200 bg-red-50"
            >
              <h2 className="heading-md text-primary mb-2">
                We couldn&rsquo;t load your listing
              </h2>
              <p className="text-secondary mb-4">
                Something went wrong reaching your directory listing. Please
                refresh in a moment — if you already have a listing, it is still
                there and still live.
              </p>
            </div>
          ) : listing ? (
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
                    {/* Inline background/color instead of `bg-primary
                        text-white`: --bg-primary resolves to --neutral-0
                        (#fff), so that pair renders white-on-white and the
                        button is invisible while still occupying space and
                        being clickable. Same trap, same fix as the submit
                        button in DirectoryListingForm. */}
                    <LocalizedClientLink
                      href="/user/directory/edit"
                      style={{ backgroundColor: "#17294A", color: "#ffffff" }}
                      className="px-4 py-2 rounded-sm text-sm uppercase font-medium"
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
              {/* Same white-on-white trap as the Edit button above. */}
              <LocalizedClientLink
                href="/user/directory/create"
                style={{ backgroundColor: "#17294A", color: "#ffffff" }}
                className="px-6 py-2 rounded-sm text-sm uppercase font-medium inline-block"
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
