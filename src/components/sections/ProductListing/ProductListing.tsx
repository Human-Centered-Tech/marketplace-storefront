import {
  ProductListingHeader,
  ProductSidebar,
  ProductsList,
  ProductsPagination,
} from "@/components/organisms"
import { PRODUCT_LIMIT } from "@/const"
import { listProductsWithSort } from "@/lib/data/products"
import { listCategories } from "@/lib/data/categories"
import { SortOptions } from "@/types/product"

export const ProductListing = async ({
  category_id,
  collection_id,
  seller_id,
  showSidebar = false,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us",
  searchQuery,
  maxPrice,
  sortBy,
  page = 1,
}: {
  category_id?: string
  collection_id?: string
  seller_id?: string
  showSidebar?: boolean
  locale?: string
  searchQuery?: string
  maxPrice?: number
  sortBy?: string
  page?: number
}) => {
  const validSorts: SortOptions[] = ["created_at", "price_asc", "price_desc"]
  const resolvedSort: SortOptions = validSorts.includes(sortBy as SortOptions)
    ? (sortBy as SortOptions)
    : "created_at"

  const [{ response }, categoryData] = await Promise.all([
    listProductsWithSort({
      page,
      seller_id,
      category_id,
      collection_id,
      countryCode: locale,
      sortBy: resolvedSort,
      queryParams: {
        limit: PRODUCT_LIMIT,
        ...(searchQuery ? { q: searchQuery } : {}),
      },
    }),
    showSidebar
      ? listCategories()
      : Promise.resolve({ categories: [], parentCategories: [] }),
  ])

  let { products, count } = response

  // Hide PRICELESS products (published but no variant has a price — the
  // Shopify-import case: prices are deliberately not imported, and some
  // vendors published before pricing). A product with no price can't be
  // bought; rendering it as a "View Price" ghost card just confuses shoppers
  // and inflates the "N listings" count (Brooke 7/23, Holy Face Cross).
  // Per-page approximation like the maxPrice filter below: we subtract this
  // page's removals from the displayed total, which is exact for single-page
  // stores (the common case) and close enough for paginated browse.
  const beforePriceless = products.length
  products = products.filter((p) =>
    p.variants?.some(
      (v: any) => v.calculated_price?.calculated_amount != null
    )
  )
  count = Math.max(0, count - (beforePriceless - products.length))

  // Client-side price filter is per-page only — when this filter is
  // active the total count is no longer trustworthy for pagination,
  // but for now we trust the listProductsWithSort total since maxPrice
  // is the only client-only filter.
  if (maxPrice && maxPrice < 1000) {
    products = products.filter((p) => {
      const cheapest = p.variants?.reduce((min, v) => {
        const price = (v as any).calculated_price?.calculated_amount
        if (price != null && price < min) return price
        return min
      }, Infinity)
      return cheapest !== undefined && cheapest <= maxPrice
    })
  }

  const pages = Math.max(1, Math.ceil(count / PRODUCT_LIMIT))

  // Extract unique sellers from the visible page's products for the
  // sidebar filter. (Sidebar shows only sellers represented on the
  // current page — acceptable since this list narrows search.)
  const sellersMap = new Map<string, string>()
  products.forEach((p: any) => {
    if (p.seller?.id && p.seller?.name) {
      sellersMap.set(p.seller.id, p.seller.name)
    }
  })
  const sellers = Array.from(sellersMap, ([id, name]) => ({ id, name }))

  return (
    <div className="py-4">
      <div className="flex flex-col md:flex-row gap-8">
        {showSidebar && (
          <div className="w-full md:w-64 flex-shrink-0">
            <ProductSidebar
              categories={categoryData.categories}
              sellers={sellers}
            />
          </div>
        )}
        <section className="flex-1 min-w-0">
          <ProductListingHeader
            total={count}
            page={page}
            pageSize={PRODUCT_LIMIT}
          />
          <div
            className={`grid grid-cols-2 ${
              showSidebar ? "lg:grid-cols-3" : "lg:grid-cols-4"
            } gap-x-3 gap-y-8 md:gap-x-8 md:gap-y-16`}
          >
            <ProductsList products={products} />
          </div>
          <ProductsPagination pages={pages} />
        </section>
      </div>
    </div>
  )
}
