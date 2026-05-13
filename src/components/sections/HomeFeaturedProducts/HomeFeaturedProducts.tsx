import { AutoCarousel } from "@/components/cells"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getRegion } from "@/lib/data/regions"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { HttpTypes } from "@medusajs/types"

type FeaturedRow = { product_id: string; sort_order: number }

const PRODUCT_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,*seller,*variants,*attribute_values,*attribute_values.attribute"

function backendUrl() {
  return process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
}

function publishableKey() {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
}

async function fetchFeaturedProductIds(): Promise<FeaturedRow[]> {
  try {
    const res = await fetch(`${backendUrl()}/store/featured-products?featured=true`, {
      headers: { "x-publishable-api-key": publishableKey() },
      next: { revalidate: 60, tags: ["featured-products"] },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.featured_products || []) as FeaturedRow[]
  } catch {
    return []
  }
}

// Fetch products by an explicit id list. We can't go through the SDK's
// listProducts here because @medusajs/js-sdk serializes array query params as
// `id=p1,p2,...` (CSV), and /store/products only accepts repeated `id[]=p1&
// id[]=p2`. Building the query manually keeps a single round-trip while
// preserving the field expansion the carousel needs for price + thumbnail.
async function fetchProductsByIds(
  ids: string[],
  regionId: string,
  countryCode: string
): Promise<HttpTypes.StoreProduct[]> {
  if (!ids.length) return []
  const params = new URLSearchParams()
  params.set("country_code", countryCode)
  params.set("region_id", regionId)
  params.set("limit", String(ids.length))
  params.set("fields", PRODUCT_FIELDS)
  for (const id of ids) params.append("id[]", id)

  try {
    const res = await fetch(`${backendUrl()}/store/products?${params.toString()}`, {
      headers: { "x-publishable-api-key": publishableKey() },
      next: { revalidate: 60, tags: ["featured-products"] },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.products || []) as HttpTypes.StoreProduct[]
  } catch {
    return []
  }
}

// Compact product card mirroring the Featured Services layout: fixed h-44,
// h-24 image, h-20 content. Two stack inside the same section height.
const CompactProductCard = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  const { cheapestPrice } = getProductPrice({ product })
  const priceLabel = cheapestPrice?.calculated_price ?? "View Price"
  const title = String(product.title || "Product")

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition-all border border-gray-100/50 block h-44 flex flex-col"
      title={`View ${title}`}
    >
      {product.thumbnail ? (
        <div className="h-24 shrink-0 overflow-hidden relative bg-[#faf9f5]">
          <img
            src={decodeURIComponent(product.thumbnail)}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-24 shrink-0 overflow-hidden relative bg-[#faf9f5] flex items-center justify-center p-3">
          <span className="text-[#001435]/20 font-serif text-3xl">
            {title.charAt(0)}
          </span>
        </div>
      )}
      <div className="p-3 flex-1 flex flex-col justify-between min-h-0">
        <h3 className="font-serif text-sm font-bold text-[#001435] leading-tight line-clamp-2">
          {title}
        </h3>
        <p className="font-serif text-sm text-[#001435] mt-1 truncate">
          {priceLabel}
        </p>
      </div>
    </LocalizedClientLink>
  )
}

export const HomeFeaturedProducts = async ({
  locale,
}: {
  locale: string
}) => {
  // Pull the ordered product_ids from the featured-product table, then ask
  // Medusa for full product data for those IDs. The carousel shows only
  // products the admin has explicitly toggled on; section hides when none.
  const curated = await fetchFeaturedProductIds()
  if (!curated.length) return null

  const region = await getRegion(locale)
  if (!region) return null

  const ids = curated.map((c) => c.product_id)
  const fetched = await fetchProductsByIds(ids, region.id, locale)

  // Preserve admin-defined sort order — /store/products doesn't honor the id-list order.
  const order = new Map(curated.map((c, i) => [c.product_id, i]))
  const products = fetched.slice().sort((a, b) => {
    const ai = order.get(a.id) ?? Number.MAX_SAFE_INTEGER
    const bi = order.get(b.id) ?? Number.MAX_SAFE_INTEGER
    return ai - bi
  })

  if (!products.length) return null

  // Double-row layout kicks in at 10+ curated items. Below that the carousel
  // collapses to a single row so a short list doesn't get visually padded
  // with half-empty columns.
  const DOUBLE_ROW_THRESHOLD = 10
  const isDoubleRow = products.length >= DOUBLE_ROW_THRESHOLD

  const slides = isDoubleRow
    ? (() => {
        const columns: HttpTypes.StoreProduct[][] = []
        for (let i = 0; i < products.length; i += 2) {
          columns.push(products.slice(i, i + 2))
        }
        return columns.map((pair, i) => (
          <div key={`col-${i}`} className="flex flex-col gap-3">
            {pair.map((p) => (
              <CompactProductCard key={p.id} product={p} />
            ))}
          </div>
        ))
      })()
    : products.map((p) => <CompactProductCard key={p.id} product={p} />)

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
          // 5 columns visible on xl; scales down on smaller breakpoints to
          // keep cards readable. Matches Featured Services for visual rhythm.
          slideWidthClass="flex-[0_0_70%] sm:flex-[0_0_42%] md:flex-[0_0_30%] lg:flex-[0_0_24%] xl:flex-[0_0_20%]"
          fadeColor="#faf9f5"
        />
      </div>
    </section>
  )
}
