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
    case "barter": return "BARTER"
    case "sell": return "FOR SALE"
    case "free": return "FREE"
    default: return "EXCHANGE"
  }
}

function BarterCard({
  category,
  title,
  href,
}: {
  category: string
  title: string
  href: string
}) {
  return (
    <div
      className="rounded-xl p-8 space-y-6 hover:bg-[#1e3660]/80 transition-all border border-[#BE9B32]/40"
      style={{ backgroundColor: "#1e3660" }}
    >
      <div className="space-y-1">
        <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#BE9B32] font-bold">
          {category}
        </span>
        <h4 className="font-serif text-lg font-medium text-white leading-tight">
          {title}
        </h4>
      </div>
      <LocalizedClientLink
        href={href}
        className="inline-block text-white text-[10px] font-sans tracking-[0.15em] uppercase border border-white/20 px-4 py-2 rounded-lg hover:bg-white hover:text-[#001435] transition-all"
      >
        Message Lister
      </LocalizedClientLink>
    </div>
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
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white italic">
            Community Trade &amp; Barter
          </h2>
          <div className="h-[1px] flex-grow bg-white/20" />
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hasData
            ? listings.map((listing: BarterListing) => (
                <BarterCard
                  key={listing.id}
                  category={listingTypeLabel(listing.listing_type)}
                  title={listing.title}
                  href={`/barter/${listing.id}`}
                />
              ))
            : fallbackItems.map((item) => (
                <BarterCard
                  key={item.id}
                  category={item.category}
                  title={item.title}
                  href="/barter"
                />
              ))}
        </div>
      </div>
    </section>
  )
}
