"use client"

import { DirectoryListing } from "@/types/directory"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const tierBadgeStyles: Record<string, string> = {
  // Canva tier set — visual hierarchy: local/merchant < tier2 < tier3 < tier4
  local: "bg-white text-navy-dark border border-navy-dark",
  merchant: "bg-white text-navy-dark border border-navy-dark",
  tier2_startup: "bg-navy-dark text-white",
  tier2_nonprofit: "bg-navy-dark text-white",
  tier2_business: "bg-navy-dark text-white",
  tier3: "bg-gold text-navy-dark",
  tier4: "bg-gold text-navy-dark",
  // Legacy
  enterprise: "bg-gold text-navy-dark",
  featured: "bg-navy-dark text-white",
  verified: "bg-white text-navy-dark border border-navy-dark",
}

const tierLabels: Record<string, string> = {
  // Canva tier set
  local: "Local",
  merchant: "Merchant",
  tier2_startup: "Tier 2",
  tier2_nonprofit: "Tier 2",
  tier2_business: "Tier 2",
  tier3: "Tier 3",
  tier4: "Tier 4",
  // Legacy
  enterprise: "Enterprise",
  featured: "Featured",
  verified: "Verified",
}

export const DirectoryListingCard = ({
  listing,
  featured = false,
  showDistance = false,
}: {
  listing: DirectoryListing
  featured?: boolean
  showDistance?: boolean
}) => {
  const isUnclaimed = !listing.owner_id
  const isEnterprise =
    !isUnclaimed &&
    (listing.subscription_tier === "enterprise" ||
      listing.subscription_tier === "tier3" ||
      listing.subscription_tier === "tier4")
  // Distance shipped from DirectorySearch's hitToListing — only rendered
  // when showDistance is on (i.e., proximity is from explicit user input,
  // not the silent Denver default).
  const distanceMi = (listing as { _distance_miles?: number })._distance_miles
  const distanceLabel =
    showDistance && typeof distanceMi === "number"
      ? `${distanceMi < 0.1 ? "<0.1" : distanceMi.toFixed(1)} mi away`
      : null

  // First card spans full width like the Stitch "Enterprise" card
  if (featured && isEnterprise) {
    return (
      <LocalizedClientLink
        href={`/directory/${listing.id}`}
        className="col-span-1 lg:col-span-2 bg-white rounded-2xl overflow-hidden shadow-sm group hover:shadow-xl transition-all border border-gold/20 relative block"
      >
        {/* Enterprise badge */}
        <div className="absolute top-4 right-4 z-10 bg-gold text-navy-dark px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <span
            className="material-symbols-outlined text-xs"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="label-sm text-[10px] font-bold tracking-widest">
            Enterprise
          </span>
        </div>
        <div className="flex flex-col md:flex-row">
          {listing.cover_image_url ? (
            // Cover-photo variant: hero image with optional logo badge
            <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden relative">
              <img
                src={listing.cover_image_url}
                alt={listing.business_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {listing.logo_url && (
                <div className="absolute bottom-4 left-4 h-16 w-16 rounded-full bg-white p-1 shadow-lg overflow-hidden border-2 border-gold">
                  <img
                    src={listing.logo_url}
                    alt={`${listing.business_name} logo`}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              )}
            </div>
          ) : (
            // Logo-only fallback for vendors without a cover photo
            <div className="w-full md:w-2/5 h-64 md:h-auto min-h-[200px] overflow-hidden relative bg-[#faf9f5] flex items-center justify-center p-8">
              {listing.logo_url ? (
                <img
                  src={listing.logo_url}
                  alt={`${listing.business_name} logo`}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <span className="text-navy-dark/20 font-serif text-6xl">
                  {listing.business_name.charAt(0)}
                </span>
              )}
            </div>
          )}
          <div className="p-8 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-100 uppercase">
                Verified Merchant
              </span>
              <span className="text-secondary text-xs">
                &bull; {listing.category?.name || "Business"}
              </span>
            </div>
            <h3 className="font-serif text-2xl lg:text-3xl font-bold text-navy-dark mb-2">
              {listing.business_name}
            </h3>
            {listing.description && (
              <p className="font-serif italic text-lg text-secondary mb-6 leading-relaxed line-clamp-2">
                {listing.description}
              </p>
            )}
            <div className="h-px bg-gold/30 mb-6" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {listing.address && (
                  <div className="flex items-center text-secondary text-xs">
                    <span className="material-symbols-outlined text-sm mr-1">
                      location_on
                    </span>
                    {distanceLabel && (
                      <span className="text-gold-dark font-semibold mr-2">
                        {distanceLabel}
                      </span>
                    )}
                    {[listing.address.city, listing.address.state]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
              </div>
              <span className="label-sm text-[10px] text-navy-dark font-bold tracking-[0.15em] hover:text-gold-dark transition-colors flex items-center gap-2">
                Visit Listing
                <span className="material-symbols-outlined text-xs">
                  arrow_forward
                </span>
              </span>
            </div>
          </div>
        </div>
      </LocalizedClientLink>
    )
  }

  // Standard card
  return (
    <LocalizedClientLink
      href={`/directory/${listing.id}`}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-all border block ${
        isUnclaimed ? "border-gray-200 opacity-80" : "border-gray-100/50"
      }`}
    >
      {listing.cover_image_url ? (
        // Cover-photo variant: hero image with optional logo badge
        <div className="h-48 overflow-hidden relative">
          <img
            src={listing.cover_image_url}
            alt={listing.business_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {listing.logo_url && (
            <div className="absolute bottom-4 left-4 h-12 w-12 rounded-full bg-white p-0.5 shadow-md overflow-hidden border border-gold">
              <img
                src={listing.logo_url}
                alt={`${listing.business_name} logo`}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          )}
        </div>
      ) : (
        // Logo-only fallback for vendors without a cover photo
        <div className="h-48 overflow-hidden relative bg-[#faf9f5] flex items-center justify-center p-6">
          {listing.logo_url ? (
            <img
              src={listing.logo_url}
              alt={`${listing.business_name} logo`}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-navy-dark/20 font-serif text-5xl">
              {listing.business_name.charAt(0)}
            </span>
          )}
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="text-gold-dark label-sm text-[10px] font-bold tracking-wider">
            {listing.category?.name || "Business"}
          </span>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {isUnclaimed ? (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase bg-gray-100 text-gray-700 border border-gray-300">
                Unclaimed
              </span>
            ) : (
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                  tierBadgeStyles[listing.subscription_tier] ||
                  tierBadgeStyles.verified
                }`}
              >
                {tierLabels[listing.subscription_tier] || "Verified"}
              </span>
            )}
            {listing.badges
              ?.map((lb) => lb.badge)
              .filter(Boolean)
              .map((badge) => (
                <span
                  key={badge!.id}
                  className="text-[9px] font-bold px-2 py-0.5 rounded uppercase"
                  style={{
                    backgroundColor: badge!.color || "#F2CD69",
                    color: "#17294A",
                  }}
                >
                  {badge!.name}
                </span>
              ))}
          </div>
        </div>
        <h3 className="font-serif text-xl font-bold text-navy-dark mb-3">
          {listing.business_name}
        </h3>
        {listing.description && (
          <p className="text-sm text-secondary line-clamp-2 mb-4">
            {listing.description}
          </p>
        )}
        <div className="h-px bg-gold/20 mb-4" />
        <div className="flex items-center justify-between text-xs">
          {listing.address && (
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-sm">
                location_on
              </span>
              {distanceLabel && (
                <span className="text-gold-dark font-semibold mr-1">
                  {distanceLabel}
                </span>
              )}
              {[listing.address.city, listing.address.state]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}
          <span className="label-sm text-[10px] text-navy-dark font-bold tracking-widest hover:text-gold-dark">
            Explore
          </span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
