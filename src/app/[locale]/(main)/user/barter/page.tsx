import { LoginForm, UserNavigation } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { listMyBarterListings } from "@/lib/data/barter"
import { MyBarterListings } from "@/components/sections/Barter/MyBarterListings"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Barter Listings — Catholic Owned",
}

export default async function MyBarterPage() {
  const user = await retrieveCustomer()
  if (!user) return <LoginForm />

  const result = await listMyBarterListings()
  const listings = result.data?.listings || []

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="heading-xl text-primary uppercase">
              My Barter Listings
            </h1>
            <LocalizedClientLink
              href="/user/barter/create"
              className="bg-[#17294A] text-white px-5 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider hover:bg-[#0d1a38] transition-colors"
            >
              + Post a Listing
            </LocalizedClientLink>
          </div>

          <MyBarterListings listings={listings} />
        </div>
      </div>
    </main>
  )
}
