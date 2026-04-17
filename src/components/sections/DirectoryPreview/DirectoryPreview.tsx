import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import Image from "next/image"
import { listDirectoryListings } from "@/lib/data/directory"
import { DirectoryListing } from "@/types/directory"

const fallbackListings = [
  {
    id: "fallback-1",
    business_name: "St. Joseph Financial",
    category: { name: "Accounting" },
    address: { city: "Dallas", state: "TX" },
    subscription_tier: "featured" as const,
    verification_status: "approved" as const,
    cover_image_url: "/images/directory/st-joseph-financial.jpg",
    badge: "Preferred Vendor",
    badgeColor: "navy",
  },
  {
    id: "fallback-2",
    business_name: "Stella Maris Design",
    category: { name: "Web Design" },
    address: { city: "St. Louis", state: "MO" },
    subscription_tier: "enterprise" as const,
    verification_status: "approved" as const,
    cover_image_url: "/images/directory/stella-maris.jpg",
    badge: "Pillar Founding Member",
    badgeColor: "gold",
  },
  {
    id: "fallback-3",
    business_name: "Regina Caeli Goods",
    category: { name: "Sacred Art" },
    address: { city: "Denver", state: "CO" },
    subscription_tier: "featured" as const,
    verification_status: "approved" as const,
    cover_image_url: "/images/directory/regina-caeli.jpg",
    badge: "Preferred Vendor",
    badgeColor: "navy",
  },
]

function getBadge(listing: DirectoryListing) {
  if (listing.subscription_tier === "enterprise")
    return { text: "Pillar Founding Member", color: "gold" }
  if (listing.subscription_tier === "featured")
    return { text: "Featured Vendor", color: "navy" }
  if (listing.verification_status === "approved")
    return { text: "Verified", color: "navy" }
  return null
}

function StarRating({ count }: { count?: number }) {
  const rating = count || 5
  return (
    <div className="flex text-[#755b00]">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={star <= rating ? "#BE9B32" : "none"}
          stroke="#BE9B32"
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

function DirectoryCard({
  name,
  category,
  location,
  imageUrl,
  badge,
  badgeColor,
  isVerified,
  href,
}: {
  name: string
  category: string
  location: string
  imageUrl: string | null
  badge: string | null
  badgeColor: string
  isVerified: boolean
  href: string
}) {
  return (
    <LocalizedClientLink
      href={href}
      className="group bg-white rounded-xl overflow-hidden flex flex-col h-full border border-[#c5c6cf]/10 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="h-48 relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={500}
            height={250}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-[#17294a] flex items-center justify-center">
            <span className="text-[#BE9B32] font-serif text-3xl opacity-30">
              &#x2720;
            </span>
          </div>
        )}
        {badge && (
          <div
            className={`absolute top-4 left-4 text-[10px] px-3 py-1 rounded-full tracking-[0.15em] uppercase font-bold ${
              badgeColor === "gold"
                ? "bg-[#BE9B32] text-[#001435]"
                : "bg-[#001435] text-white"
            }`}
          >
            {badge}
          </div>
        )}
      </div>
      <div className="p-8 flex-grow space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="font-serif text-2xl font-bold text-[#001435] group-hover:text-[#755b00] transition-colors">
            {name}
          </h3>
          <StarRating />
        </div>
        <div className="flex gap-2">
          <span className="bg-[#755b00]/10 text-[#755b00] text-[10px] px-2 py-1 rounded font-bold uppercase tracking-[0.1em]">
            {category}
          </span>
          {isVerified && (
            <span className="bg-[#001435]/10 text-[#001435] text-[10px] px-2 py-1 rounded font-bold uppercase tracking-[0.1em] flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#001435">
                <path d="M12 1l3.22 3.22H20v4.78L23 12l-3 3v4.78h-4.78L12 23l-3.22-3.22H4v-4.78L1 12l3-3V4.22h4.78L12 1z" />
                <path d="M10 14.5l-2.5-2.5-1 1 3.5 3.5 7-7-1-1-6 6z" fill="white" />
              </svg>
              Verified
            </span>
          )}
        </div>
        <p className="text-[#44474e] flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#75777f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {location}
        </p>
      </div>
    </LocalizedClientLink>
  )
}

/**
 * Rotate the featured vendor slots daily so all Enterprise +
 * Featured-tier vendors eventually land on the homepage. Seed is the
 * current UTC day, so everyone sees the same set within a day but
 * it cycles on the date boundary. Enterprise tier is always preferred
 * over Featured.
 */
function pickFeaturedRotation<T>(pool: T[], count: number, seed: number): T[] {
  if (pool.length <= count) return pool.slice(0, count)
  // Fisher-Yates with a deterministic PRNG so the same seed returns
  // the same order for all viewers in a given day.
  const out = pool.slice()
  let state = seed
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out.slice(0, count)
}

export async function DirectoryPreview() {
  // Pull enterprise-tier pool first; featured second; verified as last
  // resort so the homepage never goes empty on a new deploy.
  const [enterprise, featured, verified] = await Promise.all([
    listDirectoryListings({
      verification_status: "approved",
      tier: "enterprise",
      limit: 30,
    } as any),
    listDirectoryListings({
      verification_status: "approved",
      tier: "featured",
      limit: 30,
    } as any),
    listDirectoryListings({
      verification_status: "approved",
      limit: 10,
    }),
  ])

  const daySeed = Math.floor(Date.now() / (24 * 60 * 60 * 1000))
  const ePicks = pickFeaturedRotation(enterprise.listings, 3, daySeed)
  const needed = Math.max(0, 3 - ePicks.length)
  const fPicks = needed
    ? pickFeaturedRotation(featured.listings, needed, daySeed + 1)
    : []
  const vNeeded = Math.max(0, 3 - ePicks.length - fPicks.length)
  const vPicks = vNeeded
    ? pickFeaturedRotation(verified.listings, vNeeded, daySeed + 2)
    : []

  const listings = [...ePicks, ...fPicks, ...vPicks].slice(0, 3)

  const hasData = listings.length > 0

  return (
    <section className="py-16 lg:py-24 w-full bg-[#f4f4f0] px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#001435] whitespace-nowrap">
            From the Directory
          </h2>
          <div className="h-[1px] flex-grow mx-8 bg-[#BE9B32]/30 hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hasData
            ? listings.map((listing) => {
                const badge = getBadge(listing)
                return (
                  <DirectoryCard
                    key={listing.id}
                    name={listing.business_name}
                    category={listing.category?.name || "Business"}
                    location={
                      listing.address
                        ? `${listing.address.city || ""}${listing.address.city && listing.address.state ? ", " : ""}${listing.address.state || ""}`
                        : "United States"
                    }
                    imageUrl={listing.cover_image_url}
                    badge={badge?.text || null}
                    badgeColor={badge?.color || "navy"}
                    isVerified={listing.verification_status === "approved"}
                    href={`/directory/${listing.id}`}
                  />
                )
              })
            : fallbackListings.map((listing) => (
                <DirectoryCard
                  key={listing.id}
                  name={listing.business_name}
                  category={listing.category.name}
                  location={`${listing.address.city}, ${listing.address.state}`}
                  imageUrl={listing.cover_image_url}
                  badge={listing.badge}
                  badgeColor={listing.badgeColor}
                  isVerified={listing.verification_status === "approved"}
                  href="/directory"
                />
              ))}
        </div>
      </div>
    </section>
  )
}
