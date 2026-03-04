"use client"

import { DirectoryListing } from "@/types/directory"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const tierBadgeStyles: Record<string, string> = {
  enterprise: "bg-yellow-100 text-yellow-800 border-yellow-300",
  featured: "bg-blue-100 text-blue-800 border-blue-300",
  verified: "bg-green-100 text-green-800 border-green-300",
}

const tierLabels: Record<string, string> = {
  enterprise: "Enterprise",
  featured: "Featured",
  verified: "Verified",
}

export const DirectoryListingCard = ({
  listing,
}: {
  listing: DirectoryListing
}) => {
  return (
    <LocalizedClientLink
      href={`/directory/${listing.id}`}
      className="block border rounded-sm hover:shadow-md transition-shadow"
    >
      {listing.cover_image_url ? (
        <div className="aspect-[16/9] overflow-hidden rounded-t-sm">
          <img
            src={listing.cover_image_url}
            alt={listing.business_name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gray-100 rounded-t-sm flex items-center justify-center">
          {listing.logo_url ? (
            <img
              src={listing.logo_url}
              alt={listing.business_name}
              className="max-h-16 max-w-[80%] object-contain"
            />
          ) : (
            <span className="text-gray-400 text-lg">
              {listing.business_name.charAt(0)}
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="heading-xs text-primary line-clamp-1">
            {listing.business_name}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${
              tierBadgeStyles[listing.subscription_tier] || tierBadgeStyles.verified
            }`}
          >
            {tierLabels[listing.subscription_tier] || "Verified"}
          </span>
        </div>

        {listing.category && (
          <p className="label-sm text-secondary mb-1">{listing.category.name}</p>
        )}

        {listing.description && (
          <p className="text-sm text-secondary line-clamp-2 mb-2">
            {listing.description}
          </p>
        )}

        {listing.address && (
          <p className="text-xs text-secondary">
            {[listing.address.city, listing.address.state]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </div>
    </LocalizedClientLink>
  )
}
