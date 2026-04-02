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
      {/* Hero banner */}
      <div className="bg-navy-dark py-12 lg:py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="label-sm text-white/50 tracking-[0.15em] mb-3">
            Faith-Led Commerce
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4">
            Sacred Exchange
          </h1>
          <p className="text-[16px] text-white/70 italic">
            &ldquo;Strengthening our community through faithful barter and
            trade.&rdquo;
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <BarterSearch
          initialListings={listingsResult.listings}
          initialCount={listingsResult.count}
          categories={categories}
        />
      </div>
    </main>
  )
}
