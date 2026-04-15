"use client"

import { DirectoryListing } from "@/types/directory"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const tierLabels: Record<string, string> = {
  enterprise: "Enterprise Tier",
  featured: "Premium Tier",
  verified: "Verified Business",
}

const dayLabels: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
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

const ctaLabels: Record<string, string> = {
  visit_shop: "Visit Our Shop",
  book_now: "Book Now",
  shop_now: "Shop Now",
  learn_more: "Learn More",
  book_a_call: "Book a Call",
}

export const DirectoryDetail = ({
  listing,
}: {
  listing: DirectoryListing
}) => {
  const locationStr = listing.address
    ? [listing.address.city, listing.address.state, listing.address.zip]
        .filter(Boolean)
        .join(", ")
    : null

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[400px] lg:h-[460px] w-full overflow-hidden">
        {listing.cover_image_url ? (
          <img
            src={listing.cover_image_url}
            alt={listing.business_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-navy-dark flex items-center justify-center">
            <span className="text-white/10 font-serif text-[12rem]">
              {listing.business_name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#17294A]/60 to-transparent" />
      </section>

      {/* Header Info Overlay */}
      <section className="max-w-7xl mx-auto px-6 -mt-24 relative z-10">
        <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col md:flex-row items-center md:items-end gap-8">
          {/* Logo / Initial */}
          <div className="w-28 h-28 lg:w-32 lg:h-32 bg-navy-dark rounded-xl flex items-center justify-center border-4 border-[#FAF9F5] shadow-inner shrink-0">
            {listing.logo_url ? (
              <img
                src={listing.logo_url}
                alt={`${listing.business_name} logo`}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <span className="font-serif text-[#F2CD69] text-4xl lg:text-5xl">
                {listing.business_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 3)}
              </span>
            )}
          </div>

          {/* Business name + badges */}
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <span className="bg-[#F2CD69] text-navy-dark px-3 py-1 rounded-full label-sm text-[10px] font-bold tracking-widest">
                {tierLabels[listing.subscription_tier] || "Verified"}
              </span>
              {listing.verification_status === "approved" && (
                <div className="flex items-center text-navy-dark gap-1">
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span className="label-sm text-[10px] font-medium tracking-wider">
                    Verified Business
                  </span>
                </div>
              )}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-navy-dark mb-2">
              {listing.business_name}
            </h1>
            {listing.category && (
              <p className="font-serif italic text-lg text-secondary">
                {listing.category.name}
                {locationStr && ` \u2022 ${locationStr}`}
              </p>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="flex gap-3 shrink-0">
            {listing.contact_phone && (
              <a
                href={`tel:${listing.contact_phone}`}
                className="p-3 rounded-xl bg-gray-100 text-navy-dark hover:bg-[#F2CD69]/30 transition-colors"
              >
                <span className="material-symbols-outlined">call</span>
              </a>
            )}
            {listing.contact_email && (
              <a
                href={`mailto:${listing.contact_email}`}
                className="p-3 rounded-xl bg-gray-100 text-navy-dark hover:bg-[#F2CD69]/30 transition-colors"
              >
                <span className="material-symbols-outlined">mail</span>
              </a>
            )}
            {listing.website_url && (
              <a
                href={listing.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-gray-100 text-navy-dark hover:bg-[#F2CD69]/30 transition-colors"
              >
                <span className="material-symbols-outlined">language</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-16">
            {/* About / Description */}
            {listing.description && (
              <div>
                <h2 className="label-sm text-[10px] text-gold-dark font-bold tracking-[0.2em] mb-4">
                  ABOUT THE BUSINESS
                </h2>
                <div className="h-px w-full bg-gold/30 mb-8" />
                <div className="font-serif text-xl leading-relaxed text-primary whitespace-pre-wrap">
                  {listing.description}
                </div>
              </div>
            )}

            {/* Owner Interview */}
            {listing.owner_interview &&
              ([1, 2, 3, 4] as const).some(
                (n) => (listing.owner_interview as any)?.[`q${n}_answer`]
              ) && (
                <div>
                  <h2 className="label-sm text-[10px] text-gold-dark font-bold tracking-[0.2em] mb-4">
                    MEET THE OWNER
                  </h2>
                  <div className="h-px w-full bg-gold/30 mb-8" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {listing.owner_interview.photo_url && (
                      <div className="md:col-span-1">
                        <img
                          src={listing.owner_interview.photo_url}
                          alt="Owner"
                          className="w-full aspect-square object-cover rounded-xl"
                        />
                      </div>
                    )}
                    <div
                      className={`space-y-5 ${
                        listing.owner_interview.photo_url
                          ? "md:col-span-2"
                          : "md:col-span-3"
                      }`}
                    >
                      {([1, 2, 3, 4] as const).map((n) => {
                        const prompt = (listing.owner_interview as any)?.[
                          `q${n}_prompt`
                        ]
                        const answer = (listing.owner_interview as any)?.[
                          `q${n}_answer`
                        ]
                        if (!answer) return null
                        return (
                          <div key={n}>
                            <p className="font-serif italic text-secondary mb-1">
                              {prompt}
                            </p>
                            <p className="font-serif text-lg text-primary whitespace-pre-wrap">
                              {answer}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

            {/* Devotional */}
            {listing.devotional &&
              (listing.devotional.question || listing.devotional.image_url) && (
                <div>
                  <h2 className="label-sm text-[10px] text-gold-dark font-bold tracking-[0.2em] mb-4">
                    DEVOTIONAL
                  </h2>
                  <div className="h-px w-full bg-gold/30 mb-8" />
                  <div className="bg-gray-50 p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {listing.devotional.image_url && (
                      <img
                        src={listing.devotional.image_url}
                        alt="Devotional"
                        className="w-full aspect-square object-cover rounded-xl md:col-span-1"
                      />
                    )}
                    <div
                      className={
                        listing.devotional.image_url
                          ? "md:col-span-2"
                          : "md:col-span-3"
                      }
                    >
                      {listing.devotional.question && (
                        <p className="font-serif italic text-lg text-navy-dark mb-2">
                          {listing.devotional.question}
                        </p>
                      )}
                      {listing.devotional.answer && (
                        <p className="font-serif text-primary whitespace-pre-wrap">
                          {listing.devotional.answer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Parish Affiliations */}
            {listing.affiliations && listing.affiliations.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-xl flex items-center gap-4">
                <span className="material-symbols-outlined text-gold-dark">
                  church
                </span>
                <div>
                  <p className="label-sm text-[10px] text-secondary tracking-widest">
                    PARISH AFFILIATION
                  </p>
                  {listing.affiliations.map((aff) => (
                    <p
                      key={aff.id}
                      className="font-serif text-lg text-navy-dark font-bold"
                    >
                      {aff.parish?.name}
                      {aff.parish?.city &&
                        aff.parish?.state &&
                        ` \u2014 ${aff.parish.city}, ${aff.parish.state}`}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {listing.gallery_urls && listing.gallery_urls.length > 0 && (
              <div>
                <h2 className="label-sm text-[10px] text-gold-dark font-bold tracking-[0.2em] mb-4">
                  GALLERY
                </h2>
                <div className="h-px w-full bg-gold/30 mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {listing.gallery_urls.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt={`${listing.business_name} photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {listing.social_links &&
              Object.values(listing.social_links).some(Boolean) && (
                <div>
                  <h2 className="label-sm text-[10px] text-gold-dark font-bold tracking-[0.2em] mb-4">
                    FOLLOW US
                  </h2>
                  <div className="h-px w-full bg-gold/30 mb-8" />
                  <div className="flex gap-4">
                    {listing.social_links.facebook && (
                      <a
                        href={listing.social_links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-gray-100 text-navy-dark hover:bg-[#F2CD69]/30 transition-colors"
                      >
                        <span className="material-symbols-outlined">group</span>
                      </a>
                    )}
                    {listing.social_links.instagram && (
                      <a
                        href={listing.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-gray-100 text-navy-dark hover:bg-[#F2CD69]/30 transition-colors"
                      >
                        <span className="material-symbols-outlined">
                          photo_camera
                        </span>
                      </a>
                    )}
                    {listing.social_links.twitter && (
                      <a
                        href={listing.social_links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-gray-100 text-navy-dark hover:bg-[#F2CD69]/30 transition-colors"
                      >
                        <span className="material-symbols-outlined">share</span>
                      </a>
                    )}
                    {listing.social_links.linkedin && (
                      <a
                        href={listing.social_links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-gray-100 text-navy-dark hover:bg-[#F2CD69]/30 transition-colors"
                      >
                        <span className="material-symbols-outlined">
                          work
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Right Column / Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* CTA Card — conditional per 4/1 */}
            {(() => {
              const ctaType = listing.cta_type || "visit_shop"
              const hasShop = Boolean(listing.vendor_id)
              let href: string | null = null
              let label = ctaLabels[ctaType] || "Learn More"

              if (ctaType === "visit_shop") {
                if (hasShop) {
                  href = `/sellers/${listing.slug}`
                  label = "Visit Our Shop"
                } else if (listing.website_url) {
                  href = listing.website_url
                  label = "Visit Website"
                }
              } else {
                href = listing.cta_url || null
              }

              if (!href) return null

              const external = href.startsWith("http")
              return (
                <div className="bg-navy-dark p-8 rounded-xl text-center shadow-2xl">
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="w-full bg-[#F2CD69] text-navy-dark py-4 rounded-xl label-sm text-[10px] font-bold tracking-widest flex items-center justify-center gap-3 hover:brightness-105 transition-all active:scale-95 mb-4"
                  >
                    <span className="material-symbols-outlined">
                      {ctaType === "book_now" || ctaType === "book_a_call"
                        ? "event"
                        : ctaType === "shop_now" || ctaType === "visit_shop"
                        ? "storefront"
                        : "language"}
                    </span>
                    {label}
                  </a>
                  {locationStr && (
                    <p className="text-white/60 text-xs label-sm tracking-wider">
                      {locationStr}
                    </p>
                  )}
                </div>
              )
            })()}

            {/* Hours */}
            {listing.always_open ? (
              <div className="bg-gray-50 p-8 rounded-xl text-center">
                <span className="material-symbols-outlined text-gold-dark text-3xl mb-1">
                  schedule
                </span>
                <h3 className="label-sm text-[10px] text-navy-dark font-bold tracking-widest mb-1">
                  ALWAYS OPEN
                </h3>
                <p className="font-serif text-secondary">
                  Open 24 hours, every day.
                </p>
              </div>
            ) : listing.hours && Object.keys(listing.hours).length > 0 && (
              <div className="bg-gray-50 p-8 rounded-xl">
                <h3 className="label-sm text-[10px] text-navy-dark font-bold tracking-widest mb-6 border-b border-gray-200 pb-4">
                  HOURS OF OPERATION
                </h3>
                <ul className="space-y-3 font-serif text-base">
                  {dayNames.map((day) => {
                    const h = listing.hours?.[day]
                    return (
                      <li
                        key={day}
                        className={`flex justify-between ${
                          !h ? "text-secondary/50" : ""
                        }`}
                      >
                        <span>{dayLabels[day]}</span>
                        <span className={h ? "font-bold" : ""}>
                          {h ? `${h.open} - ${h.close}` : "Closed"}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Location Map */}
            {listing.address && (
              <div className="bg-gray-100 rounded-xl overflow-hidden">
                <div className="p-6">
                  <h3 className="label-sm text-[10px] text-navy-dark font-bold tracking-widest mb-2">
                    LOCATION
                  </h3>
                  <p className="font-serif text-lg text-secondary">
                    {locationStr}
                  </p>
                </div>
                <LocationEmbed address={listing.address} />
                {listing.address.street && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      [
                        listing.address.street,
                        listing.address.city,
                        listing.address.state,
                        listing.address.zip,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-gray-200 text-navy-dark label-sm text-[10px] font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      directions
                    </span>
                    Get Directions
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

// Inline map embed component
function LocationEmbed({
  address,
}: {
  address: { city?: string; state?: string; zip?: string; street?: string }
}) {
  const query = [address.city, address.state, address.zip]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="h-48 relative overflow-hidden">
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=-98,30,-96,32&layer=mapnik`}
        className="w-full border-0"
        style={{ height: "calc(100% + 30px)" }}
        title={`Map of ${query}`}
        loading="lazy"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-12 h-12 bg-navy-dark rounded-full flex items-center justify-center border-4 border-[#FAF9F5] shadow-xl">
          <span
            className="material-symbols-outlined text-[#F2CD69]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            location_on
          </span>
        </div>
      </div>
    </div>
  )
}
