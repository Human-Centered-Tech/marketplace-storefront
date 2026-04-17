import type { Metadata } from "next"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { listActiveGiftGuides } from "@/lib/data/gift-guides"

export const metadata: Metadata = {
  title: "Gift Guides — Catholic Owned",
  description:
    "Curated Catholic gift collections for every occasion — Easter, sacraments, Christmas, and more.",
}

export default function GiftsHubPage() {
  const guides = listActiveGiftGuides()

  return (
    <main className="bg-catholic-lace min-h-screen">
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-16 lg:py-24 text-center">
        <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
          Gift Guides
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#17294A] uppercase mb-4">
          Gifts with Meaning
        </h1>
        <p className="font-serif text-lg italic text-[#44474e] max-w-2xl mx-auto leading-relaxed">
          Hand-picked Catholic gifts from verified artisans and businesses — for
          every sacrament, season, and saint day.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((g) => (
            <LocalizedClientLink
              key={g.slug}
              href={`/gifts/${g.slug}`}
              className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-[#d6d0c4]/40 hover:shadow-xl transition-all"
            >
              <div className="aspect-[16/9] overflow-hidden relative">
                <img
                  src={g.hero_image}
                  alt={g.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17294A]/70 via-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[#F2CD69] text-[10px] font-bold uppercase tracking-widest mb-1">
                    {g.subtitle}
                  </p>
                  <h2 className="font-serif text-2xl lg:text-3xl text-white font-bold">
                    {g.title}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <p className="font-serif text-base text-[#44474e] leading-relaxed mb-3">
                  {g.lede}
                </p>
                <span className="text-[10px] font-bold text-[#BE9B32] tracking-widest uppercase">
                  Explore collection →
                </span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </section>
    </main>
  )
}
