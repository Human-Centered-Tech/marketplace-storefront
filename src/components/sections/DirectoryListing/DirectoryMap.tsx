"use client"

import { useEffect, useState } from "react"
import { DirectoryListing } from "@/types/directory"
import dynamic from "next/dynamic"
import type { MapBbox } from "./LeafletMap"

type MarkerData = {
  id: string
  lat: number
  lon: number
  name: string
  category: string
  city: string
}

// Below this zoom level the visible area is so large (continental
// scale) that running an Algolia bbox query would return almost
// everything — gate the "Search this area" CTA so we don't waste a
// request on it.
const MIN_SEARCH_ZOOM = 5

// Lazy-load the actual map to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false })

export function DirectoryMapView({
  listings,
  onSearchArea,
  bboxActive = false,
  isSearching = false,
  showDistance = false,
}: {
  listings: DirectoryListing[]
  // Fires when the user clicks "Search this area" — bbox is the map's
  // visible bounds at click time.
  onSearchArea?: (bbox: MapBbox) => void
  // True when the parent is currently scoping results to a bbox. Used
  // to suppress the map's auto-fitBounds so it doesn't fight the user's
  // panning after each viewport-driven search.
  bboxActive?: boolean
  isSearching?: boolean
  // Show "X mi away" on cards. Only true when proximity is from real user
  // input (Near-me / zip), never the Denver ranking default — so we don't
  // surface a misleading distance.
  showDistance?: boolean
}) {
  const [markers, setMarkers] = useState<MarkerData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pendingBbox, setPendingBbox] = useState<MapBbox | null>(null)
  const [pendingZoom, setPendingZoom] = useState<number>(0)
  // Whether the user has moved the map since the last bbox search. The
  // "Search this area" CTA appears only while this is true.
  const [movedSinceSearch, setMovedSinceSearch] = useState(false)

  useEffect(() => {
    setLoading(true)
    // Listings now carry lat/lng on address (populated by backend geocoder
    // on save and by the one-time backfill). Use them directly — no client
    // geocoding round-trips.
    const results: MarkerData[] = []
    for (const listing of listings) {
      const addr = listing.address as
        | { lat?: number; lng?: number; city?: string; state?: string }
        | null
      const lat = Number(addr?.lat)
      const lng = Number(addr?.lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
      results.push({
        id: listing.id,
        lat,
        lon: lng,
        name: listing.business_name,
        category: listing.category?.name || "Business",
        city: [addr?.city, addr?.state].filter(Boolean).join(", "),
      })
    }
    setMarkers(results)
    setLoading(false)
  }, [listings])

  const selected = selectedId
    ? listings.find((l) => l.id === selectedId)
    : null
  const selectedDistanceMi =
    selected &&
    typeof (selected as { _distance_miles?: number })._distance_miles ===
      "number"
      ? ((selected as { _distance_miles?: number })._distance_miles as number)
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
              const distanceMi = (listing as { _distance_miles?: number })
                ._distance_miles
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
                  <div className="flex gap-3">
                    {listing.logo_url && (
                      <img
                        src={listing.logo_url}
                        alt={`${listing.business_name} logo`}
                        className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100 shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-lg font-bold text-navy-dark mb-1">
                        {listing.business_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {listing.verification_status === "approved" && (
                          <span className="bg-green-50 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded border border-green-100 uppercase">
                            Verified
                          </span>
                        )}
                        <span className="text-secondary label-sm text-[8px] tracking-wider">
                          {listing.category?.name || "Business"}
                        </span>
                      </div>
                      {listing.address && (
                        <div className="flex items-center gap-1 text-secondary text-xs mt-2">
                          {[listing.address.city, listing.address.state]
                            .filter(Boolean)
                            .join(", ")}
                          {!hasMarker && !loading && (
                            <span className="text-gray-400 ml-1">
                              (no map pin)
                            </span>
                          )}
                        </div>
                      )}
                      {showDistance && typeof distanceMi === "number" && (
                        <div className="flex items-center gap-1 text-gold-dark text-xs mt-1 font-semibold">
                          <span className="material-symbols-outlined text-xs">
                            near_me
                          </span>
                          {distanceMi < 0.1 ? "<0.1" : distanceMi.toFixed(1)} mi
                          away
                        </div>
                      )}
                    </div>
                  </div>
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
            autoFit={!bboxActive}
            onBoundsChanged={(bbox, zoom) => {
              setPendingBbox(bbox)
              setPendingZoom(zoom)
              setMovedSinceSearch(true)
            }}
          />
        )}

        {/* "Search this area" CTA — sits at the top-center of the map
            once the user has panned/zoomed. Disabled at extreme
            zoom-outs where the bbox would be too broad to matter. */}
        {onSearchArea && movedSinceSearch && (
          <button
            type="button"
            disabled={
              isSearching || pendingZoom < MIN_SEARCH_ZOOM || !pendingBbox
            }
            onClick={() => {
              if (!pendingBbox) return
              onSearchArea(pendingBbox)
              setMovedSinceSearch(false)
            }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed text-navy-dark font-semibold text-[12px] tracking-[0.1em] uppercase px-5 py-2.5 rounded-full shadow-xl border border-gray-200 flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-base">
              {isSearching ? "hourglass_empty" : "search"}
            </span>
            {isSearching
              ? "Searching..."
              : pendingZoom < MIN_SEARCH_ZOOM
                ? "Zoom in to search this area"
                : "Search this area"}
          </button>
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
            <div className="flex gap-3 pr-5">
              {selected.logo_url && (
                <img
                  src={selected.logo_url}
                  alt={`${selected.business_name} logo`}
                  className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100 shrink-0"
                />
              )}
              <div className="min-w-0">
                <h4 className="font-serif text-lg font-bold text-navy-dark mb-1">
                  {selected.business_name}
                </h4>
                {selected.category && (
                  <p className="label-sm text-[8px] text-gold-dark tracking-wider mb-1">
                    {selected.category.name}
                  </p>
                )}
                {selected.address && (
                  <p className="text-xs text-secondary">
                    {[selected.address.city, selected.address.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {showDistance && selectedDistanceMi !== null && (
                  <p className="flex items-center gap-1 text-gold-dark text-xs mt-1 font-semibold">
                    <span className="material-symbols-outlined text-xs">
                      near_me
                    </span>
                    {selectedDistanceMi < 0.1
                      ? "<0.1"
                      : selectedDistanceMi.toFixed(1)}{" "}
                    mi away
                  </p>
                )}
              </div>
            </div>
            <a
              href={`/directory/${selected.id}`}
              className="label-sm text-[10px] text-gold-dark font-bold tracking-widest hover:text-navy-dark transition-colors mt-3 inline-block"
            >
              View Details →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
