import type { Metadata } from "next"
import {
  listBarterListings,
  listBarterCategories,
} from "@/lib/data/barter"
import { BarterSearch } from "@/components/sections/Barter/BarterSearch"

export const metadata: Metadata = {
  title: "Community Marketplace",
  description:
    "Buy, sell, trade, and barter within the Catholic community. Find great deals from fellow parishioners.",
}

export default async function BarterPage() {
  const [listingsResult, categories] = await Promise.all([
    listBarterListings({ limit: 20 }),
    listBarterCategories(),
  ])

  return (
    <main className="container px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="heading-lg text-primary mb-2">Community Marketplace</h1>
        <p className="text-secondary">
          Buy, sell, trade, and barter with fellow Catholics in your community.
          Find great deals and connect with trusted members of the faith.
        </p>
      </div>

      <BarterSearch
        initialListings={listingsResult.listings}
        initialCount={listingsResult.count}
        categories={categories}
      />
    </main>
  )
}
