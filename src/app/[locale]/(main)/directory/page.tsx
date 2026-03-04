import type { Metadata } from "next"
import {
  listDirectoryListings,
  listDirectoryCategories,
} from "@/lib/data/directory"
import { DirectorySearch } from "@/components/sections/DirectoryListing/DirectorySearch"

export const metadata: Metadata = {
  title: "Business Directory",
  description:
    "Browse Catholic-owned businesses in our directory. Find faithful entrepreneurs in your community.",
}

export default async function DirectoryPage() {
  const [listingsResult, categories] = await Promise.all([
    listDirectoryListings({ verification_status: "approved", limit: 20 }),
    listDirectoryCategories(),
  ])

  return (
    <main className="container px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="heading-lg text-primary mb-2">Business Directory</h1>
        <p className="text-secondary">
          Discover and support Catholic-owned businesses in your community.
        </p>
      </div>

      <DirectorySearch
        initialListings={listingsResult.listings}
        initialCount={listingsResult.count}
        categories={categories}
      />
    </main>
  )
}
