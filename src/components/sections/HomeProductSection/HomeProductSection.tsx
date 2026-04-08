import { HomeProductsCarousel } from "@/components/organisms"
import { Product } from "@/types/product"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const HomeProductSection = async ({
  heading,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us",
  products = [],
  home = false,
}: {
  heading: string
  locale?: string
  products?: Product[]
  home?: boolean
}) => {
  return (
    <section className="py-16 lg:py-24 w-full bg-[#faf9f5] px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
      {/* Header row: title — gold line — View All */}
      <div className="flex items-center justify-between mb-12">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#001435] whitespace-nowrap">
          {heading}
        </h2>
        <div className="h-[1px] flex-grow mx-8 bg-[#BE9B32]/30 hidden sm:block" />
        <LocalizedClientLink
          href="/categories"
          className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#001435] hover:text-[#755b00] transition-colors whitespace-nowrap underline decoration-[#BE9B32] underline-offset-8"
        >
          View All Shop
        </LocalizedClientLink>
      </div>

      {/* Product grid — dynamic from API, falls back to static Stitch design */}
      <HomeProductsCarousel
        locale={locale}
        sellerProducts={products.slice(0, 4)}
        home={home}
      />
      </div>
    </section>
  )
}
