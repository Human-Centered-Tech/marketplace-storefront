"use client"

import { DirectoryListing } from "@/types/directory"

const tierBadgeStyles: Record<string, string> = {
  enterprise: "bg-yellow-100 text-yellow-800 border-yellow-300",
  featured: "bg-blue-100 text-blue-800 border-blue-300",
  verified: "bg-green-100 text-green-800 border-green-300",
}

const dayNames = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

export const DirectoryDetail = ({
  listing,
}: {
  listing: DirectoryListing
}) => {
  return (
    <div>
      {/* Cover image */}
      {listing.cover_image_url && (
        <div className="aspect-[3/1] overflow-hidden rounded-sm mb-6">
          <img
            src={listing.cover_image_url}
            alt={listing.business_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex items-start gap-4 mb-6">
            {listing.logo_url && (
              <img
                src={listing.logo_url}
                alt={`${listing.business_name} logo`}
                className="w-16 h-16 rounded-sm object-contain border"
              />
            )}
            <div>
              <h1 className="heading-lg text-primary">{listing.business_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {listing.category && (
                  <span className="label-sm text-secondary">
                    {listing.category.name}
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded border ${
                    tierBadgeStyles[listing.subscription_tier] ||
                    tierBadgeStyles.verified
                  }`}
                >
                  {listing.subscription_tier}
                </span>
              </div>
            </div>
          </div>

          {listing.description && (
            <div className="mb-6">
              <h2 className="heading-sm text-primary mb-2">About</h2>
              <p className="text-secondary whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          {/* Parish affiliations */}
          {listing.affiliations && listing.affiliations.length > 0 && (
            <div className="mb-6">
              <h2 className="heading-sm text-primary mb-2">
                Parish Affiliations
              </h2>
              <ul className="space-y-1">
                {listing.affiliations.map((aff) => (
                  <li key={aff.id} className="text-secondary text-sm">
                    {aff.parish?.name}
                    {aff.parish?.diocese && ` - ${aff.parish.diocese}`}
                    {aff.parish?.city &&
                      aff.parish?.state &&
                      ` (${aff.parish.city}, ${aff.parish.state})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gallery */}
          {listing.gallery_urls && listing.gallery_urls.length > 0 && (
            <div className="mb-6">
              <h2 className="heading-sm text-primary mb-2">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.gallery_urls.map((url, i) => (
                  <div
                    key={i}
                    className="aspect-square overflow-hidden rounded-sm"
                  >
                    <img
                      src={url}
                      alt={`${listing.business_name} photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact info */}
          <div className="border rounded-sm p-4">
            <h2 className="heading-sm text-primary mb-3">Contact</h2>
            <div className="space-y-2 text-sm">
              {listing.contact_phone && (
                <a
                  href={`tel:${listing.contact_phone}`}
                  className="block text-secondary hover:text-primary"
                >
                  {listing.contact_phone}
                </a>
              )}
              {listing.contact_email && (
                <a
                  href={`mailto:${listing.contact_email}`}
                  className="block text-secondary hover:text-primary"
                >
                  {listing.contact_email}
                </a>
              )}
              {listing.website_url && (
                <a
                  href={listing.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-secondary hover:text-primary"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>

          {/* Address */}
          {listing.address && (
            <div className="border rounded-sm p-4">
              <h2 className="heading-sm text-primary mb-3">Location</h2>
              <p className="text-sm text-secondary">
                {listing.address.street && <>{listing.address.street}<br /></>}
                {[listing.address.city, listing.address.state, listing.address.zip]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          )}

          {/* Hours */}
          {listing.hours && Object.keys(listing.hours).length > 0 && (
            <div className="border rounded-sm p-4">
              <h2 className="heading-sm text-primary mb-3">Hours</h2>
              <div className="space-y-1 text-sm">
                {dayNames.map((day) => {
                  const h = listing.hours?.[day]
                  return (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize text-secondary">{day}</span>
                      <span className="text-primary">
                        {h ? `${h.open} - ${h.close}` : "Closed"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Social links */}
          {listing.social_links &&
            Object.values(listing.social_links).some(Boolean) && (
              <div className="border rounded-sm p-4">
                <h2 className="heading-sm text-primary mb-3">Social</h2>
                <div className="flex gap-3">
                  {listing.social_links.facebook && (
                    <a
                      href={listing.social_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-secondary hover:text-primary"
                    >
                      Facebook
                    </a>
                  )}
                  {listing.social_links.instagram && (
                    <a
                      href={listing.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-secondary hover:text-primary"
                    >
                      Instagram
                    </a>
                  )}
                  {listing.social_links.twitter && (
                    <a
                      href={listing.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-secondary hover:text-primary"
                    >
                      Twitter
                    </a>
                  )}
                  {listing.social_links.linkedin && (
                    <a
                      href={listing.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-secondary hover:text-primary"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
