import type { Metadata } from "next"
import {
  listDirectoryListings,
  listDirectoryCategories,
} from "@/lib/data/directory"
import { DirectorySearch } from "@/components/sections/DirectoryListing/DirectorySearch"

export const metadata: Metadata = {
  title: "Trusted Partners - Business Directory",
  description:
    "Strengthen the domestic church through the New Catholic Economy. Browse Catholic-owned businesses in our directory.",
}

export default async function DirectoryPage() {
  const [listingsResult, categories] = await Promise.all([
    listDirectoryListings({ verification_status: "approved", limit: 20 }),
    listDirectoryCategories(),
  ])

  return (
    <main>
      {/* Hero banner */}
      <div className="bg-navy-dark py-12 lg:py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4">
            Trusted Partners
          </h1>
          <p className="text-[16px] text-white/70 italic">
            Strengthen the domestic church through the new Catholic Economy®
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <DirectorySearch
          initialListings={listingsResult.listings}
          initialCount={listingsResult.count}
          categories={categories}
        />
      </div>
    </main>
  )
}
