"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { DirectoryListing, DirectoryCategory } from "@/types/directory"
import { DirectoryListingCard } from "./DirectoryListingCard"
import { DirectoryMapView } from "./DirectoryMap"
import { useUserLocation, readRadiusMi, writeRadiusMi } from "@/hooks/useUserLocation"
import { LocationPrompt } from "@/components/molecules/LocationPrompt/LocationPrompt"

type ViewMode = "list" | "map"

type DirectorySearchProps = {
  initialListings: DirectoryListing[]
  initialCount: number
  categories: DirectoryCategory[]
}

const KM_PER_MI = 1.60934

export const DirectorySearch = ({
  initialListings,
  initialCount,
  categories,
}: DirectorySearchProps) => {
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get("q") || ""
  const urlNearLat = parseFloat(searchParams.get("near_lat") || "")
  const urlNearLon = parseFloat(searchParams.get("near_lon") || "")
  const urlRadiusKm = parseFloat(searchParams.get("radius_km") || "")

  const { location: userLocation, hydrated } = useUserLocation()
  const [allListings, setAllListings] = useState(initialListings)
  const [count, setCount] = useState(initialCount)
  const [search, setSearch] = useState(urlQuery)
  const [categoryId, setCategoryId] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<ViewMode>("list")
  const [useNearMe, setUseNearMe] = useState(
    Number.isFinite(urlNearLat) && Number.isFinite(urlNearLon)
  )
  // Auto-enable Near-me once location becomes available (unless the user
  // explicitly turned it off later — tracked via touched flag).
  const [nearMeTouched, setNearMeTouched] = useState(false)
  useEffect(() => {
    if (hydrated && userLocation && !nearMeTouched && !useNearMe) {
      setUseNearMe(true)
    }
  }, [hydrated, userLocation, nearMeTouched, useNearMe])
  const [radiusMi, setRadiusMiState] = useState(
    Number.isFinite(urlRadiusKm) ? Math.round(urlRadiusKm / KM_PER_MI) : 50
  )
  // Rehydrate from localStorage after mount (URL still wins if present).
  useEffect(() => {
    if (!Number.isFinite(urlRadiusKm)) {
      setRadiusMiState(readRadiusMi())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const setRadiusMi = (mi: number) => {
    setRadiusMiState(mi)
    writeRadiusMi(mi)
  }

  useEffect(() => {
    if (urlQuery && urlQuery !== search) {
      setSearch(urlQuery)
    }
  }, [urlQuery])

  const proximityEnabled = useNearMe && userLocation !== null
  const proximityActive = proximityEnabled && hydrated

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryId) params.set("category_id", categoryId)
      params.set("verification_status", "approved")

      if (proximityActive && userLocation) {
        params.set("near_lat", String(userLocation.lat))
        params.set("near_lon", String(userLocation.lng))
        params.set("radius_km", String(Math.round(radiusMi * KM_PER_MI)))
        params.set("limit", "100")
      }

      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const res = await fetch(
        `${backendUrl}/store/directory/listings?${params.toString()}`,
        {
          headers: {
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
        }
      )
      const data = await res.json()
      setAllListings(data.listings || [])
      setCount(data.count || 0)
    } catch {
      // keep current state
    } finally {
      setLoading(false)
    }
  }, [categoryId, proximityActive, userLocation, radiusMi])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchListings])

  // Client-side filtering for text search and (when no proximity) location.
  const filteredListings = useMemo(() => {
    let results = allListings

    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(
        (l) =>
          l.business_name.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.category?.name?.toLowerCase().includes(q)
      )
    }

    // When proximity is active the server already filtered by location;
    // keep the text input as a no-op so the user sees the entire result set.
    if (!proximityActive && location.trim()) {
      const loc = location.toLowerCase()
      results = results.filter(
        (l) =>
          l.address?.city?.toLowerCase().includes(loc) ||
          l.address?.state?.toLowerCase().includes(loc) ||
          l.address?.zip?.includes(loc)
      )
    }

    return results
  }, [allListings, search, location, proximityActive])

  return (
    <>
      <LocationPrompt className="mb-4" />

      {/* Search Bar — floating card */}
      <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-col md:flex-row items-stretch gap-2 border border-gray-100/50">
        <div className="flex-1 flex items-center px-4 border-r border-gray-100">
          <span className="material-symbols-outlined text-secondary mr-3">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 font-sans text-sm py-4"
            placeholder="Search business name..."
          />
        </div>
        <div className="flex-1 flex items-center px-4 border-r border-gray-100">
          <span className="material-symbols-outlined text-secondary mr-3">
            category
          </span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 font-sans text-sm py-4 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex items-center px-4">
          <span className="material-symbols-outlined text-secondary mr-3">
            location_on
          </span>
          {hydrated && userLocation ? (
            <div className="w-full flex items-center gap-3 py-4">
              <label className="flex items-center gap-2 text-sm text-navy-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={useNearMe}
                  onChange={(e) => {
                    setUseNearMe(e.target.checked)
                    setNearMeTouched(true)
                  }}
                  className="rounded border-gray-300"
                />
                Near me
              </label>
              {useNearMe && (
                <select
                  value={radiusMi}
                  onChange={(e) => setRadiusMi(Number(e.target.value))}
                  className="bg-transparent border-none focus:ring-0 text-sm cursor-pointer"
                >
                  {[25, 50, 100].map((mi) => (
                    <option key={mi} value={mi}>
                      {mi} miles
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 font-sans text-sm py-4 pl-2"
              placeholder="City or Zip Code"
            />
          )}
        </div>
        <button
          onClick={() => fetchListings()}
          className="bg-gold text-navy-dark px-10 py-4 rounded-xl label-sm text-[10px] font-bold tracking-widest active:scale-95 transition-transform"
        >
          Search
        </button>
      </div>

      {/* Results header + view toggle */}
      <div className="mt-12 flex justify-between items-end mb-8">
        <div>
          <span className="label-sm text-[10px] text-gold-dark font-bold tracking-[0.2em]">
            Directory Results
          </span>
          <h2 className="font-serif text-2xl lg:text-3xl text-navy-dark mt-1">
            Local &amp; Global Catholic Businesses
          </h2>
        </div>
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/50">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg label-sm text-[10px] font-bold tracking-widest transition-colors ${
              view === "list"
                ? "bg-white shadow-sm text-navy-dark"
                : "text-secondary hover:text-navy-dark"
            }`}
          >
            <span className="material-symbols-outlined text-sm">list</span>
            List
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg label-sm text-[10px] font-bold tracking-widest transition-colors ${
              view === "map"
                ? "bg-white shadow-sm text-navy-dark"
                : "text-secondary hover:text-navy-dark"
            }`}
          >
            <span className="material-symbols-outlined text-sm">map</span>
            Map
          </button>
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <>
          {loading ? (
            <div className="text-center py-12 text-secondary">Searching...</div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12 text-secondary">
              No businesses found. Try adjusting your search.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
                {filteredListings.map((listing, i) => (
                  <DirectoryListingCard
                    key={listing.id}
                    listing={listing}
                    featured={i === 0}
                  />
                ))}
              </div>
              {filteredListings.length < count && (
                <div className="mt-16 flex flex-col items-center">
                  <div className="w-24 h-px bg-gold mb-4" />
                  <button className="bg-gray-100 text-navy-dark px-8 py-3 rounded-xl label-sm text-[10px] font-bold tracking-[0.2em] hover:bg-gray-200 transition-colors">
                    Load More Partners
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Map View */}
      {view === "map" && (
        <DirectoryMapView listings={filteredListings} />
      )}
    </>
  )
}
