import { Carousel } from "@/components/cells"
import { ProductCard } from "../ProductCard/ProductCard"
import { listProducts } from "@/lib/data/products"
import { Product } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const fallbackProducts = [
  {
    id: "1",
    title: "Artisan Beeswax Pillars",
    category: "Liturgy & Home",
    vendor: "Sacred Scents Co.",
    price: "$42.00",
    image: "/images/products/beeswax-candles.jpg",
    handle: "artisan-beeswax-pillar-candles",
  },
  {
    id: "2",
    title: "Olive Wood Rosary",
    category: "Prayer Tools",
    vendor: "Bethlehem Crafts",
    price: "$58.00",
    image: "/images/products/olive-rosary.jpg",
    handle: "olive-wood-rosary",
  },
  {
    id: "3",
    title: "Gilded Duo-Tone Bible",
    category: "Scripture",
    vendor: "Grace Publishers",
    price: "$125.00",
    image: "/images/products/gilded-bible.jpg",
    handle: "gilded-duo-tone-bible",
  },
  {
    id: "4",
    title: "Rose of Sharon Candle",
    category: "Liturgy & Home",
    vendor: "Marian Artisans",
    price: "$35.00",
    image: "/images/products/rose-candle.jpg",
    handle: "rose-of-sharon-candle",
  },
]

export const HomeProductsCarousel = async ({
  locale,
  sellerProducts,
  home,
}: {
  locale: string
  sellerProducts: Product[]
  home: boolean
}) => {
  let products: (HttpTypes.StoreProduct & { seller?: any })[] = []

  try {
    const result = await listProducts({
      countryCode: locale,
      queryParams: {
        limit: home ? 8 : undefined,
        order: "created_at",
        handle: home
          ? undefined
          : sellerProducts.map((product) => product.handle),
      },
      forceCache: false,
    })
    products = result.response.products
    console.log(`[HomeProductsCarousel] SUCCESS: ${products.length} products for locale=${locale}`)
  } catch (e: any) {
    console.log(`[HomeProductsCarousel] ERROR: ${e?.message || e}`)
  }

  const hasProducts = products.length > 0 || sellerProducts.length > 0

  // Dynamic products from API
  if (hasProducts) {
    const displayProducts = sellerProducts.length ? sellerProducts : products
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
        {displayProducts.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            api_product={
              home
                ? (product as HttpTypes.StoreProduct)
                : products.find((p) => p.id === product.id)
            }
          />
        ))}
      </div>
    )
  }

  // Fallback static grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {fallbackProducts.map((product) => (
        <LocalizedClientLink
          key={product.id}
          href={`/products/${product.handle}`}
          className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
        >
          <div className="relative h-72 overflow-hidden">
            <Image
              src={product.image}
              alt={product.title}
              width={400}
              height={400}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#001435]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>
          <div className="p-6 space-y-2">
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#755b00]">
              {product.category}
            </p>
            <h3 className="font-serif text-xl font-bold text-[#001435]">
              {product.title}
            </h3>
            <p className="text-sm text-[#75777f] font-medium italic">
              by {product.vendor}
            </p>
            <div className="flex items-center justify-between pt-4">
              <span className="text-lg font-bold text-[#001435]">
                {product.price}
              </span>
              <span className="bg-[#BE9B32] text-[#001435] px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em]">
                Add to Cart
              </span>
            </div>
          </div>
        </LocalizedClientLink>
      ))}
    </div>
  )
}
