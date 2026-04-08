import type { Metadata } from "next"
import Image from "next/image"
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
      <section className="relative min-h-[340px] lg:min-h-[420px] overflow-hidden">
        <Image
          src="/images/hero/barter-hero.jpg"
          fill
          alt="Sacred Exchange - beeswax candles"
          className="object-cover object-center"
          priority
          quality={80}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#001435]/85 via-[#001435]/60 to-[#001435]/40" />
        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-20 pb-24 lg:pt-24 lg:pb-28 max-w-5xl mx-auto">
          <p className="label-sm text-[#F2CD69] tracking-[0.3em] mb-4 opacity-90">
            Faith-Led Commerce
          </p>
          <h1 className="display-md text-white mb-6 tracking-tight drop-shadow-lg">
            Sacred Exchange
          </h1>
          <p className="font-serif text-xl lg:text-2xl italic text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow">
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
