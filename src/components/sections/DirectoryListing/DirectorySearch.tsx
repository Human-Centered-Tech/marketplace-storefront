"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { algoliasearch } from "algoliasearch"
import { DirectoryListing, DirectoryCategory } from "@/types/directory"
import { DirectoryListingCard } from "./DirectoryListingCard"
import { DirectoryMapView } from "./DirectoryMap"
import {
  useUserLocation,
  readRadiusMi,
  writeRadiusMi,
} from "@/hooks/useUserLocation"
import { LocationPrompt } from "@/components/molecules/LocationPrompt/LocationPrompt"

type ViewMode = "list" | "map"

const PAGE_SIZE = 20
const ALGOLIA_INDEX = "directory_listings"
const KM_PER_MI = 1.60934

type DirectorySearchProps = {
  initialListings: DirectoryListing[]
  initialCount: number
  categories: DirectoryCategory[]
}

/**
 * Shape of an Algolia hit from the directory_listings index.
 * Set in marketplace-backend/src/lib/algolia-directory.ts
 * (buildAlgoliaListingRecord) and configured in init-algolia.ts
 * (attributesToRetrieve).
 */
type DirectoryHit = {
  objectID: string
  business_name: string
  slug: string
  description: string | null
  category_name: string
  category_id: string | null
  subscription_tier: "verified" | "featured" | "enterprise"
  city: string
  state: string
  logo_url: string | null
  cover_image_url: string | null
  website_url: string | null
  _geoloc?: { lat: number; lng: number }
}

