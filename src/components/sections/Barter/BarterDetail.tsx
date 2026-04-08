"use client"

import { useState, useEffect } from "react"
import { BarterListing } from "@/types/barter"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const conditionLabels: Record<string, string> = {
  new: "Mint/New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
}

const typeLabels: Record<string, string> = {
  sell: "For Sale",
  trade: "Trade",
  barter: "Barter/Trade",
  free: "Free",
}

const typeIcons: Record<string, string> = {
  sell: "sell",
  trade: "swap_horiz",
  barter: "swap_horiz",
  free: "volunteer_activism",
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

export const BarterDetail = ({
  listing,
}: {
  listing: BarterListing
}) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const images =
    listing.images?.sort((a, b) => a.sort_order - b.sort_order) ?? []

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 label-sm text-secondary">
          <LocalizedClientLink
            href="/barter"
            className="hover:text-navy-dark transition-colors"
          >
            Barter Market
          </LocalizedClientLink>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <span className="text-gold-dark font-semibold">
            {listing.listing_type === "sell"
              ? "For Sale"
              : listing.listing_type === "free"
                ? "Free Items"
                : "Trade & Barter"}
          </span>
        </div>
        <div className="text-navy-dark font-serif italic text-lg border-l-2 border-gold pl-4">
          &ldquo;Building the New Catholic Economy&reg;&rdquo;
        </div>
      </div>

      {/* Image Gallery */}
      {images.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[300px] md:h-[500px] mb-12">
          {/* Main image */}
          <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-xl bg-gray-100 group">
            <img
              src={images[selectedImage]?.url}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          {/* Secondary images */}
          {images.slice(1, 4).map((img, i) => (
            <div
              key={img.id}
              className={`overflow-hidden rounded-xl bg-gray-100 group cursor-pointer ${
                i === 2 ? "md:col-span-2" : ""
              }`}
              onClick={() => setSelectedImage(i + 1)}
            >
              <img
                src={img.url}
                alt={`${listing.title} ${i + 2}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
          {/* Fill empty slots if fewer than 4 images */}
          {images.length === 1 && (
            <>
              <div className="overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
                <span className="text-gray-200 font-serif text-3xl">
                  {listing.title.charAt(0)}
                </span>
              </div>
              <div className="overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-200 text-3xl">
                  image
                </span>
              </div>
              <div className="md:col-span-2 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-200 text-3xl">
                  photo_library
                </span>
              </div>
            </>
          )}
        </section>
      ) : (
        <div className="h-[300px] md:h-[400px] bg-gray-50 rounded-xl mb-12 flex items-center justify-center">
          <span className="text-gray-300 font-serif text-6xl">
            {listing.title.charAt(0)}
          </span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-10">
          <header className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="bg-[#F2CD69] text-[#17294A] px-3 py-1 rounded-full label-sm text-[10px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">
                  {typeIcons[listing.listing_type] || "sell"}
                </span>
                {typeLabels[listing.listing_type] || listing.listing_type}
              </span>
              <span className="bg-gray-100 text-secondary px-3 py-1 rounded-full label-sm text-[10px] font-bold border border-secondary/20">
                {conditionLabels[listing.condition] || listing.condition}
              </span>
              {listing.listing_type === "sell" && listing.price && (
                <span className="bg-[#3D7A4A]/10 text-[#3D7A4A] px-3 py-1 rounded-full label-sm text-[10px] font-bold border border-[#3D7A4A]/20">
                  {formatPrice(listing.price)}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-navy-dark tracking-tight leading-tight">
              {listing.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-6 text-secondary label-sm text-xs">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  schedule
                </span>
                {timeAgo(listing.created_at)}
              </div>
              {listing.location && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    location_on
                  </span>
                  {[listing.location.city, listing.location.state]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
            </div>
          </header>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

          {/* Barter Terms */}
          {listing.trade_terms && (
            <section className="bg-navy-dark p-8 rounded-xl shadow-lg border-l-4 border-gold">
              <h3 className="label-sm text-[10px] font-bold tracking-[0.2em] text-white/60 mb-4">
                Barter Request
              </h3>
              <p className="font-serif text-xl md:text-2xl italic text-[#F2CD69]">
                &ldquo;{listing.trade_terms}&rdquo;
              </p>
            </section>
          )}

          {/* Description */}
          <article className="space-y-6">
            <h3 className="label-sm font-bold tracking-widest text-navy-dark">
              Description
            </h3>
            <div className="font-serif text-lg text-primary/90 leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </div>
          </article>

          {/* Location with OpenStreetMap */}
          {listing.location && (
            <div className="space-y-4">
              <h3 className="label-sm font-bold tracking-widest text-navy-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">map</span>
                Location
              </h3>
              <LocationMap location={listing.location} />
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <aside className="space-y-8">
          {/* Seller Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 sticky top-28">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-navy-dark flex items-center justify-center text-[#F2CD69]">
                <span
                  className="material-symbols-outlined text-3xl"
                  style={{
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  person
                </span>
              </div>
              <div>
                <h4 className="font-serif text-xl text-navy-dark">
                  Community Member
                </h4>
                <p className="label-sm text-[10px] text-secondary">
                  Catholic Owned Community
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-navy-dark text-[#F2CD69] label-sm text-[10px] font-bold tracking-widest py-4 rounded-lg shadow-lg hover:shadow-navy/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">mail</span>
                Message Seller
              </button>
              {(listing.listing_type === "barter" ||
                listing.listing_type === "trade") && (
                <button className="w-full bg-gray-50 border border-gold/30 text-navy-dark label-sm text-[10px] font-bold tracking-widest py-4 rounded-lg hover:bg-[#F2CD69]/10 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    handshake
                  </span>
                  Make Barter Offer
                </button>
              )}
              {listing.listing_type === "sell" && listing.price && (
                <button className="w-full bg-[#3D7A4A] text-white label-sm text-[10px] font-bold tracking-widest py-4 rounded-lg hover:bg-[#3D7A4A]/90 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    shopping_cart
                  </span>
                  Buy Now &mdash; {formatPrice(listing.price)}
                </button>
              )}
            </div>

            <div className="pt-2 text-center">
              <button className="label-sm text-[10px] text-secondary hover:text-red-600 transition-colors inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">flag</span>
                Report Listing
              </button>
            </div>
          </div>

          {/* Verified Badge */}
          <div className="bg-[#DECF8F]/10 p-4 rounded-xl flex items-center gap-4 border border-[#DECF8F]/30">
            <div className="bg-[#DECF8F] text-[#17294A] w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-xl"
                style={{
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                verified_user
              </span>
            </div>
            <div className="label-sm text-[10px] text-secondary leading-tight">
              <strong className="text-navy-dark">
                Catholic Owned Community
              </strong>
              . All listings are moderated to maintain a faithful marketplace.
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function LocationMap({
  location,
}: {
  location: { city?: string; state?: string; zip?: string }
}) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const locationStr = [location.city, location.state, location.zip]
    .filter(Boolean)
    .join(", ")

  useEffect(() => {
    // Use Nominatim (free, no API key) to geocode, then build an OSM embed
    const query = encodeURIComponent(locationStr)
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { "User-Agent": "CatholicOwned/1.0" } }
    )
      .then((res) => res.json())
      .then((results) => {
        if (results.length > 0) {
          const { lat, lon, boundingbox } = results[0]
          // boundingbox: [south, north, west, east]
          const bbox = `${boundingbox[2]},${boundingbox[0]},${boundingbox[3]},${boundingbox[1]}`
          setEmbedUrl(
            `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
          )
        }
      })
      .catch(() => {
        // silently fail — show fallback
      })
  }, [locationStr])

  if (!embedUrl) {
    return (
      <div className="h-64 rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-center text-secondary">
          <span className="material-symbols-outlined text-4xl mb-2 block">
            location_on
          </span>
          <p className="font-serif text-lg">{locationStr}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64 rounded-xl overflow-hidden relative">
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        title={`Map of ${locationStr}`}
        loading="lazy"
      />
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
        <p className="font-serif text-sm text-navy-dark">{locationStr}</p>
      </div>
    </div>
  )
}
