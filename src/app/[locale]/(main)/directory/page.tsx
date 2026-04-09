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
    <main className="bg-[#FAF9F5]">
      <style>{`body { background-image: none !important; }`}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {/* Hero Section */}
      <header className="pt-16 pb-20 bg-[#FAF9F5] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="font-serif text-5xl md:text-7xl text-navy-dark mb-6 tracking-tight">
            Trusted Partners
          </h1>
          <p className="font-serif italic text-xl md:text-2xl text-secondary max-w-2xl mx-auto leading-relaxed">
            Strengthen the domestic church through the new Catholic Economy&reg;
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-5xl mx-auto px-6 mt-16">
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
