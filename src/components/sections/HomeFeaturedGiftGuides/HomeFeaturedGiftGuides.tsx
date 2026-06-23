import { AutoCarousel } from "@/components/cells"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { listFeaturedGiftGuides, listActiveGiftGuides } from "@/lib/data/gift-guides"

export const HomeFeaturedGiftGuides = async () => {
  const featured = await listFeaturedGiftGuides()
  // Fall back to all active guides if none are flagged featured. Keeps the
  // section meaningful before an admin has explicitly curated.
  const guides = featured.length ? featured : await listActiveGiftGuides()

  if (!guides.length) return null

  const slides = guides.map((g) => (
    <LocalizedClientLink
      key={g.slug}
      href={`/gifts/${g.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-[#d6d0c4]/40 hover:shadow-xl transition-all h-full"
    >
      <div className="aspect-[12/5] overflow-hidden relative">
        <img
          src={g.hero_image}
          alt={g.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17294A]/85 via-[#17294A]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-[#F2CD69] text-[10px] font-bold uppercase tracking-widest mb-1">
            {g.subtitle}
          </p>
          <h3 className="font-serif text-xl lg:text-2xl text-white font-bold leading-tight">
            {g.title}
          </h3>
          <span className="block mt-3 text-[10px] font-bold text-[#F2CD69] tracking-widest uppercase">
            Explore →
          </span>
        </div>
      </div>
    </LocalizedClientLink>
  ))

  return (
    <section className="pt-5 pb-10 lg:py-16 w-full bg-white px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 mb-4 lg:mb-8">
          <h2 className="font-serif text-lg md:text-4xl font-bold text-[#001435] sm:whitespace-nowrap">
            Catholic Owned<sup className="text-[0.5em] top-[-0.8em] relative ml-[2px]">&reg;</sup> Guides
          </h2>
          <div className="h-[1px] flex-grow mx-8 bg-[#BE9B32]/30 hidden sm:block" />
          <LocalizedClientLink
            href="/gifts"
            className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#BE9B32] hover:text-[#001435] transition-colors whitespace-nowrap shrink-0"
          >
            View all →
          </LocalizedClientLink>
        </div>
        <AutoCarousel
          items={slides}
          ariaLabel="Catholic Owned Guides"
          slideWidthClass="flex-[0_0_66%] sm:flex-[0_0_46%] lg:flex-[0_0_30%] xl:flex-[0_0_28%]"
          fadeColor="#ffffff"
        />
      </div>
    </section>
  )
}
