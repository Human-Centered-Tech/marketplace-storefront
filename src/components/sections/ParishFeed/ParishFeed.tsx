import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getRegion } from "@/lib/data/regions"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { getParishFeed, fetchProductsByIds } from "@/lib/data/parishes"
import { DirectoryListing } from "@/types/directory"
import { BarterListing } from "@/types/barter"

/**
 * One parish's feed — the three home-page-mirroring sections (From the
 * Directory / From the Marketplace / Sacred Exchange), filtered to a single
 * parish. Server component; used by both /parishes (per followed parish)
 * and the public /parishes/[id] page.
 *
 * The compact cards mirror HomeFeaturedServices' CompactListingCard and
 * HomeFeaturedProducts' CompactProductCard (those are file-local, not
 * exported); Sacred Exchange mirrors BannerSection's BarterCard.
 */

const ListingCard = ({ listing }: { listing: DirectoryListing }) => {
  const initial = listing.business_name.charAt(0)
  return (
    <LocalizedClientLink
      href={`/directory/${listing.id}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition-all border border-gray-100/50 block h-44 flex flex-col"
    >
      {listing.cover_image_url ? (
        <div className="h-24 shrink-0 overflow-hidden relative">
          <img
            src={listing.cover_image_url}
            alt={listing.business_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {listing.logo_url && (
            <div className="absolute bottom-1.5 left-1.5 h-8 w-8 rounded-full bg-white p-0.5 shadow-md overflow-hidden border border-[#BE9B32]">
              <img
                src={listing.logo_url}
                alt={`${listing.business_name} logo`}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="h-24 shrink-0 overflow-hidden relative bg-[#faf9f5] flex items-center justify-center p-3">
          {listing.logo_url ? (
            <img
              src={listing.logo_url}
              alt={`${listing.business_name} logo`}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-[#001435]/20 font-serif text-3xl">
              {initial}
            </span>
          )}
        </div>
      )}
      <div className="p-3 flex-1 flex flex-col justify-between min-h-0">
        <h3 className="font-serif text-sm font-bold text-[#001435] leading-tight line-clamp-2">
          {listing.business_name}
        </h3>
        <p className="text-[10px] text-secondary mt-1 truncate">
          {[listing.address?.city, listing.address?.state]
            .filter(Boolean)
            .join(", ") || " "}
        </p>
      </div>
    </LocalizedClientLink>
  )
}

const ProductCard = ({ product }: { product: HttpTypes.StoreProduct }) => {
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

function tradeTypeLabel(type: string) {
  switch (type) {
    case "trade":
    case "barter":
      return "TRADE"
    case "sell":
      return "FOR SALE"
    case "free":
      return "FREE"
    default:
      return "EXCHANGE"
  }
}

const TradeCard = ({ listing }: { listing: BarterListing }) => (
  <LocalizedClientLink
    href={`/trade/${listing.id}`}
    className="group flex flex-col rounded-xl overflow-hidden hover:bg-[#1e3660]/80 transition-all border border-[#BE9B32]/40"
    style={{ backgroundColor: "#1e3660" }}
  >
    <div className="aspect-[4/3] overflow-hidden relative bg-[#17294a]">
      {listing.images?.[0]?.url ? (
        <img
          src={listing.images[0].url}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[#BE9B32]/30 font-serif text-4xl">
            {listing.title.charAt(0)}
          </span>
        </div>
      )}
    </div>
    <div className="p-4 space-y-1">
      <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#BE9B32] font-bold">
        {tradeTypeLabel(listing.listing_type)}
      </span>
      <h4 className="font-serif text-base font-medium text-white leading-tight line-clamp-2">
        {listing.title}
      </h4>
    </div>
  </LocalizedClientLink>
)

const SubHeading = ({
  title,
  href,
  hrefLabel,
  dark,
}: {
  title: string
  href: string
  hrefLabel: string
  dark?: boolean
}) => (
  <div className="flex items-center justify-between mb-5">
    <h3
      className={`font-serif text-xl md:text-2xl font-semibold ${dark ? "text-white" : "text-[#001435]"}`}
    >
      {title}
    </h3>
    <div
      className={`h-[1px] flex-grow mx-6 hidden sm:block ${dark ? "bg-white/20" : "bg-[#BE9B32]/30"}`}
    />
    <LocalizedClientLink
      href={href}
      className={`font-sans text-[11px] font-bold uppercase tracking-[0.15em] transition-colors whitespace-nowrap shrink-0 underline decoration-[#BE9B32] underline-offset-8 ${
        dark ? "text-[#F2CD69] hover:text-white" : "text-[#001435] hover:text-[#755b00]"
      }`}
    >
      {hrefLabel} →
    </LocalizedClientLink>
  </div>
)

export const ParishFeed = async ({
  parishId,
  locale,
  showParishName = false,
}: {
  parishId: string
  locale: string
  showParishName?: boolean
}) => {
  const feed = await getParishFeed(parishId)
  if (!feed) return null

  const region = await getRegion(locale)
  const products = region
    ? await fetchProductsByIds(feed.product_ids, region.id, locale)
    : []

  const { parish, listings, barter_listings } = feed
  const hasAnything =
    listings.length > 0 || products.length > 0 || barter_listings.length > 0

  return (
    <div className="space-y-10">
      {showParishName && (
        <div className="border-b border-[#BE9B32]/30 pb-3">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#001435]">
            {parish.name}
          </h2>
          <p className="text-sm text-secondary mt-1">
            {[parish.city, parish.state].filter(Boolean).join(", ")}
            {parish.diocese ? ` · ${parish.diocese}` : ""}
          </p>
        </div>
      )}

      {!hasAnything && (
        <div className="rounded-2xl border border-[#BE9B32]/30 bg-white p-8 text-center">
          <p className="font-serif text-lg text-[#001435]">
            No businesses or listings are connected to this parish yet.
          </p>
          <p className="text-sm text-secondary mt-2">
            Own a Catholic business near this parish?{" "}
            <LocalizedClientLink
              href="/directory"
              className="underline decoration-[#BE9B32] underline-offset-4"
            >
              Add your parish affiliation in the directory.
            </LocalizedClientLink>
          </p>
        </div>
      )}

      {listings.length > 0 && (
        <div>
          <SubHeading
            title="From the Directory"
            href="/directory"
            hrefLabel="View All"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <SubHeading
            title="From the Marketplace"
            href="/categories"
            hrefLabel="View All"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {barter_listings.length > 0 && (
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ backgroundColor: "#001435" }}
        >
          <SubHeading
            title="Sacred Exchange"
            href="/trade"
            hrefLabel="View All"
            dark
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {barter_listings.map((b) => (
              <TradeCard key={b.id} listing={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
