import type { Metadata } from "next"
import { listBarterListings, listBarterCategories } from "@/lib/data/barter"
import { BarterSearch } from "@/components/sections/Barter/BarterSearch"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const metadata: Metadata = {
  title: "Sacred Exchange",
  description:
    "Strengthening our community through faithful trade. List your liturgical goods, artisan crafts, or vocational services.",
}

export default async function BarterPage() {
  const [listingsResult, categories] = await Promise.all([
    listBarterListings({ limit: 20 }),
    listBarterCategories(),
  ])

  return (
    <main className="bg-[#FAF9F5]">
      {/* Material Symbols for icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      {/* Hero Section — shared flat-hero pattern (eyebrow → display H1 →
          italic serif lead), matched to the Directory/Marketplace/Events
          heroes so all four read the same. */}
      <section className="relative py-16 lg:py-24 px-4 text-center overflow-hidden bg-[#FAF9F5]">
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="label-sm text-gold-dark tracking-[0.3em] mb-4 font-bold opacity-80">
            Building the New Catholic Economy®
          </p>
          <h1 className="display-md text-navy-dark mb-6 tracking-tight">
            Sacred Exchange
          </h1>
          <p className="font-serif text-xl italic text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
            &ldquo;Strengthening our community through faithful trade.&rdquo;
          </p>
          <LocalizedClientLink
            href="/user/trade/create"
            className="inline-flex items-center px-6 py-3 bg-[#F2CD69] text-[#001435] text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xs hover:bg-[#e8be4a] transition-colors"
          >
            + Post a Listing
          </LocalizedClientLink>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gold/30" />
      </section>

      {/* Search, Filters & Listings */}
      <BarterSearch
        initialListings={listingsResult.listings}
        initialCount={listingsResult.count}
        categories={categories}
      />
    </main>
  )
}