/** Map an Algolia hit to the DirectoryListing shape that DirectoryListingCard expects. */
function hitToListing(hit: DirectoryHit): DirectoryListing {
  return {
    id: hit.objectID,
    business_name: hit.business_name,
    slug: hit.slug,
    description: hit.description,
    category_id: hit.category_id,
    category: hit.category_id
      ? ({
          id: hit.category_id,
          name: hit.category_name,
          slug: hit.category_name,
        } as DirectoryCategory)
      : undefined,
    subscription_tier: hit.subscription_tier,
    // Filled with defaults — Algolia is the source of truth for "what's
    // searchable", and we already filter the index to approved+active.
    subscription_status: "active",
    stripe_subscription_id: null,
    subscription_expires_at: null,
    verification_status: "approved",
    verified_by: null,
    verified_at: null,
    owner_id: "",
    vendor_id: null,
    contact_email: null,
    contact_phone: null,
    website_url: hit.website_url,
    address: {
      city: hit.city,
      state: hit.state,
      // Pass coords through so the map view can drop pins without a
      // round-trip back to the backend.
      ...(hit._geoloc
        ? { lat: hit._geoloc.lat, lng: hit._geoloc.lng }
        : {}),
    },
    social_links: null,
    hours_of_operation: null,
    always_open: false,
    owner_interview: null,
    devotional: null,
    cta_type: "visit_shop",
    cta_url: null,
    logo_url: hit.logo_url,
    cover_image_url: hit.cover_image_url,
    metadata: null,
    affiliations: [],
    badges: [],
    created_at: "",
    updated_at: "",
  } as unknown as DirectoryListing
}

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

  // Algolia client. Memoize so we don't re-create on every render.
  // If the env vars aren't set we'll fall back to the server-rendered
  // initialListings — better than rendering an empty page in dev.
  const algoliaClient = useMemo(() => {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_ID
    const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
    if (!appId || !searchKey) return null
    return algoliasearch(appId, searchKey)
  }, [])
  const algoliaEnabled = algoliaClient !== null

  const [allListings, setAllListings] = useState<DirectoryListing[]>(
    initialListings
  )
  const [count, setCount] = useState(initialCount)
  const [search, setSearch] = useState(urlQuery)
  const [categoryId, setCategoryId] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [view, setView] = useState<ViewMode>("list")
  const [useNearMe, setUseNearMe] = useState(
    Number.isFinite(urlNearLat) && Number.isFinite(urlNearLon)
  )
  // Auto-enable Near-me once location becomes available, unless the user
  // has explicitly toggled it off.
  const [nearMeTouched, setNearMeTouched] = useState(false)
  useEffect(() => {
    if (hydrated && userLocation && !nearMeTouched && !useNearMe) {
      setUseNearMe(true)
    }
  }, [hydrated, userLocation, nearMeTouched, useNearMe])
  const [radiusMi, setRadiusMiState] = useState(
    Number.isFinite(urlRadiusKm) ? Math.round(urlRadiusKm / KM_PER_MI) : 50
  )
  // Rehydrate from localStorage after mount; URL still wins if present.
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

  // When the user has NOT shared their location, they can still get
  // proximity-ranked results by typing a zip code into the location
  // field. We geocode the zip via Nominatim (debounced) and feed those
  // coords into Algolia's aroundLatLng. Not persisted — this is a
  // one-search-only override of proximity origin.
  const [zipCoords, setZipCoords] = useState<{ lat: number; lng: number } | null>(
    null
  )
  useEffect(() => {
    const raw = location.trim()
    const isZip = /^\d{5}(-\d{4})?$/.test(raw)
    if (!isZip) {
      if (zipCoords) setZipCoords(null)
      return
    }
    let cancelled = false
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
            raw
          )}&countrycodes=us&format=json&limit=1`
        )
        if (!res.ok) return
        const data = (await res.json()) as Array<{ lat?: string; lon?: string }>
        const hit = data?.[0]
        if (!hit || cancelled) return
        const lat = parseFloat(hit.lat || "")
        const lng = parseFloat(hit.lon || "")
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setZipCoords({ lat, lng })
        }
      } catch {
        // graceful no-op
      }
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [location])

  // Effective proximity origin: explicit Near-me wins, then zip-derived.
  const effectiveProximity =
    hydrated && useNearMe && userLocation
      ? { lat: userLocation.lat, lng: userLocation.lng, source: "user" as const }
      : zipCoords
        ? { lat: zipCoords.lat, lng: zipCoords.lng, source: "zip" as const }
        : null
  const proximityActive = effectiveProximity !== null

  useEffect(() => {
    if (urlQuery && urlQuery !== search) {
      setSearch(urlQuery)
    }
  }, [urlQuery])

  // Build Algolia query options. `location` is a freeform string that
  // could be a city or state — we use it as a secondary query term so
  // typo tolerance + stemming apply. When the user has shared their
  // location, we add aroundLatLng so Algolia ranks results by distance
  // and excludes anything outside the radius.
  const buildSearchParams = useCallback(
    (page: number) => {
      const facetFilters: string[][] = []
      if (categoryId) facetFilters.push([`category_id:${categoryId}`])

      // Combine search + (location text) into a single query if both present.
      // When proximity is active we drop the freeform location text — the
      // geosearch is more precise than "Denver" matching "Denver, NC" etc.
      // When proximity is active (geolocation OR zip-derived) we drop the
      // freeform location text — geosearch is more precise than text match.
      const queryParts = [
        search.trim(),
        proximityActive ? "" : location.trim(),
      ].filter(Boolean)
      const query = queryParts.join(" ")

      const geoParams = effectiveProximity
        ? {
            aroundLatLng: `${effectiveProximity.lat},${effectiveProximity.lng}`,
            // aroundRadius is in meters.
            aroundRadius: Math.round(radiusMi * KM_PER_MI * 1000),
          }
        : {}

      return {
        indexName: ALGOLIA_INDEX,
        query,
        page,
        hitsPerPage: PAGE_SIZE,
        ...(facetFilters.length ? { facetFilters } : {}),
        ...geoParams,
      }
    },
    [search, location, categoryId, proximityActive, effectiveProximity, radiusMi]
  )

  const runSearch = useCallback(
    async (page: number, append: boolean) => {
      if (!algoliaClient) return
      if (append) setLoadingMore(true)
      else setLoading(true)
      try {
        const { results } = await algoliaClient.search<DirectoryHit>({
          requests: [buildSearchParams(page)],
        })
        const result = results[0] as {
          hits: DirectoryHit[]
          nbHits: number
        }
        const listings = (result.hits || []).map(hitToListing)
        if (append) {
          setAllListings((prev) => [...prev, ...listings])
        } else {
          setAllListings(listings)
        }
        setCount(result.nbHits ?? 0)
      } catch {
        // Keep current state on error — better than wiping the UI.
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [algoliaClient, buildSearchParams]
  )

  // Refetch from page 0 on filter change. Debounce keystrokes so we
  // don't fire a request on every char. Skip first render — server
  // already supplied initialListings.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!algoliaEnabled) return
    const timer = setTimeout(() => {
      runSearch(0, false)
    }, 300)
    return () => clearTimeout(timer)
  }, [runSearch, algoliaEnabled])

  const loadMore = useCallback(() => {
    if (loadingMore || allListings.length >= count) return
    const nextPage = Math.floor(allListings.length / PAGE_SIZE)
    runSearch(nextPage, true)
  }, [runSearch, loadingMore, allListings.length, count])

  // Algolia is now authoritative; keep the variable name for minimal JSX churn.
  const filteredListings = allListings

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
            className="w-full bg-transparent border-none focus:ring-0 font-sans text-sm py-4 pl-2"
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
            <div className="w-full">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 font-sans text-sm py-4 pl-2"
                placeholder="ZIP for nearby, or city name"
              />
              {zipCoords && (
                <span className="block text-[10px] text-gold-dark font-bold uppercase tracking-wider pl-2 -mt-3 pb-1">
                  Showing within {radiusMi} mi of {location.trim()}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => runSearch(0, false)}
          disabled={!algoliaEnabled}
          className="bg-gold text-navy-dark px-10 py-4 rounded-xl label-sm text-[10px] font-bold tracking-widest active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
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
            {proximityActive
              ? "Catholic Businesses Near You"
              : "Local & Global Catholic Businesses"}
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
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-gray-100 text-navy-dark px-8 py-3 rounded-xl label-sm text-[10px] font-bold tracking-[0.2em] hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? "Loading…" : "Load More Partners"}
                  </button>
                  <p className="mt-3 text-xs text-secondary">
                    Showing {filteredListings.length} of {count}
                  </p>
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
