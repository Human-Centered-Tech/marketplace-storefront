"use client"

import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { BaseHit, Hit } from "instantsearch.js"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { useWishlist } from "@/lib/context/WishlistContext"
import { HeartFilledIcon, HeartIcon } from "@/icons"

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
  // Algolia hit carries `subtitle` (e.g. an artist / maker name). Shown
  // between the title and price when present; never breaks the card when
  // absent. Cast to any because the union type narrows to a partial hit.
  const productSubtitle = String((product as any).subtitle || "").trim()
  const categoryName = (api_product as any)?.categories?.[0]?.name

  const priceLabel = cheapestPrice?.calculated_price ?? "View Price"

  // Prefer the live Medusa product image (the same source the product detail
  // page renders, which is known-good) and fall back to the Algolia hit's
  // image data only if the API product carries none. Vendors often upload
  // product images without explicitly marking one as the thumbnail, so fall
  // back to the first gallery image in either source.
  const cardImage =
    (api_product as any)?.thumbnail ||
    (api_product as any)?.images?.[0]?.url ||
    product.thumbnail ||
    (product as any).images?.[0]?.url ||
    null

  const wishlist = useWishlist()
  const productId = String(
    (product as any).id ?? (product as any).objectID ?? ""
  )
  const favorited = !!productId && !!wishlist?.isFavorited(productId)

  return (
    <article className="flex flex-col group h-full">
      {/* Image with category badge — fixed 4:5 aspect, so all images match in
          a row. The grid stretches articles to equal height; the text block
          below uses flex-1 + mt-auto on the button so cards align even when
          titles wrap differently. */}
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        aria-label={`View ${productName}`}
        title={`View ${productName}`}
        className="block aspect-[4/5] overflow-hidden bg-[#f7f4ec] relative rounded-lg"
      >
        {cardImage ? (
          <Image
            priority
            fetchPriority="high"
            src={decodeURIComponent(cardImage)}
            alt={`${productName} image`}
            width={400}
            height={500}
            sizes="(min-width: 1024px) 25vw, 50vw"
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
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover w-full h-full"
          />
        )}
        {categoryName && (
          <span className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/90 backdrop-blur px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-[#75777f]">
            {categoryName}
          </span>
        )}
        {wishlist?.isLoggedIn && productId && (
          <button
            type="button"
            onClick={(e) => {
              // Inside the card's link — don't navigate.
              e.preventDefault()
              e.stopPropagation()
              wishlist.toggle(productId)
            }}
            aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            {favorited ? (
              <HeartFilledIcon size={18} color="#DB2777" />
            ) : (
              <HeartIcon size={18} color="#DB2777" />
            )}
          </button>
        )}
      </LocalizedClientLink>

      {/* Title + price + Add to Cart */}
      <div className="mt-3 md:mt-6 flex flex-col flex-1">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`Go to ${productName} page`}
          title={`Go to ${productName} page`}
        >
          <h4 className="text-sm md:text-base font-semibold text-[#001435] leading-snug line-clamp-2 min-h-[2.25rem] md:min-h-[2.75rem]">
            {productName}
          </h4>
        </LocalizedClientLink>
        {productSubtitle && (
          <p className="text-xs md:text-sm italic text-[#75777f] leading-snug line-clamp-1 mt-0.5">
            {productSubtitle}
          </p>
        )}
        <p className="font-serif text-lg md:text-2xl text-[#001435] mt-1">
          {priceLabel}
        </p>
        {/* Routes to the product detail page where the real add-to-cart
            flow lives (variant picker, stock check, optimistic cart
            update). Direct add-from-card would need to either auto-pick
            a variant or open a quick-pick popover — punting on that
            until we have a clear product call.
            mt-auto pins the wrapper to the bottom of the flex column;
            pt-8 inside the wrapper guarantees ≥2rem of breathing room
            above the button regardless of the overall card height. */}
        <div className="mt-auto pt-3 md:pt-4">
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="w-full py-2 md:py-3 bg-gradient-to-r from-[#F2CD69] to-[#BE9B32] hover:brightness-110 text-white text-xs md:text-sm font-bold tracking-wide rounded-full transition-all duration-300 uppercase shadow-sm text-center block"
          >
            View Product
          </LocalizedClientLink>
        </div>
      </div>
    </article>
  )
}
