"use client"

import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { BaseHit, Hit } from "instantsearch.js"
import clsx from "clsx"
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
  const sellerName = (api_product as any)?.store?.name
  const categoryName = (api_product as any)?.categories?.[0]?.name

  return (
    <div
      className={clsx(
        "relative group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 w-full lg:w-[calc(25%-1rem)] min-w-[250px]"
      )}
    >
      {/* Image */}
      <div className="relative h-72 overflow-hidden">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`View ${productName}`}
          title={`View ${productName}`}
        >
          {product.thumbnail ? (
            <Image
              priority
              fetchPriority="high"
              src={decodeURIComponent(product.thumbnail)}
              alt={`${productName} image`}
              width={400}
              height={400}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <Image
              priority
              fetchPriority="high"
              src="/images/placeholder.svg"
              alt={`${productName} image placeholder`}
              width={400}
              height={400}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover w-full h-full"
            />
          )}
        </LocalizedClientLink>

        {/* Heart / favorite button */}
        <button
          className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#001435] hover:text-red-500 transition-colors z-10"
          aria-label={`Add ${productName} to favorites`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Product info */}
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        aria-label={`Go to ${productName} page`}
        title={`Go to ${productName} page`}
      >
        <div className="p-6 space-y-2">
          {/* Category label */}
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#755b00]">
            {categoryName || "Liturgy & Home"}
          </p>
          {/* Product name */}
          <h3 className="font-serif text-xl font-bold text-[#001435] leading-snug">
            {product.title}
          </h3>
          {/* Vendor name */}
          <p className="text-sm text-[#75777f] font-medium italic">
            {sellerName ? `by ${sellerName}` : "by Catholic Artisan"}
          </p>
          {/* Price + Add to Cart */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#001435]">
                {cheapestPrice?.calculated_price || "View Price"}
              </span>
              {cheapestPrice?.calculated_price !==
                cheapestPrice?.original_price && (
                <span className="text-sm text-[#75777f] line-through">
                  {cheapestPrice?.original_price}
                </span>
              )}
            </div>
            <span className="bg-[#F2CD69] hover:brightness-105 text-[#001435] px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] transition-all">
              Add to Cart
            </span>
          </div>
        </div>
      </LocalizedClientLink>
    </div>
  )
}
