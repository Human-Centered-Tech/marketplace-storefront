"use client"

import { useState } from "react"
import { DirectoryListing } from "@/types/directory"
import {
  ImageLightbox,
  LightboxImage,
} from "@/components/molecules/ImageLightbox/ImageLightbox"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { OWNER_INTERVIEW_QUESTIONS } from "@/lib/owner-interview"
import { socialLinksToArray } from "@/lib/social"
import { SocialIcon } from "@/components/sections/DirectoryManagement/SocialIcon"
import { SingleLocationMap } from "@/components/sections/DirectoryListing/SingleLocationMap"
import { trackButtonClick } from "@/lib/analytics"
import { normalizeExternalUrl } from "@/lib/helpers/external-url"
import { getTierBadge } from "@/lib/directory-tiers"

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
  claimPending = false,
  claimMine = false,
}: {
  listing: DirectoryListing
  // A claim by SOMEONE ELSE is in progress (attested <7 days ago): swap the
  // Claim CTA for a "claim pending" notice so two people don't race to the
  // 409. When the pending claim is the viewer's own, show a resume link.
  claimPending?: boolean
  claimMine?: boolean
}) => {
  // Fullscreen viewer state — set to a list of images + start index when the
  // user clicks any photo (gallery thumbnail, owner photo, devotional image);
  // null = closed. Gallery clicks pass the whole gallery so arrows/keys page
  // through it; owner/devotional open as a single image.
  const [lightbox, setLightbox] = useState<{
    images: LightboxImage[]
    index: number
  } | null>(null)

  const locationStr = listing.address
    ? [listing.address.city, listing.address.state, listing.address.zip]
        .filter(Boolean)
        .join(", ")
    : null
  // Only show the Location/map block when there's something real to map:
  // city/state/zip text, or precise coords. `listing.address` can be a
  // non-null object with all-blank fields, so checking truthiness alone
  // would render an empty map with a dangling "LOCATION" header.
  const addrCoords = listing.address as
    | { lat?: number; lng?: number }
    | null
    | undefined
  const hasLocation =
    Boolean(locationStr) ||
    (Number.isFinite(addrCoords?.lat) && Number.isFinite(addrCoords?.lng))

  const isUnclaimed = !listing.owner_id
  const websiteHref = normalizeExternalUrl(listing.website_url)
  // Featured (and Enterprise) tiers get the richer listing: owner-interview
  // section, multiple parish affiliations, and the gold CTA button. Verified
  // and lower tiers show none of those + a single parish affiliation.
  const isFeatured =
    listing.subscription_tier === "featured" ||
    listing.subscription_tier === "enterprise"

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
          {/* Logo / Initial — white bg when there's a logo (logos are
              designed for white); navy fallback for the initials. */}
          <div
            className={`w-28 h-28 lg:w-32 lg:h-32 rounded-xl flex items-center justify-center border-4 border-[#FAF9F5] shrink-0 ${
              listing.logo_url ? "bg-white p-2" : "bg-navy-dark shadow-inner"
            }`}
          >
            {listing.logo_url ? (
              <img
                src={listing.logo_url}
                alt={`${listing.business_name} logo`}
                className="max-w-full max-h-full object-contain"
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
              {isUnclaimed ? (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full label-sm text-[10px] font-bold tracking-widest border border-gray-300">
                  UNCLAIMED LISTING
                </span>
              ) : (
                <span className="bg-[#F2CD69] text-navy-dark px-3 py-1 rounded-full label-sm text-[10px] font-bold tracking-widest">
                  {getTierBadge(
                    listing.subscription_tier,
                    listing.verification_status,
                    listing.pricing_tier
                  )?.label || "Essential"}
                </span>
              )}
              {/* The old "Verified Business" trust line here was the second
                  badge on the detail page (Brooke 7/6) — the tier pill above is
                  the single badge now. */}
              {listing.badges
                ?.map((lb) => lb.badge)
                .filter(Boolean)
                .map((badge) => (
                  <span
                    key={badge!.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full label-sm text-[10px] font-bold tracking-widest"
                    style={{
                      backgroundColor: badge!.color || "#F2CD69",
                      color: "#17294A",
                    }}
                    title={badge!.description || badge!.name}
                  >
                    {badge!.icon_url && (
                      <img
                        src={badge!.icon_url}
                        alt=""
                        className="inline-block w-5 h-5 object-contain"
                      />
                    )}
                    {badge!.name}
                  </span>
                ))}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-navy-dark mb-2">
              {listing.business_name}
            </h1>
            {(listing.category_links?.length || listing.category) && (
              <p className="font-serif italic text-lg text-secondary">
                {(listing.category_links?.length
                  ? listing.category_links
                      .slice()
                      .sort(
                        (a, b) =>
                          (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)
                      )
                      .map((l) => l.category?.name)
                      .filter(Boolean)
                  : [listing.category?.name].filter(Boolean)
                ).join(" \u2022 ")}
                {locationStr && ` \u2022 ${locationStr}`}
              </p>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="flex gap-3 shrink-0">
            {listing.contact_phone && (
              <a
                href={`tel:${listing.contact_phone}`}
                onClick={() =>
                  trackButtonClick("directory_listing", listing.id, "contact_phone")
                }
                className="p-3 rounded-xl bg-gray-100 text-navy-dark hover:bg-[#F2CD69]/30 transition-colors"
              >
                <span className="material-symbols-outlined">call</span>
              </a>
            )}
            {listing.contact_email && (
              <a
                href={`mailto:${listing.contact_email}`}
                onClick={() =>
                  trackButtonClick("directory_listing", listing.id, "contact_email")
                }
                className="p-3 rounded-xl bg-gray-100 text-navy-dark hover:bg-[#F2CD69]/30 transition-colors"
              >
                <span className="material-symbols-outlined">mail</span>
              </a>
            )}
            {websiteHref && (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackButtonClick("directory_listing", listing.id, "contact_website")
                }
                className="p-3 rounded-xl bg-gray-100 text-navy-dark hover:bg-[#F2CD69]/30 transition-colors"
              >
                <span className="material-symbols-outlined">language</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Unclaimed banner — only when listing has no owner */}
      {isUnclaimed && (
        <section className="max-w-7xl mx-auto px-6 mt-6">
          <div className="bg-[#F2CD69]/15 border border-[#F2CD69] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <p className="font-serif text-lg text-navy-dark font-bold mb-1">
                {claimPending && !claimMine
                  ? "A claim on this listing is in progress."
                  : "This is an unclaimed listing."}
              </p>
              <p className="text-secondary text-sm">
                {claimPending && !claimMine
                  ? "The business owner is completing their claim. If you believe this claim is not legitimate, contact support@catholicowned.com."
                  : "Are you the owner? Claim this listing to make edits, earn your member badge, and move up in search results. Reaching out as a customer? Tell them you found them on Catholic Owned!"}
              </p>
            </div>
            {(!claimPending || claimMine) && (
              <LocalizedClientLink
                href={
                  claimMine
                    ? `/directory/${listing.id}/claim/start`
                    : `/directory/${listing.id}/claim`
                }
                className="bg-navy-dark text-white px-6 py-3 rounded-xl label-sm text-[10px] font-bold tracking-widest hover:bg-navy transition-colors whitespace-nowrap"
              >
                {claimMine ? "Finish Your Claim" : "Claim This Listing"}
              </LocalizedClientLink>
            )}
          </div>
        </section>
      )}

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

            {/* Owner Interview — Featured/Enterprise only */}
            {isFeatured &&
              listing.owner_interview &&
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
                        <button
                          type="button"
                          onClick={() =>
                            setLightbox({
                              images: [
                                {
                                  url: listing.owner_interview!.photo_url!,
                                  alt: "Owner",
                                },
                              ],
                              index: 0,
                            })
                          }
                          aria-label="View owner photo fullscreen"
                          className="block w-full rounded-xl overflow-hidden cursor-zoom-in group"
                        >
                          <img
                            src={listing.owner_interview.photo_url}
                            alt="Owner"
                            className="w-full aspect-square object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                          />
                        </button>
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
                        // Questions are hardcoded platform-wide — always render
                        // the canonical text, ignoring any stored/legacy prompt.
                        const prompt = OWNER_INTERVIEW_QUESTIONS[n - 1]
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
                      <button
                        type="button"
                        onClick={() =>
                          setLightbox({
                            images: [
                              {
                                url: listing.devotional!.image_url!,
                                alt: "Devotional",
                              },
                            ],
                            index: 0,
                          })
                        }
                        aria-label="View devotional image fullscreen"
                        className="block w-full rounded-xl overflow-hidden cursor-zoom-in group md:col-span-1"
                      >
                        <img
                          src={listing.devotional.image_url}
                          alt="Devotional"
                          className="w-full aspect-square object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                        />
                      </button>
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
                  {/* Featured/Enterprise can list multiple; lower tiers show one. */}
                  {(isFeatured
                    ? listing.affiliations
                    : listing.affiliations.slice(0, 1)
                  ).map((aff) => (
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
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setLightbox({
                          images: listing.gallery_urls!.map((u, j) => ({
                            url: u,
                            alt: `${listing.business_name} photo ${j + 1}`,
                          })),
                          index: i,
                        })
                      }
                      aria-label={`View ${listing.business_name} photo ${
                        i + 1
                      } fullscreen`}
                      className="aspect-square rounded-xl overflow-hidden group cursor-zoom-in"
                    >
                      <img
                        src={url}
                        alt={`${listing.business_name} photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links — free-form URLs, brand logo detected per URL. */}
            {(() => {
              // Same protocol fix as websiteHref above: merchants paste
              // "www.tiktok.com/@handle", which rendered raw resolves relative
              // to the current page → /us/directory/www.tiktok.com/… 404s
              // (Sentry). Normalize each link; junk values drop out.
              const socials = socialLinksToArray(listing.social_links)
                .map((url) => normalizeExternalUrl(url))
                .filter((url): url is string => Boolean(url))
              if (socials.length === 0) return null
              return (
                <div>
                  <h2 className="label-sm text-[10px] text-gold-dark font-bold tracking-[0.2em] mb-4">
                    FOLLOW US
                  </h2>
                  <div className="h-px w-full bg-gold/30 mb-8" />
                  <div className="flex gap-4">
                    {socials.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-gray-100 text-navy-dark hover:bg-[#F2CD69]/30 transition-colors"
                      >
                        <SocialIcon url={url} className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Right Column / Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Claim CTA — only when unclaimed and no one else's claim is
                already pending */}
            {isUnclaimed && (!claimPending || claimMine) && (
              <div className="bg-[#F2CD69] p-8 rounded-xl text-center shadow-2xl">
                <span
                  className="material-symbols-outlined text-navy-dark text-3xl mb-2 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  flag
                </span>
                <h3 className="font-serif text-xl font-bold text-navy-dark mb-2">
                  {claimMine ? "Your claim is in progress" : "Is this your business?"}
                </h3>
                <p className="text-navy-dark/70 text-sm mb-4">
                  {claimMine
                    ? "Pick your membership to finish transferring this listing to your account."
                    : "Claim it to manage your profile and reach Catholic shoppers."}
                </p>
                <LocalizedClientLink
                  href={
                    claimMine
                      ? `/directory/${listing.id}/claim/start`
                      : `/directory/${listing.id}/claim`
                  }
                  className="block w-full bg-navy-dark text-white py-4 rounded-xl label-sm text-[10px] font-bold tracking-widest hover:bg-navy transition-colors"
                >
                  {claimMine ? "Finish Your Claim" : "Claim This Listing"}
                </LocalizedClientLink>
              </div>
            )}

            {/* CTA Card — available on all paid tiers (incl. Local); only
                rendered when claimed and a usable href resolves. */}
            {!isUnclaimed &&
              (() => {
                const ctaTypeRaw = listing.cta_type || "visit_shop"
                // Legacy Bubble-imported rows store the CTA as display text
                // ("Shop Now", "Book a Call", "Check Availability") rather
                // than an enum key. Normalize for lookups, but keep the raw
                // text as the label fallback so imported CTAs render their
                // own wording instead of all reading "Learn More".
                const ctaKey = ctaTypeRaw
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, "_")
                // A storefront link is only valid when the backend resolved a
                // REAL shop for this listing. The GET route populates
                // `listing.seller` (id + handle) only when the linked store's
                // store_status === "ACTIVE" AND it has a published product, so
                // its presence is our "live storefront exists" signal. Link
                // via seller.handle — NOT listing.slug, which is the directory
                // listing's own slug and can diverge from the storefront
                // handle (e.g. an imported trailing-hyphen slug, or a seller
                // whose store isn't live), producing a 404. vendor_id alone is
                // too loose: it can be set while the store is draft/paused,
                // and store_status ACTIVE alone is too loose too (the
                // directory-payment syncs flip product-less members ACTIVE).
                const shopHandle = listing.seller?.handle ?? null
                const hasShop = Boolean(shopHandle)
                const customHref = normalizeExternalUrl(listing.cta_url)
                let href: string | null = null
                let label = ""
                let icon = "language"

                if (hasShop) {
                  // A live shop always routes directory discovery to the
                  // on-platform products — the same rule the backend enforces
                  // on save — even if a stale custom CTA is still stored.
                  href = `/sellers/${shopHandle}`
                  label = "Visit Our Shop"
                  icon = "storefront"
                } else if (ctaKey !== "visit_shop" && customHref) {
                  // No live shop: the saved custom CTA wins.
                  href = customHref
                  label = ctaLabels[ctaKey] || ctaTypeRaw
                  icon =
                    ctaKey === "book_now" || ctaKey === "book_a_call"
                      ? "event"
                      : ctaKey === "shop_now"
                        ? "storefront"
                        : "language"
                } else if (customHref) {
                  // visit_shop-typed rows can still carry an imported link
                  // (CSV rows with a CTA Link but no CTA text).
                  href = customHref
                  label = "Learn More"
                } else if (websiteHref) {
                  href = websiteHref
                  label = "Visit Website"
                }

                if (!href) return null

                const external = href.startsWith("http")
                return (
                  <div className="bg-navy-dark p-8 rounded-xl text-center shadow-2xl">
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      onClick={() =>
                        trackButtonClick(
                          "directory_listing",
                          listing.id,
                          `cta_${hasShop ? "visit_shop" : ctaKey}`
                        )
                      }
                      className="w-full bg-gradient-to-br from-[#F2CD69] to-[#BE9B32] text-navy-dark py-4 rounded-xl label-sm text-[10px] font-bold tracking-widest flex items-center justify-center gap-3 hover:brightness-105 transition-all active:scale-95 mb-4"
                    >
                      <span className="material-symbols-outlined">{icon}</span>
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
            ) : (
              listing.hours_of_operation &&
              Object.keys(listing.hours_of_operation).length > 0 && (
                <div className="bg-gray-50 p-8 rounded-xl">
                  <h3 className="label-sm text-[10px] text-navy-dark font-bold tracking-widest mb-6 border-b border-gray-200 pb-4">
                    HOURS OF OPERATION
                  </h3>
                  <ul className="space-y-3 font-serif text-base">
                    {dayNames.map((day) => {
                      const h = listing.hours_of_operation?.[day]
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
              )
            )}

            {/* Location Map */}
            {hasLocation && listing.address && (
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

      {/* Fullscreen image viewer — mounted only while open */}
      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}

// Inline Google map for a single listing. Owner payloads carry precise lat/lng
// (written by the backend geocoder on save); public payloads are coarsened by
// the backend to city/state/zip only. With precise coords we render the exact
// pin; without them we render an APPROXIMATE, pin-less area map geocoded from
// ONLY the city/state/zip (never the street or `full`, either of which may
// still embed an exact address) so we never leak/imply a precise location.
function LocationEmbed({
  address,
}: {
  address: {
    city?: string
    state?: string
    zip?: string
    street?: string
    full?: string
    lat?: number
    lng?: number
  }
}) {
  const hasPreciseCoords =
    Number.isFinite(address.lat) && Number.isFinite(address.lng)

  const coords = hasPreciseCoords
    ? { lat: address.lat as number, lng: address.lng as number }
    : null

  // Coarse, public-safe location string — used directly in approximate mode.
  const cityStateZip = [address.city, address.state, address.zip]
    .filter(Boolean)
    .join(", ")

  // Precise mode may geocode the full/street address as a backup to the
  // stored coords (Bubble-imported listings have only `full`); approximate
  // mode must stay coarse and ignore street/full entirely.
  const preciseQuery =
    address.full ??
    [address.street, address.city, address.state, address.zip]
      .filter(Boolean)
      .join(", ")

  const approximate = !hasPreciseCoords
  const query = approximate ? cityStateZip : preciseQuery

  // No location at all — render a placeholder rather than a misleading/0,0 map.
  if (!query && !coords) {
    return (
      <div className="h-48 relative overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-secondary text-sm">No location provided</p>
      </div>
    )
  }

  return (
    <div className="h-48 relative overflow-hidden">
      <SingleLocationMap
        coords={coords}
        query={query || null}
        approximate={approximate}
        zoom={approximate ? 11 : 14}
        className="absolute inset-0"
        fallback={
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <p className="text-secondary text-sm">
              {locationStrFallback(address)}
            </p>
          </div>
        }
      />
    </div>
  )
}

// Small label used when the map can't render (no key / geocode miss).
function locationStrFallback(address: {
  city?: string
  state?: string
  zip?: string
}): string {
  const s = [address.city, address.state, address.zip]
    .filter(Boolean)
    .join(", ")
  return s || "Location"
}
