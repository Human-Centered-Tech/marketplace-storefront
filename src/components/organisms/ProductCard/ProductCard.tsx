"use client"

import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { BaseHit, Hit } from "instantsearch.js"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getProductPrice } from "@/lib/helpers/get-product-price"

export const ProductCard = ({
  product,
  api_product,
}: {
  product: Hit<HttpTypes.StoreProduct> | Partial<Hit<BaseHit>>
  api_product?: HttpTypes.StoreProduct | null
}) => {
  const { cheapestPrice } = api_product
    ? getProductPrice({ product: api_product as HttpTypes.StoreProduct })
    : { cheapestPrice: null }

  const productName = String(product.title || "Product")
  const categoryName = (api_product as any)?.categories?.[0]?.name

  const priceLabel = cheapestPrice?.calculated_price ?? "View Price"

  return (
    <article className="flex flex-col group">
      {/* Image with category badge */}
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        aria-label={`View ${productName}`}
        title={`View ${productName}`}
        className="block aspect-[4/5] overflow-hidden bg-[#f7f4ec] relative rounded-lg"
      >
        {product.thumbnail ? (
          <Image
            priority
            fetchPriority="high"
            src={decodeURIComponent(product.thumbnail)}
            alt={`${productName} image`}
            width={400}
            height={500}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <Image
            priority
            fetchPriority="high"
            src="/images/placeholder.svg"
            alt={`${productName} image placeholder`}
            width={400}
            height={500}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover w-full h-full"
          />
        )}
        {categoryName && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-[#75777f]">
            {categoryName}
          </span>
        )}
      </LocalizedClientLink>

      {/* Title + price + Add to Cart */}
      <div className="mt-6 space-y-2">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`Go to ${productName} page`}
          title={`Go to ${productName} page`}
        >
          <h4 className="text-base font-semibold text-[#001435]">
            {productName}
          </h4>
        </LocalizedClientLink>
        <p className="font-serif text-2xl text-[#001435]">{priceLabel}</p>
        <button className="w-full py-3 bg-[#BE9B32] hover:brightness-110 text-[#001435] text-sm font-bold tracking-wide rounded-full mt-4 transition-all duration-300 uppercase shadow-sm">
          Add to Cart
        </button>
      </div>
    </article>
  )
}
