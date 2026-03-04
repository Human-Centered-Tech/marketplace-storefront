"use client"

import { BarterListing } from "@/types/barter"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const typeBadgeStyles: Record<string, string> = {
  sell: "bg-green-100 text-green-800 border-green-300",
  trade: "bg-blue-100 text-blue-800 border-blue-300",
  barter: "bg-purple-100 text-purple-800 border-purple-300",
  free: "bg-yellow-100 text-yellow-800 border-yellow-300",
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

export const BarterListingCard = ({
  listing,
}: {
  listing: BarterListing
}) => {
  const imageUrl = listing.images?.[0]?.url

  return (
    <LocalizedClientLink
      href={`/barter/${listing.id}`}
      className="block border rounded-sm hover:shadow-md transition-shadow"
    >
      {imageUrl ? (
        <div className="aspect-square overflow-hidden rounded-t-sm">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-gray-100 rounded-t-sm flex items-center justify-center">
          <span className="text-gray-400 text-lg">
            {listing.title.charAt(0)}
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="heading-xs text-primary line-clamp-1">
            {listing.title}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${
              typeBadgeStyles[listing.listing_type] || typeBadgeStyles.sell
            }`}
          >
            {typeLabels[listing.listing_type] || listing.listing_type}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-secondary border rounded px-1.5 py-0.5">
            {conditionLabels[listing.condition] || listing.condition}
          </span>
          {listing.listing_type === "sell" && listing.price && (
            <span className="text-sm font-medium text-primary">
              {formatPrice(listing.price)}
            </span>
          )}
        </div>

        {listing.description && (
          <p className="text-sm text-secondary line-clamp-2 mb-2">
            {listing.description}
          </p>
        )}

        {listing.location && (
          <p className="text-xs text-secondary">
            {[listing.location.city, listing.location.state]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </div>
    </LocalizedClientLink>
  )
}
