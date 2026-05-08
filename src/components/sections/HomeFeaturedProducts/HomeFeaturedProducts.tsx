import { AutoCarousel } from "@/components/cells"
import { ProductCard } from "@/components/organisms/ProductCard/ProductCard"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { listProducts } from "@/lib/data/products"
import { HttpTypes } from "@medusajs/types"

type FeaturedRow = { product_id: string; sort_order: number }

async function fetchFeaturedProductIds(): Promise<FeaturedRow[]> {
  const backend = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  try {
    const res = await fetch(`${backend}/store/featured-products?featured=true`, {
      headers: {
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      next: { revalidate: 60, tags: ["featured-products"] },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.featured_products || []) as FeaturedRow[]
  } catch {
    return []
  }
}

export const HomeFeaturedProducts = async ({
  locale,
}: {
  locale: string
}) => {
  // Pull the ordered product_ids from the featured-product table, then
  // ask Medusa for full product data for those IDs. Live join means
  // thumbnails / titles / prices always reflect the latest vendor edits.
  // The section hides entirely when nothing is curated — the carousel
  // shows only products the admin has explicitly toggled on.
  const curated = await fetchFeaturedProductIds()
  if (!curated.length) return null

  let products: (HttpTypes.StoreProduct & { seller?: any })[] = []
  try {
    const { response } = await listProducts({
      countryCode: locale,
      queryParams: {
        limit: curated.length,
        id: curated.map((c) => c.product_id),
      } as any,
    })
    // Preserve admin-defined sort order (listProducts doesn't honor it).
    const order = new Map(curated.map((c, i) => [c.product_id, i]))
    products = (response.products || []).slice().sort((a, b) => {
      const ai = order.get(a.id) ?? Number.MAX_SAFE_INTEGER
      const bi = order.get(b.id) ?? Number.MAX_SAFE_INTEGER
      return ai - bi
    })
  } catch {
    products = []
  }

  if (!products.length) return null

  const slides = products.map((p) => (
    <ProductCard key={p.id} product={p as any} api_product={p} />
  ))

  return (
    <section className="py-12 lg:py-16 w-full bg-[#faf9f5] px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#001435] whitespace-nowrap">
            Featured Products
          </h2>
          <div className="h-[1px] flex-grow mx-8 bg-[#BE9B32]/30 hidden sm:block" />
          <LocalizedClientLink
            href="/categories"
            className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#001435] hover:text-[#755b00] transition-colors whitespace-nowrap underline decoration-[#BE9B32] underline-offset-8"
          >
            View All Shop
          </LocalizedClientLink>
        </div>
        <AutoCarousel
          items={slides}
          ariaLabel="Featured products"
          slideWidthClass="flex-[0_0_82%] sm:flex-[0_0_46%] lg:flex-[0_0_30%] xl:flex-[0_0_24%]"
          fadeColor="#faf9f5"
        />
      </div>
    </section>
  )
}
