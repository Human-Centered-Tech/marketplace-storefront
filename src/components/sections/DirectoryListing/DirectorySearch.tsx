"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { algoliasearch } from "algoliasearch"
import { DirectoryListing, DirectoryCategory } from "@/types/directory"
import { DirectoryListingCard } from "./DirectoryListingCard"
import { DirectoryMapView } from "./DirectoryMap"
import type { MapBbox } from "./LeafletMap"
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
const M_PER_MI = 1609.344

// Default proximity origin used purely for ranking (closer-first within
// each tier) when the user hasn't shared their location or typed a zip.
// Denver was chosen as a US-centric centroid for our catalog.
const DEFAULT_PROXIMITY_LAT = 39.7392
const DEFAULT_PROXIMITY_LNG = -104.9903

// US states + DC. The 2-letter codes match what's stored in
// listing.address.serviced_states (uppercased + comma-split in
// buildAlgoliaListingRecord on the backend).
const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
]

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
  subscription_tier:
    | "verified"
    | "featured"
    | "enterprise"
    | "local"
    | "merchant"
    | "tier2_startup"
    | "tier2_nonprofit"
    | "tier2_business"
    | "tier3"
    | "tier4"
  // Canva claim flow — true for paid claimants, false for unclaimed
  // prefill stubs. The card uses this (via owner_id) to render the
  // Unclaimed treatment.
  is_claimed?: boolean
  owner_id?: string | null
  city: string
  state: string
  logo_url: string | null
  cover_image_url: string | null
  website_url: string | null
  _geoloc?: { lat: number; lng: number }
  // Returned when getRankingInfo is enabled — geoDistance is in meters
  // from the aroundLatLng point.
  _rankingInfo?: { geoDistance?: number }
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
    // searchable". Unclaimed stubs index too, distinguished by
    // is_claimed; that flag drives the card's Unclaimed badge via the
    // resolved owner_id below.
    //
    // Backward compatibility: legacy records pre-dating the Canva
    // rollout don't carry is_claimed at all. Treat missing as claimed
    // (the legacy index only contained approved+active rows). Only an
    // explicit `false` flips the card into the Unclaimed treatment.
    subscription_status: hit.is_claimed === false ? "pending" : "active",
    stripe_subscription_id: null,
    subscription_expires_at: null,
    verification_status: hit.is_claimed === false ? "pending" : "approved",
    verified_by: null,
    verified_at: null,
    owner_id:
      hit.is_claimed === false ? null : hit.owner_id ?? "claimed",
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
    // Distance in miles from the aroundLatLng origin (rounded to 1
    // decimal). Display is gated by the showDistance prop on the card,
    // so this safely tags every hit even when origin is the silent
    // Denver default.
    _distance_miles:
      typeof hit._rankingInfo?.geoDistance === "number"
        ? Math.round((hit._rankingInfo.geoDistance / M_PER_MI) * 10) / 10
        : undefined,
  } as unknown as DirectoryListing
}

