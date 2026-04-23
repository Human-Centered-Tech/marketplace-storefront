import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getSellerCollection } from "@/lib/data/vendor-collections"
import { getSellerByHandle } from "@/lib/data/seller"
import { SellerProps } from "@/types/seller"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; slug: string; locale: string }>
}): Promise<Metadata> {
  const { handle, slug } = await params
  const detail = await getSellerCollection(handle, slug, { limit: 1 })
  if (!detail) return { title: "Collection" }
  return {
    title: detail.collection.title,
    description:
      detail.collection.description ||
      detail.collection.subtitle ||
      `Products in ${detail.collection.title}`,
  }
}

export default async function SellerCollectionPage({
  params,
}: {
  params: Promise<{ handle: string; slug: string; locale: string }>
}) {
  const { handle, slug, locale } = await params
  const seller = (await getSellerByHandle(handle)) as SellerProps
  const detail = await getSellerCollection(handle, slug, { limit: 48 })

  if (!detail) {
    notFound()
  }

  const { collection, products, count } = detail

  return (
    <main className="w-full max-w-7xl mx-auto px-8 py-10 text-[#1b1c1a]">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-[#75777f]">
          <li>
            <LocalizedClientLink
              href={`/sellers/${handle}`}
              className="hover:text-[#755b00] transition-colors"
            >
              {(seller as any)?.name ?? "Shop"}
            </LocalizedClientLink>
          </li>
          <li aria-hidden="true" className="select-none">
            /
          </li>
          <li className="text-[#001435] font-semibold truncate max-w-[260px]">
            {collection.title}
          </li>
        </ol>
      </nav>

      {/* Hero image */}
      {collection.image_url && (
        <div className="relative w-full aspect-[5/2] mb-10 rounded-xl overflow-hidden bg-[#f4f4f0]">
          <Image
            src={(() => {
              try {
                return new URL(collection.image_url).href
              } catch {
                return collection.image_url!
              }
            })()}
            alt={collection.title}
            fill
            priority
            sizes="(min-width: 1024px) 1100px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-10">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#001435]">
          {collection.title}
        </h1>
        {collection.subtitle && (
          <p className="font-serif italic text-lg text-[#75777f] mt-2">
            {collection.subtitle}
          </p>
        )}
        {collection.description && (
          <p className="font-sans text-base text-[#44474e] mt-4 max-w-3xl leading-relaxed">
            {collection.description}
          </p>
        )}
        <p className="font-sans text-[11px] uppercase tracking-widest text-[#755b00] mt-6">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </header>

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="border border-dashed rounded-xl py-20 text-center">
          <p className="font-serif text-xl text-[#001435]">
            No products in this collection yet.
          </p>
          <p className="font-sans text-sm text-[#75777f] mt-2">
            Check back soon — the shop is still growing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <LocalizedClientLink
              key={product.id}
              href={`/products/${product.handle}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative aspect-[3/4] overflow-hidden">
                  {product.thumbnail ? (
                    <Image
                      src={decodeURIComponent(product.thumbnail)}
                      alt={product.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#f4f4f0] flex items-center justify-center">
                      <span className="text-[#75777f] text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg font-bold text-[#001435] leading-snug line-clamp-2">
                    {product.title}
                  </h3>
                </div>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      )}
    </main>
  )
}
