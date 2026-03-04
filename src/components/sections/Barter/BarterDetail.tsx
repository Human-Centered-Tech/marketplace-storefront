"use client"

import { useState } from "react"
import { BarterListing } from "@/types/barter"

const conditionLabels: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
}

const conditionStyles: Record<string, string> = {
  new: "bg-green-100 text-green-800 border-green-300",
  like_new: "bg-blue-100 text-blue-800 border-blue-300",
  good: "bg-gray-100 text-gray-800 border-gray-300",
  fair: "bg-yellow-100 text-yellow-800 border-yellow-300",
  poor: "bg-red-100 text-red-800 border-red-300",
}

const typeLabels: Record<string, string> = {
  sell: "For Sale",
  trade: "Trade",
  barter: "Barter",
  free: "Free",
}

const typeBadgeStyles: Record<string, string> = {
  sell: "bg-green-100 text-green-800 border-green-300",
  trade: "bg-blue-100 text-blue-800 border-blue-300",
  barter: "bg-purple-100 text-purple-800 border-purple-300",
  free: "bg-yellow-100 text-yellow-800 border-yellow-300",
}

function formatPrice(price: number | null) {
  if (price === null || price === 0) return null
  return `$${(price / 100).toFixed(2)}`
}

export const BarterDetail = ({
  listing,
}: {
  listing: BarterListing
}) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const images = listing.images?.sort((a, b) => a.sort_order - b.sort_order) ?? []

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Image gallery */}
          {images.length > 0 ? (
            <div className="mb-6">
              <div className="aspect-[4/3] overflow-hidden rounded-sm mb-3">
                <img
                  src={images[selectedImage]?.url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 ${
                        i === selectedImage
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${listing.title} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[4/3] bg-gray-100 rounded-sm mb-6 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">
                {listing.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Title and badges */}
          <div className="flex items-start gap-3 mb-4">
            <h1 className="heading-lg text-primary">{listing.title}</h1>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                typeBadgeStyles[listing.listing_type] || typeBadgeStyles.sell
              }`}
            >
              {typeLabels[listing.listing_type] || listing.listing_type}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                conditionStyles[listing.condition] || conditionStyles.good
              }`}
            >
              {conditionLabels[listing.condition] || listing.condition}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="heading-sm text-primary mb-2">Description</h2>
            <p className="text-secondary whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Trade terms */}
          {listing.trade_terms && (
            <div className="mb-6">
              <h2 className="heading-sm text-primary mb-2">Trade Terms</h2>
              <p className="text-secondary whitespace-pre-wrap">
                {listing.trade_terms}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price / Trade info */}
          <div className="border rounded-sm p-4">
            <h2 className="heading-sm text-primary mb-3">
              {listing.listing_type === "sell"
                ? "Price"
                : listing.listing_type === "free"
                  ? "Listing"
                  : "Trade Info"}
            </h2>
            <div className="space-y-2">
              {listing.listing_type === "sell" && listing.price ? (
                <p className="text-2xl font-semibold text-primary">
                  {formatPrice(listing.price)}
                </p>
              ) : listing.listing_type === "free" ? (
                <p className="text-lg font-medium text-green-600">Free</p>
              ) : (
                <p className="text-sm text-secondary">
                  Open to trade or barter offers
                </p>
              )}
            </div>
          </div>

          {/* Condition */}
          <div className="border rounded-sm p-4">
            <h2 className="heading-sm text-primary mb-3">Condition</h2>
            <span
              className={`text-sm px-3 py-1 rounded border ${
                conditionStyles[listing.condition] || conditionStyles.good
              }`}
            >
              {conditionLabels[listing.condition] || listing.condition}
            </span>
          </div>

          {/* Location */}
          {listing.location && (
            <div className="border rounded-sm p-4">
              <h2 className="heading-sm text-primary mb-3">Location</h2>
              <p className="text-sm text-secondary">
                {[
                  listing.location.city,
                  listing.location.state,
                  listing.location.zip,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          )}

          {/* Posted date */}
          <div className="border rounded-sm p-4">
            <h2 className="heading-sm text-primary mb-3">Listed</h2>
            <p className="text-sm text-secondary">
              {new Date(listing.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
