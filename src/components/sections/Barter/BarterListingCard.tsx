"use client"

import { BarterListing } from "@/types/barter"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const typeBadgeStyles: Record<string, string> = {
  sell: "bg-[#3D7A4A]/90 text-white",
  trade: "bg-[#F2CD69]/90 text-[#17294A]",
  barter: "bg-[#17294A]/90 text-white",
  free: "bg-[#DECF8F]/90 text-[#17294A]",
}

const typeLabels: Record<string, string> = {
  sell: "For Sale",
  trade: "Trade",
  barter: "Barter",
  free: "Free",
}

const conditionLabels: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
}

function formatPrice(price: number | null) {
  if (price === null || price === 0) return null
  return `$${(price / 100).toFixed(2)}`
}

function timeAgo(dateString: string) {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}

export const BarterListingCard = ({
  listing,
}: {
  listing: BarterListing
}) => {
  const imageUrl = listing.images?.[0]?.url

  return (
    <LocalizedClientLink
      href={`/barter/${listing.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
    >
      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-300 text-4xl font-serif">
              {listing.title.charAt(0)}
            </span>
          </div>
        )}
        {/* Type badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`backdrop-blur-md px-3 py-1 rounded-full label-sm text-[10px] ${
              typeBadgeStyles[listing.listing_type] || typeBadgeStyles.sell
            }`}
          >
            {typeLabels[listing.listing_type] || listing.listing_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-serif text-lg font-medium text-navy-dark leading-tight line-clamp-1">
            {listing.title}
          </h3>
          <span className="material-symbols-outlined text-gold-light hover:text-gold cursor-pointer shrink-0 text-xl">
            favorite
          </span>
        </div>

        <p className="label-sm text-[10px] text-secondary tracking-widest mb-4">
          {conditionLabels[listing.condition] || listing.condition}
          {listing.listing_type === "sell" && listing.price
            ? ` · ${formatPrice(listing.price)}`
            : ""}
        </p>

        <div className="mt-auto pt-4 flex flex-col gap-1.5 border-t border-gray-100">
          {listing.location && (
            <div className="flex items-center gap-1 text-secondary text-sm">
              <span className="material-symbols-outlined text-sm">
                location_on
              </span>
              {[listing.location.city, listing.location.state]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}
          <div className="flex items-center gap-1 text-tertiary text-xs italic">
            <span className="material-symbols-outlined text-xs">schedule</span>
            {timeAgo(listing.created_at)}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
