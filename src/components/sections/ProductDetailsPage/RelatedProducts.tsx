import Image from "next/image"
import { Product } from "@/types/product"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { listProducts } from "@/lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@/lib/helpers/get-product-price"

export const RelatedProducts = async ({
  products,
  locale,
  currentProductId,
}: {
  products: Product[]
  locale: string
  currentProductId: string
}) => {
  // Filter out null entries and the current product, then take up to 4
  const safeProducts = (products ?? []).filter(
    (p): p is Product => p != null && p.id != null
  )
  const relatedHandles = safeProducts
    .filter((p) => String(p.id) !== currentProductId)
    .slice(0, 4)
    .map((p) => p.handle)

  let apiProducts: HttpTypes.StoreProduct[] = []
  if (relatedHandles.length > 0) {
    try {
      const result = await listProducts({
        countryCode: locale,
        queryParams: {
          handle: relatedHandles,
          limit: 4,
        },
        forceCache: false,
      })
      apiProducts = result.response.products
    } catch {
      // Fall back to seller products without prices
    }
  }

  const displayProducts = safeProducts
    .filter((p) => String(p.id) !== currentProductId)
    .slice(0, 4)

  if (displayProducts.length === 0) return null

  return (
    <section className="py-16">
      {/* Section header */}
      <div className="text-center mb-12">
        <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#755b00] mb-2">
          You May Also Seek
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#001435]">
          Related Essentials
        </h2>
      </div>

      {/* 4-column product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayProducts.map((product) => {
          const apiProduct = apiProducts.find((ap) => ap.handle === product.handle)
          const { cheapestPrice } = apiProduct
            ? getProductPrice({ product: apiProduct })
            : { cheapestPrice: null }

          return (
            <LocalizedClientLink
              key={product.id}
              href={`/products/${product.handle}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative aspect-[3/4] overflow-hidden">
                  {product.thumbnail ? (
                    <Image
                      src={decodeURIComponent(product.thumbnail)}
                      alt={product.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#f4f4f0] flex items-center justify-center">
                      <span className="text-[#75777f] text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-1.5">
                  <h3 className="font-serif text-lg font-bold text-[#001435] leading-snug line-clamp-2">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-serif text-lg font-bold text-[#001435]">
                      {cheapestPrice?.calculated_price || "View Price"}
                    </span>
                  </div>
                </div>
              </div>
            </LocalizedClientLink>
          )
        })}
      </div>
    </section>
  )
}
