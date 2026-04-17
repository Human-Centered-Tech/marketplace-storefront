import type { Metadata } from "next"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getGiftGuide } from "@/lib/data/gift-guides"
import { listProducts } from "@/lib/data/products"
import { ProductCard } from "@/components/organisms/ProductCard/ProductCard"
import { TrackPageView } from "@/components/sections/Analytics/TrackPageView"

type Props = {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = getGiftGuide(slug)
  if (!guide) return { title: "Not Found" }
  return {
    title: `${guide.title} — Catholic Owned`,
    description: guide.lede,
  }
}

export default async function GiftGuidePage({ params }: Props) {
  const { slug, locale } = await params
  const guide = getGiftGuide(slug)
  if (!guide) notFound()

  // Filter marketplace products by the guide's tag set. Tags in Mercur
  // are normalized to lowercase slugs; we pass both comma-separated
  // forms to maximize matches.
  let products: any[] = []
  try {
    const { response } = await listProducts({
      countryCode: locale,
      queryParams: {
        limit: 60,
        tags: guide.tags,
      } as any,
    })
    products = response.products || []
  } catch {
    products = []
  }

  return (
    <main className="bg-[#faf9f5] min-h-screen">
      <TrackPageView entity_type="gift_guide" entity_id={guide.slug} />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[380px] lg:min-h-[55vh] flex items-center">
        <img
          src={guide.hero_image}
          alt={guide.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#17294A]/80 via-[#17294A]/50 to-transparent" />
        <div className="relative z-10 max-w-4xl px-6 lg:px-16">
          <LocalizedClientLink
            href="/gifts"
            className="text-[#F2CD69] text-xs uppercase tracking-widest mb-4 inline-flex items-center gap-1 hover:text-white"
          >
            ← All Gift Guides
          </LocalizedClientLink>
          <p className="text-[#F2CD69] text-[12px] font-semibold uppercase tracking-[0.2em] mb-3 mt-2">
            {guide.subtitle}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold text-white uppercase leading-tight mb-4">
            {guide.title}
          </h1>
          <p className="font-serif text-base lg:text-lg italic text-white/80 max-w-xl leading-relaxed">
            {guide.lede}
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-serif text-lg text-[#17294A] mb-3">
              We&rsquo;re still gathering products for this guide.
            </p>
            <p className="text-sm text-[#44474e] max-w-md mx-auto">
              Check back soon, or{" "}
              <LocalizedClientLink
                href="/categories"
                className="text-[#BE9B32] underline"
              >
                browse the full marketplace
              </LocalizedClientLink>{" "}
              in the meantime.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-[10px] font-bold text-[#BE9B32] uppercase tracking-widest">
                {products.length} Curated Pick{products.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                  api_product={product as any}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
