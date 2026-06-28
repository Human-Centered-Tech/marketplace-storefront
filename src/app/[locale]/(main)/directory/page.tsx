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

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 px-4 text-center overflow-hidden bg-[#FAF9F5]">
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="label-sm text-gold-dark tracking-[0.3em] mb-4 font-bold opacity-80">
            The New Catholic Economy
          </p>
          <h1 className="display-md text-navy-dark mb-6 tracking-tight">
            Business Directory
          </h1>
          <p className="font-serif text-xl italic text-secondary max-w-2xl mx-auto leading-relaxed">
            Strengthen the domestic church through the New Catholic Economy.
            Browse Catholic-owned businesses in our directory.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gold/30" />
      </section>

      {/* Search */}
      {/* Width stays max-w-5xl to match the 2-col results grid; full width
          unification waits for the grid restructure (NEEDS-APPROVAL w/ Brooke). */}
      <header className="pt-10 pb-12 bg-[#FAF9F5] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
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
