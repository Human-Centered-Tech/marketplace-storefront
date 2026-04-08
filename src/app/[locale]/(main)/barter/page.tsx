import type { Metadata } from "next"
import { listBarterListings, listBarterCategories } from "@/lib/data/barter"
import { BarterSearch } from "@/components/sections/Barter/BarterSearch"

export const metadata: Metadata = {
  title: "Sacred Exchange",
  description:
    "Strengthening our community through faithful barter and trade. List your liturgical goods, artisan crafts, or vocational services.",
}

export default async function BarterPage() {
  const [listingsResult, categories] = await Promise.all([
    listBarterListings({ limit: 20 }),
    listBarterCategories(),
  ])

  return (
    <main>
      {/* Material Symbols for icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-24 lg:pb-28 px-4 overflow-hidden bg-cream">
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{
          backgroundImage: "radial-gradient(#DECF8F 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <p className="label-sm text-gold-dark tracking-[0.3em] mb-4 opacity-80">
            Faith-Led Commerce
          </p>
          <h1 className="display-md text-navy-dark mb-6 tracking-tight">
            Sacred Exchange
          </h1>
          <p className="font-serif text-xl lg:text-2xl italic text-secondary max-w-2xl mx-auto leading-relaxed">
            &ldquo;Strengthening our community through faithful barter
            and trade.&rdquo;
          </p>
        </div>
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
