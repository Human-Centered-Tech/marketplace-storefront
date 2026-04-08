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
}: {
  category_id?: string
  collection_id?: string
  seller_id?: string
  showSidebar?: boolean
  locale?: string
  searchQuery?: string
  maxPrice?: number
  sortBy?: string
}) => {
  const validSorts: SortOptions[] = ["created_at", "price_asc", "price_desc"]
  const resolvedSort: SortOptions = validSorts.includes(sortBy as SortOptions)
    ? (sortBy as SortOptions)
    : "created_at"

  const [{ response }, categoryData] = await Promise.all([
    listProductsWithSort({
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

  let { products } = await response

  // Client-side price filter
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

  const count = products.length
  const pages = Math.ceil(count / PRODUCT_LIMIT) || 1

  // Extract unique sellers from all products
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
          <ProductListingHeader total={count} />
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              showSidebar ? "lg:grid-cols-3" : "lg:grid-cols-4"
            } gap-6`}
          >
            <ProductsList products={products} />
          </div>
          <ProductsPagination pages={pages} />
        </section>
      </div>
    </div>
  )
}