export const DirectorySearch = ({
  initialListings,
  initialCount,
  categories,
}: DirectorySearchProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const urlQuery = searchParams.get("q") || ""
  const urlNearLat = parseFloat(searchParams.get("near_lat") || "")
  const urlNearLon = parseFloat(searchParams.get("near_lon") || "")
  const urlRadiusKm = parseFloat(searchParams.get("radius_km") || "")
  const urlState = (searchParams.get("state") || "").toUpperCase()

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
  // Selected state-served filter (2-letter code, e.g. "CO"); empty
  // string means "any". Initialized from ?state= in the URL so
  // shareable links work, kept in URL on change.
  const [stateServed, setStateServed] = useState<string>(urlState)
  const setStateServedAndPersist = useCallback(
    (next: string) => {
      setStateServed(next)
      // State filter and Near-me are mutually exclusive — picking a state
      // means "show me businesses serving X regardless of distance," which
      // contradicts proximity ranking. The query layer already drops geo
      // when stateServed is set; this just keeps the UI honest.
      if (next) {
        setUseNearMe(false)
        setNearMeTouched(true)
      }
      const params = new URLSearchParams(searchParams.toString())
      if (next) params.set("state", next)
      else params.delete("state")
      const qs = params.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [view, setView] = useState<ViewMode>("list")
  // Map-driven viewport search. When set, the Algolia query swaps
  // aroundLatLng/aroundRadius for insideBoundingBox so we scope to the
  // visible map area. Cleared whenever the user leaves map view.
  const [bbox, setBbox] = useState<MapBbox | null>(null)
  useEffect(() => {
    if (view !== "map" && bbox) setBbox(null)
  }, [view, bbox])
  const [useNearMe, setUseNearMe] = useState(
    Number.isFinite(urlNearLat) && Number.isFinite(urlNearLon)
  )
  // Auto-enable Near-me once location becomes available, unless the user
  // has explicitly toggled it off.
  const [nearMeTouched, setNearMeTouched] = useState(false)
  useEffect(() => {
    if (
      hydrated &&
      userLocation &&
      !nearMeTouched &&
      !useNearMe &&
      !stateServed
    ) {
      setUseNearMe(true)
    }
  }, [hydrated, userLocation, nearMeTouched, useNearMe, stateServed])
  const [radiusMi, setRadiusMiState] = useState(
    Number.isFinite(urlRadiusKm) ? Math.round(urlRadiusKm / KM_PER_MI) : 100
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

  // Effective proximity origin. Always has a value — falls back to a
  // hardcoded Denver centroid so the closer-first secondary sort works
  // even when the user hasn't engaged with location. Memoized for
  // identity stability (otherwise it cascades through useCallback
  // chains and re-arms the refetch useEffect every render, which
  // would wipe Load More state mid-flight).
  const effectiveProximity = useMemo(() => {
    if (hydrated && useNearMe && userLocation) {
      return {
        lat: userLocation.lat,
        lng: userLocation.lng,
        source: "user" as const,
      }
    }
    if (zipCoords) {
      return { lat: zipCoords.lat, lng: zipCoords.lng, source: "zip" as const }
    }
    return {
      lat: DEFAULT_PROXIMITY_LAT,
      lng: DEFAULT_PROXIMITY_LNG,
      source: "default" as const,
    }
  }, [
    hydrated,
    useNearMe,
    userLocation?.lat,
    userLocation?.lng,
    zipCoords?.lat,
    zipCoords?.lng,
  ])
  // The radius filter only applies when the user has explicitly
  // engaged with location — Near-me is on, OR they typed a zip.
  // The Denver default is for ranking only, never filtering.
  const applyRadius = effectiveProximity.source !== "default"
  // Show "X mi away" labels only when proximity is from an explicit
  // user-supplied origin. Showing distance from Denver to a user in
  // Boston would be misleading.
  const showDistance = applyRadius
  // Kept for the JSX header / placeholder text below — true whenever
  // the user has *opted in* to location.
  const proximityActive = applyRadius

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
      // State-served filter — listings whose serviced_states array
      // contains the selected 2-letter code. ANDs with everything else
      // (proximity, category, query): a vendor must service the picked
      // state to appear, even if they're physically close.
      if (stateServed) facetFilters.push([`serviced_states:${stateServed}`])

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

      // When a state-served filter is on, the user's intent is "show me
      // every business that serves this state" — proximity filtering
      // (near-me radius, default-radius) would mask matching businesses
      // outside that radius, so we drop geo entirely. Otherwise keep
      // aroundLatLng for closer-first ranking and aroundRadius when the
      // user has explicitly engaged with location.
      //
      // Map-driven viewport search (bbox) takes priority over both —
      // when the user pans the map and clicks "Search this area", we
      // want exactly the visible rectangle, not a radius from somewhere
      // else.
      const geoParams: Record<string, unknown> = {}
      if (bbox) {
        // Algolia insideBoundingBox: [[p1Lat, p1Lng, p2Lat, p2Lng]],
        // two diagonally opposite corners. NW + SE works.
        geoParams.insideBoundingBox = [
          [bbox.north, bbox.west, bbox.south, bbox.east],
        ]
      } else if (!stateServed) {
        geoParams.aroundLatLng = `${effectiveProximity.lat},${effectiveProximity.lng}`
        geoParams.getRankingInfo = true
        if (applyRadius) {
          geoParams.aroundRadius = Math.round(radiusMi * KM_PER_MI * 1000)
        }
      }

      // Mirror Bubble's "Premium State(s)" boost: when the user picks
      // a state, listings that paid for premium placement in that state
      // (premium_states contains it) float above peers within the same
      // tier. optionalFilters affects ranking only, never the result set.
      const optionalFilters = stateServed
        ? [`premium_states:${stateServed}`]
        : undefined

      return {
        indexName: ALGOLIA_INDEX,
        query,
        page,
        hitsPerPage: PAGE_SIZE,
        ...(facetFilters.length ? { facetFilters } : {}),
        ...(optionalFilters ? { optionalFilters } : {}),
        ...geoParams,
      }
    },
    [search, location, categoryId, stateServed, proximityActive, effectiveProximity, radiusMi, applyRadius, bbox]
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
  const stateSelectRef = useRef<HTMLSelectElement | null>(null)
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

  // Active state for premium-banner display: explicit dropdown wins,
  // else the user's geocoded state (from GPS or zip).
  const activeStateForBanner =
    stateServed || (hydrated ? userLocation?.state : undefined) || ""

  // Enterprise listings whose premium_states includes activeStateForBanner.
  // Rendered as banner cards above the search bar; suppressed in the grid
  // below to avoid duplication.
  const [premiumBanners, setPremiumBanners] = useState<DirectoryListing[]>([])
  useEffect(() => {
    if (!activeStateForBanner || !algoliaClient) {
      setPremiumBanners([])
      return
    }
    let cancelled = false
    algoliaClient
      .search<DirectoryHit>({
        requests: [
          {
            indexName: ALGOLIA_INDEX,
            hitsPerPage: 5,
            facetFilters: [
              ["subscription_tier:enterprise"],
              [`premium_states:${activeStateForBanner}`],
            ],
          },
        ],
      })
      .then(({ results }) => {
        if (cancelled) return
        const hits = (results[0] as { hits: DirectoryHit[] }).hits ?? []
        setPremiumBanners(hits.map(hitToListing))
      })
      .catch(() => {
        if (!cancelled) setPremiumBanners([])
      })
    return () => {
      cancelled = true
    }
  }, [activeStateForBanner, algoliaClient])

  // Hide banner-shown listings from the regular grid so we don't render
  // the same enterprise twice on the page.
  const bannerIds = useMemo(
    () => new Set(premiumBanners.map((l) => l.id)),
    [premiumBanners]
  )
  const filteredListings = allListings.filter((l) => !bannerIds.has(l.id))

  return (
    <>
      <LocationPrompt className="mb-4" />

      {premiumBanners.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4">
          {premiumBanners.map((listing) => (
            <DirectoryListingCard
              key={listing.id}
              listing={listing}
              featured
            />
          ))}
        </div>
      )}

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
        <div
          className="flex items-center px-3 border-r border-gray-100 shrink-0 cursor-pointer"
          onClick={(e) => {
            // Don't double-fire when the click already lands on the select.
            if (e.target instanceof HTMLSelectElement) return
            const el = stateSelectRef.current
            if (!el) return
            const withPicker = el as HTMLSelectElement & { showPicker?: () => void }
            if (typeof withPicker.showPicker === "function") {
              withPicker.showPicker()
            } else {
              el.focus()
              el.click()
            }
          }}
        >
          <span className="material-symbols-outlined text-secondary mr-2">
            map
          </span>
          <select
            ref={stateSelectRef}
            value={stateServed}
            onChange={(e) => setStateServedAndPersist(e.target.value)}
            className="bg-transparent border-none focus:ring-0 font-sans text-sm py-4 pr-1 appearance-none cursor-pointer"
            title="Serves my state"
          >
            <option value="">State</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1 text-secondary"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
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
                    // Mutually exclusive with state filter — clear it
                    // when the user opts back into proximity.
                    if (e.target.checked && stateServed) {
                      setStateServedAndPersist("")
                    }
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
                  {[25, 50, 100, 500].map((mi) => (
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
            <span className="text-secondary font-sans text-base lg:text-lg font-normal ml-3">
              ({count.toLocaleString()})
            </span>
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
                {filteredListings.map((listing) => (
                  <DirectoryListingCard
                    key={listing.id}
                    listing={listing}
                    showDistance={showDistance}
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
        <DirectoryMapView
          listings={filteredListings}
          onSearchArea={setBbox}
          bboxActive={bbox !== null}
          isSearching={loading}
        />
      )}
    </>
  )
}
