"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { algoliasearch } from "algoliasearch"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { DirectoryListing, DirectoryCategory } from "@/types/directory"
import { trackSearch } from "@/lib/analytics"
import { DirectoryListingCard } from "./DirectoryListingCard"
import { DirectoryMapView } from "./DirectoryMap"
import type { MapBbox } from "./GoogleDirectoryMap"
import {
  useUserLocation,
  readRadiusMi,
  writeRadiusMi,
} from "@/hooks/useUserLocation"
import { LocationPrompt } from "@/components/molecules/LocationPrompt/LocationPrompt"
import { US_STATES } from "@/lib/us-states"

type ViewMode = "list" | "map"

const PAGE_SIZE = 20
const ALGOLIA_INDEX = "directory_listings"
const KM_PER_MI = 1.60934
const M_PER_MI = 1609.344

// --- Infinite scroll / windowing -------------------------------------------
// The directory holds ~4,500 listings. Infinite scroll without windowing would
// append every one of them into the DOM, so the list view is virtualized: only
// the visible rows (plus overscan) are mounted. `allListings` still holds the
// full loaded set, which is what the map view and the dedup filter read from —
// virtualization is a rendering concern only and never touches the data.
//
// Rough height of one card row (image h-48 + padded body + the gap below it).
// It only has to be close: react-virtual measures each row for real once it
// mounts and corrects the offsets.
const ROW_ESTIMATE_PX = 460
// Start fetching the next page once the last mounted row is this close to the
// end of the loaded set, so the next batch is usually in place before the user
// reaches the bottom.
const PREFETCH_ROWS = 2
// Tailwind's `lg` breakpoint — the grid is 1 column below it, 3 at and above.
const LG_BREAKPOINT = "(min-width: 1024px)"

/** Column count of the results grid, mirroring `grid-cols-1 lg:grid-cols-3`. */
function useGridColumns() {
  // Starts at 1 so the server render and the first client render agree.
  const [columns, setColumns] = useState(1)
  useEffect(() => {
    const mq = window.matchMedia(LG_BREAKPOINT)
    const apply = () => setColumns(mq.matches ? 3 : 1)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])
  return columns
}

