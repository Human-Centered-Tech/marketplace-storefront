import type { Metadata } from "next"
import {
  listDirectoryListings,
  listDirectoryCategories,
} from "@/lib/data/directory"
import { DirectorySearch } from "@/components/sections/DirectoryListing/DirectorySearch"

export const metadata: Metadata = {
  title: "Business Directory - Catholic Owned",
  description:
    "Strengthen the domestic church through the New Catholic Economy. Browse Catholic-owned businesses in our directory.",
}

export default async function DirectoryPage() {
  const [listingsResult, categories] = await Promise.all([
    listDirectoryListings({ verification_status: "approved", limit: 20 }),
    listDirectoryCategories(),
  ])

  return (
    <main className="bg-[#FAF9F5]">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {/* Search */}
      <header className="pt-10 pb-12 bg-[#FAF9F5] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <DirectorySearch
            initialListings={listingsResult.listings}
            initialCount={listingsResult.count}
            categories={categories}
          />
        </div>
      </header>
    </main>
  )
}
