import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { listBarterListings } from "@/lib/data/barter"
import { BarterListing } from "@/types/barter"

const fallbackItems = [
  { id: "f1", category: "SERVICE FOR SERVICE", title: "Graphic Design for Legal Consulting" },
  { id: "f2", category: "EDUCATION EXCHANGE", title: "Piano Lessons for Home Cleaning" },
  { id: "f3", category: "RESOURCE SHARE", title: "Used Catholic Textbooks (Grade 3-5)" },
  { id: "f4", category: "HOME MAINTENANCE", title: "Plumbing Work for Mass Intentions" },
]

function listingTypeLabel(type: string) {
  switch (type) {
    case "trade": return "TRADE"
    case "barter": return "TRADE"
    case "sell": return "FOR SALE"
    case "free": return "FREE"
    default: return "EXCHANGE"
  }
}

function BarterCard({
  category,
  title,
  href,
  imageUrl,
}: {
  category: string
  title: string
  href: string
  imageUrl?: string
}) {
  return (
    <LocalizedClientLink
      href={href}
      className="group flex flex-col rounded-xl overflow-hidden hover:bg-[#1e3660]/80 transition-all border border-[#BE9B32]/40"
      style={{ backgroundColor: "#1e3660" }}
    >
      {/* Listing image — piques curiosity */}
      <div className="aspect-[4/3] overflow-hidden relative bg-[#17294a]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#BE9B32]/30 font-serif text-4xl">
              {title.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="p-8 space-y-6 flex flex-col flex-grow">
        <div className="space-y-1">
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#BE9B32] font-bold">
            {category}
          </span>
          <h4 className="font-serif text-lg font-medium text-white leading-tight">
            {title}
          </h4>
        </div>
        <span className="mt-auto inline-block self-start text-white text-[10px] font-sans tracking-[0.15em] uppercase border border-white/20 px-4 py-2 rounded-lg group-hover:bg-white group-hover:text-[#001435] transition-all">
          View Listing
        </span>
      </div>
    </LocalizedClientLink>
  )
}

export const BannerSection = async () => {
  const { listings } = await listBarterListings({ limit: 4 })

  const hasData = listings.length > 0

  return (
    <section
      className="w-full py-16 lg:py-24 px-4 lg:px-8 overflow-hidden relative"
      style={{ backgroundColor: "#001435" }}
    >
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#BE9B32]/10 blur-[150px] rounded-full -mr-48 -mt-48" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-16">
          {/* Match the other home section headers (437b2d5 reduced those to
              2xl/3xl; this one was missed). */}
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white">
            Sacred Exchange
          </h2>
          <div className="h-[1px] flex-grow bg-white/20" />
          <LocalizedClientLink
            href="/trade"
            className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#F2CD69] hover:text-white transition-colors whitespace-nowrap underline decoration-[#BE9B32] underline-offset-8"
          >
            View All →
          </LocalizedClientLink>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hasData
            ? listings.map((listing: BarterListing) => (
                <BarterCard
                  key={listing.id}
                  category={listingTypeLabel(listing.listing_type)}
                  title={listing.title}
                  href={`/trade/${listing.id}`}
                  imageUrl={listing.images?.[0]?.url}
                />
              ))
            : fallbackItems.map((item) => (
                <BarterCard
                  key={item.id}
                  category={item.category}
                  title={item.title}
                  href="/trade"
                />
              ))}
        </div>
      </div>
    </section>
  )
}
