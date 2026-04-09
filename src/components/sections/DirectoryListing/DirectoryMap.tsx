"use client"

import { useEffect, useState, useRef } from "react"
import { DirectoryListing } from "@/types/directory"
import dynamic from "next/dynamic"

type MarkerData = {
  id: string
  lat: number
  lon: number
  name: string
  category: string
  city: string
}

// Lazy-load the actual map to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false })

export function DirectoryMapView({
  listings,
}: {
  listings: DirectoryListing[]
}) {
  const [markers, setMarkers] = useState<MarkerData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const geocodeCache = useRef(new Map<string, { lat: number; lon: number }>())

  useEffect(() => {
    const geocode = async () => {
      setLoading(true)
      const results: MarkerData[] = []

      for (const listing of listings) {
        if (!listing.address?.city) continue
        const query = [
          listing.address.city,
          listing.address.state,
          listing.address.zip,
        ]
          .filter(Boolean)
          .join(", ")

        // Check cache first
        if (geocodeCache.current.has(query)) {
          const cached = geocodeCache.current.get(query)!
          results.push({
            id: listing.id,
            lat: cached.lat,
            lon: cached.lon,
            name: listing.business_name,
            category: listing.category?.name || "Business",
            city: [listing.address.city, listing.address.state]
              .filter(Boolean)
              .join(", "),
          })
          continue
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              query
            )}&format=json&limit=1`,
            { headers: { "User-Agent": "CatholicOwned/1.0" } }
          )
          const data = await res.json()
          if (data.length > 0) {
            const lat = parseFloat(data[0].lat)
            const lon = parseFloat(data[0].lon)
            geocodeCache.current.set(query, { lat, lon })
            results.push({
              id: listing.id,
              lat,
              lon,
              name: listing.business_name,
              category: listing.category?.name || "Business",
              city: [listing.address.city, listing.address.state]
                .filter(Boolean)
                .join(", "),
            })
          }
        } catch {
          // skip failed geocodes
        }
      }

      setMarkers(results)
      setLoading(false)
    }

    geocode()
  }, [listings])

  const selected = selectedId
    ? listings.find((l) => l.id === selectedId)
    : null

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-280px)] min-h-[500px] rounded-xl overflow-hidden border border-gray-200">
      {/* Left panel - scrollable listings */}
      <div className="w-full lg:w-[400px] overflow-y-auto bg-[#FAF9F5] shrink-0 border-r border-gray-200">
        <div className="p-4 space-y-4">
          {listings.length === 0 ? (
            <p className="text-center text-secondary py-8 text-sm">
              No businesses to display
            </p>
          ) : (
            listings.map((listing) => {
              const hasMarker = markers.some((m) => m.id === listing.id)
              return (
                <button
                  key={listing.id}
                  onClick={() => setSelectedId(listing.id)}
                  className={`w-full text-left bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border ${
                    selectedId === listing.id
                      ? "border-gold ring-1 ring-gold/30"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {listing.verification_status === "approved" && (
                      <span className="bg-green-50 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded border border-green-100 uppercase">
                        Verified
                      </span>
                    )}
                    <span className="text-secondary label-sm text-[9px] tracking-wider">
                      {listing.category?.name || "Business"}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy-dark">
                    {listing.business_name}
                  </h3>
                  {listing.address && (
                    <div className="flex items-center gap-1 text-secondary text-xs mt-2">
                      <span className="material-symbols-outlined text-xs">
                        location_on
                      </span>
                      {[listing.address.city, listing.address.state]
                        .filter(Boolean)
                        .join(", ")}
                      {!hasMarker && !loading && (
                        <span className="text-gray-400 ml-1">(no map pin)</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right panel - Leaflet map */}
      <div className="flex-1 relative bg-gray-100">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-secondary">
              <span className="material-symbols-outlined text-4xl mb-2 block">
                map
              </span>
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
        ) : (
          <LeafletMap
            markers={markers}
            selectedId={selectedId}
            onSelectMarker={setSelectedId}
          />
        )}

        {/* Selected listing popup */}
        {selected && (
          <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-80 bg-white rounded-xl shadow-xl p-5 border border-gray-100 z-[1000]">
            <button
              onClick={() => setSelectedId(null)}
              className="absolute top-3 right-3 material-symbols-outlined text-secondary text-sm hover:text-navy-dark"
            >
              close
            </button>
            <h4 className="font-serif text-lg font-bold text-navy-dark mb-1">
              {selected.business_name}
            </h4>
            {selected.category && (
              <p className="label-sm text-[9px] text-gold-dark tracking-wider mb-1">
                {selected.category.name}
              </p>
            )}
            {selected.address && (
              <p className="text-xs text-secondary mb-3">
                {[selected.address.city, selected.address.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            <a
              href={`/directory/${selected.id}`}
              className="label-sm text-[10px] text-gold-dark font-bold tracking-widest hover:text-navy-dark transition-colors"
            >
              View Details →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