// Default proximity origin used purely for ranking (closer-first within
// each tier) when the user hasn't shared their location or typed a zip.
// Denver was chosen as a US-centric centroid for our catalog.
const DEFAULT_PROXIMITY_LAT = 39.7392
const DEFAULT_PROXIMITY_LNG = -104.9903

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
  category_ids?: string[]
  category_names?: string[]
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
  // Canva billing plan — drives the Essential/Merchant/Local badge split.
  // Indexed in the Algolia record (see algolia-directory.ts).
  pricing_tier?: string | null
  // Canva claim flow — true for paid claimants, false for unclaimed
  // prefill stubs. The card uses this (via owner_id) to render the
  // Unclaimed treatment.
  is_claimed?: boolean
  owner_id?: string | null
  // Customer-review aggregate (7/28). `rating` is null for listings nobody has
  // reviewed yet — it is NOT 0, so don't `?? 0` it anywhere downstream.
  rating?: number | null
  review_count?: number
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
    category_ids: hit.category_ids ?? undefined,
    subscription_tier: hit.subscription_tier,
    pricing_tier: (hit.pricing_tier as DirectoryListing["pricing_tier"]) ?? null,
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
    // Preserve null vs number: `?? 0` here would put five empty stars on every
    // unreviewed listing, which is exactly the fake-rating bug this replaced.
    rating: typeof hit.rating === "number" ? hit.rating : null,
    review_count: hit.review_count ?? 0,
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
  // Only the thresholds the control actually offers — a hand-typed
  // ?min_rating=4.5 would silently filter to something the dropdown can't show.
  const urlMinRating = ["2", "3", "4"].includes(
    searchParams.get("min_rating") || ""
  )
    ? (searchParams.get("min_rating") as string)
    : ""

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
  // Minimum customer rating (7/28). "" = no filter; otherwise "4" means 4 stars
  // and up. Applied as an Algolia numericFilter on the real average, so a 4.6
  // matches the "4 & up" bucket. Unrated listings have rating:null and
  // deliberately match NO rating filter — an unreviewed business isn't a 1-star
  // business, and silently including them would make the filter meaningless.
  // Seeded from ?min_rating= and written back on change, like the state filter —
  // otherwise the selection is lost on reload and a filtered directory can't be
  // linked to anyone.
  const [minRating, setMinRating] = useState<string>(urlMinRating)
  const setMinRatingAndPersist = useCallback(
    (next: string) => {
      setMinRating(next)
      const params = new URLSearchParams(searchParams.toString())
      if (next) params.set("min_rating", next)
      else params.delete("min_rating")
      const qs = params.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )
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
  // The windowed list's root — declared up here because runSearch (below)
  // reads its position after a page-0 refetch.
  const listRef = useRef<HTMLDivElement | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  // Whether Algolia has another page for the current query. Seeded from the
  // server-rendered first page; recomputed from nbPages on every search.
  const [hasMore, setHasMore] = useState(
    initialListings.length < initialCount
  )
  // Set when an append fails. Infinite scroll would otherwise re-fire the same
  // failing request every time the sentinel row stays on screen, so auto-load
  // parks itself and the user gets an explicit Retry instead.
  const [loadMoreFailed, setLoadMoreFailed] = useState(false)
  // Last page successfully loaded. Tracked explicitly rather than derived from
  // allListings.length, which drifts once dedup drops a repeated hit and would
  // then request the same page forever.
  const pageRef = useRef(0)
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
  // has explicitly toggled it off — or has already started browsing.
  // Geolocation permission can resolve seconds after mount; flipping the
  // ranking to distance at that point refetched page 0 and REPLACED the list
  // under a user who was already scrolled into it (tr-dir-scroll-jump: the
  // 12 → 27 → 12 shrink with a different first card). Past the list top, leave
  // it off; the toggle is still there.
  const [nearMeTouched, setNearMeTouched] = useState(false)
  useEffect(() => {
    if (
      hydrated &&
      userLocation &&
      !nearMeTouched &&
      !useNearMe &&
      !stateServed
    ) {
      if (typeof window !== "undefined" && window.scrollY > 150) return
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
  // field. We geocode the zip via the Google Geocoding API (debounced) and
  // feed those coords into Algolia's aroundLatLng. Not persisted — this is a
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
        // Geocode server-side — the browser maps key is referrer-restricted and
        // Google's Geocoding REST service rejects those. See /api/geocode.
        const res = await fetch(`/api/geocode?zip=${encodeURIComponent(raw)}`)
        if (!res.ok) return
        const data = (await res.json()) as { lat?: number; lng?: number }
        if (cancelled) return
        const lat = Number(data.lat)
        const lng = Number(data.lng)
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

  // The state filter we actually apply. An explicit dropdown pick always
  // wins. Otherwise, when Near-me is OFF — and we're not driving a map
  // "Search this area" box — fall back to the user's detected home state,
  // so unchecking Near-me shows "what's in your state" instead of every
  // listing nationwide. Requires a known 2-letter state from geolocation;
  // without one we leave it empty and fall through to default ranking.
  const effectiveStateServed = useMemo(() => {
    if (stateServed) return stateServed
    if (!useNearMe && hydrated && !bbox && userLocation?.state) {
      return userLocation.state
    }
    return ""
  }, [stateServed, useNearMe, hydrated, bbox, userLocation?.state])

  useEffect(() => {
    if (urlQuery && urlQuery !== search) {
      setSearch(urlQuery)
    }
  }, [urlQuery])

  // Search-term logging (SOW §11.3): the free-text term only, never the
  // location string. trackSearch debounces + dedupes internally, so firing
  // on every keystroke of `search` is safe.
  useEffect(() => {
    trackSearch(search, "directory")
  }, [search])

  // Build Algolia query options. `location` is a freeform string that
  // could be a city or state — we use it as a secondary query term so
  // typo tolerance + stemming apply. When the user has shared their
  // location, we add aroundLatLng so Algolia ranks results by distance
  // and excludes anything outside the radius.
  const buildSearchParams = useCallback(
    (page: number) => {
      const facetFilters: string[][] = []
      // Match on the full category set (primary OR additional).
      if (categoryId) facetFilters.push([`category_ids:${categoryId}`])
      // State-served filter — listings whose serviced_states array
      // contains the selected 2-letter code. ANDs with everything else
      // (proximity, category, query): a vendor must service the picked
      // state to appear, even if they're physically close.
      if (effectiveStateServed)
        facetFilters.push([`serviced_states:${effectiveStateServed}`])

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
      // every business that serves this state" regardless of where it's
      // physically located — so we drop ALL geo. This includes any active
      // map viewport (bbox): an insideBoundingBox here would restrict to
      // businesses physically inside the rectangle, masking most matches
      // (a business can serve FL while being located elsewhere). State
      // therefore takes priority over both proximity and the map box.
      //
      // Without a state filter: a map-driven viewport (bbox, set via
      // "Search this area") takes priority over proximity — we want exactly
      // the visible rectangle. Otherwise aroundLatLng for closer-first
      // ranking, plus aroundRadius when the user has engaged with location.
      const geoParams: Record<string, unknown> = {}
      if (!effectiveStateServed) {
        if (bbox) {
          // Algolia insideBoundingBox: [[p1Lat, p1Lng, p2Lat, p2Lng]],
          // two diagonally opposite corners. NW + SE works.
          geoParams.insideBoundingBox = [
            [bbox.north, bbox.west, bbox.south, bbox.east],
          ]
        } else {
          geoParams.aroundLatLng = `${effectiveProximity.lat},${effectiveProximity.lng}`
          geoParams.getRankingInfo = true
          if (applyRadius) {
            geoParams.aroundRadius = Math.round(radiusMi * KM_PER_MI * 1000)
          }
        }
      }

      // Mirror Bubble's "Premium State(s)" boost: when the user picks
      // a state, listings that paid for premium placement in that state
      // (premium_states contains it) float above peers within the same
      // tier. optionalFilters affects ranking only, never the result set.
      const optionalFilters = effectiveStateServed
        ? [`premium_states:${effectiveStateServed}`]
        : undefined

      return {
        indexName: ALGOLIA_INDEX,
        query,
        page,
        hitsPerPage: PAGE_SIZE,
        ...(facetFilters.length ? { facetFilters } : {}),
        ...(optionalFilters ? { optionalFilters } : {}),
        // Minimum-rating filter. numericFilters (not a facet) so it compares
        // against the true average — facetFilters on rating_floor would treat
        // "4 & up" as "exactly the 4 bucket" and drop every 5-star listing.
        ...(minRating ? { numericFilters: [`rating>=${minRating}`] } : {}),
        ...geoParams,
      }
    },
    [search, location, categoryId, effectiveStateServed, proximityActive, effectiveProximity, radiusMi, applyRadius, bbox, minRating]
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
          nbPages?: number
        }
        const listings = (result.hits || []).map(hitToListing)
        if (append) {
          // Dedup by id. Algolia can repeat a record across page boundaries
          // when ranking scores tie, and a duplicate key would break both
          // React reconciliation and the map pins.
          setAllListings((prev) => {
            const seen = new Set(prev.map((l) => l.id))
            const fresh = listings.filter((l) => !seen.has(l.id))
            return fresh.length ? [...prev, ...fresh] : prev
          })
        } else {
          setAllListings(listings)
          // A filter change while the user is scrolled deep into the old
          // results: bring the top of the new list into view rather than
          // swapping content underneath them. No-op when the list top is
          // already on screen (the common case — filters sit right above it).
          // Absolute target, applied after React commits the shorter/longer
          // list: a smooth relative scroll issued before the commit gets
          // clamped when the document shrinks and strands the user at the
          // BOTTOM of the new results.
          const top = listRef.current?.getBoundingClientRect().top
          if (typeof top === "number" && top < 0) {
            const target = Math.max(0, window.scrollY + top - 16)
            requestAnimationFrame(() => window.scrollTo({ top: target }))
          }
        }
        setCount(result.nbHits ?? 0)
        pageRef.current = page
        // Algolia caps pagination (paginationLimitedTo, 1000 hits by default),
        // so nbPages — NOT nbHits — is the real end of the road. Trusting nbHits
        // here would let infinite scroll spin forever on empty pages once the
        // cap is hit. A short page is a second, belt-and-braces terminator.
        const nbPages = result.nbPages ?? 0
        setHasMore(page + 1 < nbPages && listings.length > 0)
        setLoadMoreFailed(false)
      } catch {
        // Keep current state on error — better than wiping the UI. For an
        // append, park auto-loading so the sentinel doesn't retry in a loop.
        if (append) setLoadMoreFailed(true)
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
    // `loading` (a page-0 refetch from a filter change) also blocks: appending
    // page N of the old query onto page 0 of the new one would interleave two
    // different result sets.
    if (loadingMore || loading || !hasMore || loadMoreFailed) return
    if (!algoliaEnabled) return
    runSearch(pageRef.current + 1, true)
  }, [runSearch, loadingMore, loading, hasMore, loadMoreFailed, algoliaEnabled])

  const retryLoadMore = useCallback(() => {
    setLoadMoreFailed(false)
    runSearch(pageRef.current + 1, true)
  }, [runSearch])

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
  const filteredListings = useMemo(
    () => allListings.filter((l) => !bannerIds.has(l.id)),
    [allListings, bannerIds]
  )

  // --- Virtualized list view ------------------------------------------------
  // Window-scrolled (the page has no inner scroll container), row-windowed:
  // the grid is chunked into rows of `columns` and only the rows near the
  // viewport are mounted. `filteredListings` — the full loaded set — still
  // feeds the map view untouched.
  //
  // Before mount we render the plain grid, which is what the server emitted:
  // it keeps the first page of listings in the SSR HTML (crawlable, no flash)
  // and it means hydration matches. The swap to the windowed list happens on
  // the mount effect, at the top of the page, so no scroll jump.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const columns = useGridColumns()

  const rows = useMemo(() => {
    const chunked: DirectoryListing[][] = []
    for (let i = 0; i < filteredListings.length; i += columns) {
      chunked.push(filteredListings.slice(i, i + columns))
    }
    return chunked
  }, [filteredListings, columns])

  // Distance from the top of the document to the top of the list. The
  // virtualizer needs it to map window scroll onto row offsets; without it it
  // would behave as though the list started at y=0 and skip the first rows as
  // soon as you scrolled past the search bar. Re-measured whenever anything
  // above the list can change height (premium banners load in async) or the
  // window resizes.
  const [listOffsetTop, setListOffsetTop] = useState(0)
  const listOffsetTopRef = useRef<number | null>(null)
  const selfScrollRef = useRef(false)
  useEffect(() => {
    if (!mounted || view !== "list") return
    const measure = () => {
      const el = listRef.current
      if (!el) return
      // getBoundingClientRect + scrollY, NOT offsetTop: the directory page
      // wraps this component in a `relative` <header>, which makes it the
      // offsetParent — offsetTop would measure from there, not the document.
      const next = Math.round(el.getBoundingClientRect().top + window.scrollY)
      const prev = listOffsetTopRef.current
      // Something above the list changed height (premium banners landing,
      // the zip hint, the radius select) while the user was already inside
      // the list. The rows are absolutely positioned off scrollMargin, so
      // the browser's scroll anchoring can't hold them — shift the window by
      // the same delta so what they're reading stays where it is.
      //
      // Guarded two ways, because the naive version froze the tab: a scroll
      // re-measures rows → the body resizes → this observer fires → sub-pixel
      // rounding makes `next` differ by 1px → scrollBy(1) → another scroll…
      // a frame-rate ping-pong that starved the renderer and walked the page
      // to the bottom. So: ignore jitter (real layout shifts are tens of px),
      // and ignore the measurement our own scrollBy provokes.
      const delta = next - prev!
      if (
        prev !== null &&
        Math.abs(delta) > 4 &&
        window.scrollY > prev &&
        !selfScrollRef.current
      ) {
        selfScrollRef.current = true
        window.scrollBy(0, delta)
        requestAnimationFrame(() => {
          selfScrollRef.current = false
        })
      }
      listOffsetTopRef.current = next
      setListOffsetTop(next)
    }
    measure()
    window.addEventListener("resize", measure)
    // Anything above the list can change height at any time — premium banners
    // arriving, the zip-code hint appearing under the location field, the
    // radius select showing up. Watch the body instead of trying to enumerate
    // them. Re-measuring to the same value is a no-op (React bails on an equal
    // state value), so the list's own growth doesn't loop this.
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => {
      window.removeEventListener("resize", measure)
      ro.disconnect()
    }
  }, [mounted, view, premiumBanners.length, columns])

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: 3,
    scrollMargin: listOffsetTop,
    getItemKey: (index) => rows[index]?.[0]?.id ?? index,
  })
  const virtualRows = virtualizer.getVirtualItems()

  // Infinite scroll. The last mounted row coming within PREFETCH_ROWS of the
  // end of the loaded set is the trigger — no button, and no bottom sentinel
  // that a windowed list would keep permanently off-screen. loadMore is itself
  // idempotent (it no-ops while a request is in flight, once Algolia's last
  // page is in, or after a failure).
  const lastVirtualRow = virtualRows[virtualRows.length - 1]
  useEffect(() => {
    if (!mounted || view !== "list") return
    if (rows.length === 0) return
    if (!lastVirtualRow) return
    if (lastVirtualRow.index >= rows.length - 1 - PREFETCH_ROWS) {
      loadMore()
    }
  }, [mounted, view, rows.length, lastVirtualRow, loadMore])

  // Out of pages but not out of matches — see the copy note at the bottom.
  const reachedPaginationCap = !hasMore && filteredListings.length < count

  const renderCard = (listing: DirectoryListing) => (
    <DirectoryListingCard
      key={listing.id}
      listing={listing}
      showDistance={showDistance}
    />
  )

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
      {/* Tablet: five segments can't share one row (fields were cut off,
          Matteo 7/3) — let them wrap; min-widths decide the break points. */}
      <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col md:flex-row md:flex-wrap items-stretch gap-2 border border-gray-100">
        <div className="flex-1 md:min-w-[240px] flex items-center px-4 border-r border-gray-100">
          <span className="material-symbols-outlined text-secondary mr-3">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 font-sans text-sm py-4 pl-2"
            placeholder="Search name, category, city, parish..."
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="material-symbols-outlined text-secondary/70 hover:text-navy-dark text-[20px] ml-1 shrink-0"
            >
              close
            </button>
          )}
        </div>
        <div className="flex-1 md:min-w-[200px] flex items-center px-4 border-r border-gray-100">
          <span className="material-symbols-outlined text-secondary mr-3">
            category
          </span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 font-sans text-sm py-4 appearance-none cursor-pointer"
            title="Category"
            aria-label="Category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
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
            className="ml-1 shrink-0 text-secondary"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {/* Minimum customer rating. Plain "& up" thresholds rather than the
            five-checkbox facet list the old (never-rendered) SellerRatingFilter
            used: on a directory where most listings are still unreviewed, five
            buckets are mostly zeroes, and "exactly 3 stars" isn't a thing
            anyone shops by. */}
        <div className="flex items-center px-3 border-r border-gray-100 shrink-0">
          <span className="material-symbols-outlined text-secondary mr-2">
            star
          </span>
          <select
            value={minRating}
            onChange={(e) => setMinRatingAndPersist(e.target.value)}
            className="bg-transparent border-none focus:ring-0 font-sans text-sm py-4 pr-1 appearance-none cursor-pointer"
            title="Minimum customer rating"
            aria-label="Minimum customer rating"
          >
            <option value="">Rating</option>
            <option value="4">4★ &amp; up</option>
            <option value="3">3★ &amp; up</option>
            <option value="2">2★ &amp; up</option>
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
            className="ml-1 shrink-0 text-secondary"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
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
            aria-label="Serves my state"
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
        <div className="flex-1 md:min-w-[220px] flex items-center px-4">
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
          className="bg-navy-dark text-white px-10 py-4 rounded-xl label-sm text-[10px] font-bold tracking-widest hover:bg-navy active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy-dark mt-1">
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
          {loading && filteredListings.length === 0 ? (
            <div className="text-center py-12 text-secondary">Searching...</div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12 text-secondary">
              No businesses found. Try adjusting your search.
            </div>
          ) : (
            // A page-0 refetch (filter change) keeps the current list mounted
            // and dims it instead of swapping in a one-line "Searching..." —
            // unmounting a windowed list thousands of px tall collapsed the
            // document and yanked the scroll position (tr-dir-scroll-jump).
            <div
              aria-busy={loading || undefined}
              className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}
            >
              {!mounted ? (
                // Server render / first paint: the plain grid, exactly as
                // before. Swapped for the windowed list on mount.
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
                  {filteredListings.map(renderCard)}
                </div>
              ) : (
                <div ref={listRef} className="max-w-7xl">
                  <div
                    className="relative w-full"
                    style={{ height: `${virtualizer.getTotalSize()}px` }}
                  >
                    {virtualRows.map((virtualRow) => (
                      <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        className="absolute top-0 left-0 w-full grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6"
                        style={{
                          transform: `translateY(${
                            virtualRow.start - virtualizer.options.scrollMargin
                          }px)`,
                        }}
                      >
                        {rows[virtualRow.index]?.map(renderCard)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Infinite-scroll status strip. Keeps the gold hairline the
                  Load More block used, so the page bottom reads the same. */}
              {(loadingMore || loadMoreFailed || !hasMore) && (
                <div className="mt-10 flex flex-col items-center">
                  <div className="w-24 h-px bg-gold mb-4" />
                  {loadingMore ? (
                    <p
                      className="label-sm text-[10px] text-secondary font-bold tracking-[0.2em]"
                      role="status"
                      aria-live="polite"
                    >
                      Loading more partners…
                    </p>
                  ) : loadMoreFailed ? (
                    <button
                      onClick={retryLoadMore}
                      className="bg-gray-100 text-navy-dark px-8 py-3 rounded-xl label-sm text-[10px] font-bold tracking-[0.2em] hover:bg-gray-200 transition-colors"
                    >
                      Couldn&apos;t load more — Retry
                    </button>
                  ) : reachedPaginationCap ? (
                    // Algolia stops paginating at 1,000 hits, so on a broad
                    // query we run out of pages long before we run out of
                    // matches. Say so rather than claiming they've seen it all.
                    <p className="label-sm text-[10px] text-secondary font-bold tracking-[0.2em] text-center">
                      That&apos;s as far as this search goes — refine it to see
                      more
                    </p>
                  ) : (
                    <p className="label-sm text-[10px] text-secondary font-bold tracking-[0.2em]">
                      You&apos;ve seen every partner
                    </p>
                  )}
                  <p className="mt-3 text-xs text-secondary">
                    Showing {filteredListings.length.toLocaleString()} of{" "}
                    {count.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
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
          showDistance={showDistance}
        />
      )}
    </>
  )
}
