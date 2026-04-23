import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { listSellerCollections } from "@/lib/data/vendor-collections"

// Normalize a URL — the local file backend can return URLs with spaces and
// commas in the path that next/image rejects. The URL constructor encodes
// path components without double-encoding existing %XX sequences.
const normalizeUrl = (url: string): string => {
  try {
    return new URL(url).href
  } catch {
    return url
  }
}

export const SellerCollectionsStrip = async ({ handle }: { handle: string }) => {
  const collections = await listSellerCollections(handle)

  if (collections.length === 0) return null

  return (
    <div className="w-full max-w-7xl mx-auto px-8 mt-4 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-[#001435]">
          Collections
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
        {collections.map((c) => (
          <LocalizedClientLink
            key={c.id}
            href={`/sellers/${handle}/collections/${c.slug}`}
            className="group shrink-0 snap-start w-64 border border-[#755b00]/20 hover:border-[#755b00] rounded-lg overflow-hidden bg-white transition-colors"
          >
            <div className="relative aspect-[5/3] bg-[#f4f4f0]">
              {c.image_url ? (
                <Image
                  src={normalizeUrl(c.image_url)}
                  alt={c.title}
                  fill
                  sizes="256px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#75777f] text-xs uppercase tracking-widest">
                  {c.title}
                </div>
              )}
            </div>
            <div className="flex flex-col px-4 py-3">
              <span className="font-serif text-lg font-bold text-[#001435] group-hover:text-[#755b00] transition-colors truncate">
                {c.title}
              </span>
              {c.subtitle && (
                <span className="font-sans text-xs text-[#75777f] mt-1 truncate">
                  {c.subtitle}
                </span>
              )}
              <span className="font-sans text-[11px] uppercase tracking-widest text-[#75777f] mt-2">
                {c.product_count} {c.product_count === 1 ? "item" : "items"}
              </span>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}
