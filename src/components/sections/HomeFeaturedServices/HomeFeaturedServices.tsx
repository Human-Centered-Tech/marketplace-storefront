import { AutoCarousel } from "@/components/cells"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { listFeaturedListings } from "@/lib/data/directory"
import { DirectoryListing } from "@/types/directory"

// Compact card built for the double-row carousel layout. Half the height of
// the standard DirectoryListingCard so two stack inside the same section
// height as one Featured Product card.
const CompactListingCard = ({ listing }: { listing: DirectoryListing }) => {
  const initial = listing.business_name.charAt(0)
  return (
    <LocalizedClientLink
      href={`/directory/${listing.id}`}
      // Fixed height keeps the two rows aligned regardless of name wrap or
      // missing location. h-24 image + h-20 text + borders = ~h-44 total.
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
        <p className="text-[10px] text-secondary mt-1 flex items-center gap-0.5 truncate">
          {listing.address && (listing.address.city || listing.address.state) ? (
            <>
              <span className="material-symbols-outlined text-[11px]">
                location_on
              </span>
              <span className="truncate">
                {[listing.address.city, listing.address.state]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </>
          ) : (
            // Reserve the line so missing-location cards don't collapse
            <span aria-hidden="true">&nbsp;</span>
          )}
        </p>
      </div>
    </LocalizedClientLink>
  )
}

export const HomeFeaturedServices = async () => {
  // Pull the curated featured-listing rows (already joined to live listing
  // data by /store/featured-listings). Section hides when nothing is curated.
  const listings = await listFeaturedListings()
  if (!listings.length) return null

  // Double-row layout kicks in at 10+ curated items. Below that the carousel
  // collapses to a single row so a short list doesn't get visually padded
  // with half-empty columns.
  const DOUBLE_ROW_THRESHOLD = 10
  const isDoubleRow = listings.length >= DOUBLE_ROW_THRESHOLD

  const slides = isDoubleRow
    ? (() => {
        const columns: DirectoryListing[][] = []
        for (let i = 0; i < listings.length; i += 2) {
          columns.push(listings.slice(i, i + 2))
        }
        return columns.map((pair, i) => (
          <div key={`col-${i}`} className="flex flex-col gap-3">
            {pair.map((l) => (
              <CompactListingCard key={l.id} listing={l} />
            ))}
          </div>
        ))
      })()
    : listings.map((l) => <CompactListingCard key={l.id} listing={l} />)

  return (
    <section className="py-12 lg:py-16 w-full bg-[#faf9f5] px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#001435] whitespace-nowrap">
            Featured Services
          </h2>
          <div className="h-[1px] flex-grow mx-8 bg-[#BE9B32]/30 hidden sm:block" />
          <LocalizedClientLink
            href="/directory"
            className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#001435] hover:text-[#755b00] transition-colors whitespace-nowrap underline decoration-[#BE9B32] underline-offset-8"
          >
            View All Directory
          </LocalizedClientLink>
        </div>
        <AutoCarousel
          items={slides}
          ariaLabel="Featured services"
          // 5 columns visible on desktop (20% each); progressively fewer on
          // smaller screens so cards don't shrink to unreadable widths.
          slideWidthClass="flex-[0_0_70%] sm:flex-[0_0_42%] md:flex-[0_0_30%] lg:flex-[0_0_24%] xl:flex-[0_0_20%]"
          fadeColor="#faf9f5"
        />
      </div>
    </section>
  )
}
