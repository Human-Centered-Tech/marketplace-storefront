"use client"

import { useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { client } from "@/lib/client"
import { trackSearch } from "@/lib/analytics"
import { listBarterListings } from "@/lib/data/barter"
import { listNetworkingEvents } from "@/lib/data/networking"
import { BarterListing } from "@/types/barter"
import { NetworkingEvent } from "@/types/networking"

/**
 * Federated ("master") search dropdown for the header bar. Runs one query
 * across every searchable domain and groups the hits:
 *   Products      → Algolia `products` index
 *   Storefronts   → derived from the matching products' (ACTIVE) sellers
 *   Listings      → Algolia `directory_listings` index
 *   Sacred Exchange → /store/barter/listings (server action, public)
 *   Events        → /store/networking/events  (server action, public)
 *
 * Products/Directory hit the Algolia lite client directly (browser-safe via
 * the NEXT_PUBLIC_ALGOLIA_* search key). Barter/events go through the existing
 * "use server" data fns because the Medusa sdk is configured with a
 * server-only backend URL.
 */

type ProductHit = {
  objectID: string
  title?: string
  handle?: string
  thumbnail?: string | null
  brand?: { name?: string } | null
  store_name?: string | null
  seller?: { handle?: string; store_status?: string } | null
}

type DirectoryHit = {
  objectID: string
  business_name: string
  slug?: string
  category_name?: string
  city?: string
  state?: string
  logo_url?: string | null
}

type Storefront = { handle: string; name: string }
type ExchangeHit = { id: string; title: string; listing_type: string; city?: string; state?: string }
type EventHit = { id: string; title: string; event_date: string }

type Results = {
  products: ProductHit[]
  storefronts: Storefront[]
  listings: DirectoryHit[]
  exchange: ExchangeHit[]
  events: EventHit[]
}

const EMPTY: Results = { products: [], storefronts: [], listings: [], exchange: [], events: [] }

const LISTING_TYPE_LABEL: Record<string, string> = {
  sell: "For sale",
  trade: "Trade",
  barter: "Barter",
  free: "Free",
}

export function GlobalSearchResults({
  query,
  onNavigate,
}: {
  query: string
  onNavigate: () => void
}) {
  const [results, setResults] = useState<Results>(EMPTY)
  const [loading, setLoading] = useState(false)
  const reqId = useRef(0)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults(EMPTY)
      setLoading(false)
      return
    }

    const id = ++reqId.current
    setLoading(true)

    const timer = setTimeout(async () => {
      // Search-term logging (SOW §11.3) — trackSearch debounces and
      // dedupes internally, so per-keystroke calls are safe.
      trackSearch(q, "global")
      try {
        const [algoliaResults, exchangeListings, eventList] = await Promise.all([
          client
            .search<Record<string, unknown>>({
              requests: [
                {
                  indexName: "products",
                  query: q,
                  hitsPerPage: 6,
                  facetFilters: [["seller.store_status:ACTIVE"]],
                  // Hide un-payout-onboarded vendors (tri-state; see
                  // AlgoliaProductsListing).
                  filters: "NOT accepts_orders:false",
                },
                { indexName: "directory_listings", query: q, hitsPerPage: 4 },
              ],
            })
            .then((r) => r.results)
            .catch(() => [] as Array<{ hits?: unknown[] }>),
          listBarterListings({ q, limit: 4 })
            .then((r) => r.listings ?? [])
            .catch(() => [] as BarterListing[]),
          listNetworkingEvents({ q, limit: 4 })
            .then((r) => r.events ?? [])
            .catch(() => [] as NetworkingEvent[]),
        ])

        if (id !== reqId.current) return // a newer query superseded this one

        const productHits = ((algoliaResults[0] as { hits?: ProductHit[] })?.hits ?? [])
        const dirHits = ((algoliaResults[1] as { hits?: DirectoryHit[] })?.hits ?? [])

        // Storefronts = distinct ACTIVE sellers behind the matching products.
        const seen = new Set<string>()
        const storefronts: Storefront[] = []
        for (const p of productHits) {
          const handle = p.seller?.handle
          if (!handle || p.seller?.store_status !== "ACTIVE" || seen.has(handle)) continue
          seen.add(handle)
          storefronts.push({ handle, name: p.brand?.name || p.store_name || handle })
          if (storefronts.length >= 4) break
        }

        setResults({
          products: productHits.slice(0, 5),
          storefronts,
          listings: dirHits.slice(0, 4),
          exchange: exchangeListings.slice(0, 4).map((l) => ({
            id: l.id,
            title: l.title,
            listing_type: l.listing_type,
            city: l.location?.city,
            state: l.location?.state,
          })),
          events: eventList.slice(0, 4).map((e) => ({
            id: e.id,
            title: e.title,
            event_date: e.event_date,
          })),
        })
      } finally {
        if (id === reqId.current) setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const q = query.trim()
  if (q.length < 2) return null

  const total =
    results.products.length +
    results.storefronts.length +
    results.listings.length +
    results.exchange.length +
    results.events.length

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
      {total === 0 ? (
        <div className="px-5 py-7 text-center text-sm text-[#75777f]">
          {loading ? "Searching…" : <>No results for &ldquo;{q}&rdquo;.</>}
        </div>
      ) : (
        <div className="py-2">
          {/* Group order is deliberate (Brooke, 8/11): directory listings
              first, then products, then storefronts — the directory is the
              platform's front door, so business listings outrank catalog
              hits in the federated dropdown. */}
          <Group label="Listings" seeAllHref={`/directory?q=${encodeURIComponent(q)}`} onNavigate={onNavigate} show={results.listings.length > 0}>
            {results.listings.map((l) => (
              <Row
                key={l.objectID}
                href={`/directory/${l.objectID}`}
                onNavigate={onNavigate}
                thumb={l.logo_url ?? undefined}
                icon="business"
                title={l.business_name}
                subtitle={[l.category_name, [l.city, l.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ") || undefined}
              />
            ))}
          </Group>

          <Group label="Products" seeAllHref={`/categories?q=${encodeURIComponent(q)}`} onNavigate={onNavigate} show={results.products.length > 0}>
            {results.products.map((p) => (
              <Row
                key={p.objectID}
                href={`/products/${p.handle}`}
                onNavigate={onNavigate}
                thumb={p.thumbnail ?? undefined}
                icon="inventory_2"
                title={p.title || "Product"}
                subtitle={p.brand?.name || p.store_name || undefined}
              />
            ))}
          </Group>

          <Group label="Storefronts" onNavigate={onNavigate} show={results.storefronts.length > 0}>
            {results.storefronts.map((s) => (
              <Row
                key={s.handle}
                href={`/sellers/${s.handle}`}
                onNavigate={onNavigate}
                icon="storefront"
                title={s.name}
                subtitle="Visit shop"
              />
            ))}
          </Group>

          <Group label="Sacred Exchange" seeAllHref={`/trade?q=${encodeURIComponent(q)}`} onNavigate={onNavigate} show={results.exchange.length > 0}>
            {results.exchange.map((x) => (
              <Row
                key={x.id}
                href={`/trade/${x.id}`}
                onNavigate={onNavigate}
                icon="swap_horiz"
                title={x.title}
                subtitle={[LISTING_TYPE_LABEL[x.listing_type] || x.listing_type, [x.city, x.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ") || undefined}
              />
            ))}
          </Group>

          <Group label="Events" seeAllHref={`/networking?q=${encodeURIComponent(q)}`} onNavigate={onNavigate} show={results.events.length > 0}>
            {results.events.map((e) => (
              <Row
                key={e.id}
                href={`/networking/${e.id}`}
                onNavigate={onNavigate}
                icon="event"
                title={e.title}
                subtitle={formatEventDate(e.event_date)}
              />
            ))}
          </Group>
        </div>
      )}
    </div>
  )
}

function Group({
  label,
  seeAllHref,
  onNavigate,
  show,
  children,
}: {
  label: string
  seeAllHref?: string
  onNavigate: () => void
  show: boolean
  children: React.ReactNode
}) {
  if (!show) return null
  return (
    <div className="border-b border-gray-100 last:border-b-0 py-1.5">
      <div className="flex items-center justify-between px-5 pt-1 pb-1">
        <span className="label-sm text-[10px] font-bold tracking-widest text-[#75777f] uppercase">
          {label}
        </span>
        {seeAllHref && (
          <LocalizedClientLink
            href={seeAllHref}
            onClick={onNavigate}
            className="text-[11px] font-semibold text-[#755b00] hover:underline"
          >
            See all
          </LocalizedClientLink>
        )}
      </div>
      {children}
    </div>
  )
}

function Row({
  href,
  onNavigate,
  thumb,
  icon,
  title,
  subtitle,
}: {
  href: string
  onNavigate: () => void
  thumb?: string
  icon: string
  title: string
  subtitle?: string
}) {
  return (
    <LocalizedClientLink
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 px-5 py-2 hover:bg-[#f4f4f0] transition-colors"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f4f4f0]">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-[20px] text-[#17294a]">{icon}</span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-[#17294a]">{title}</span>
        {subtitle && (
          <span className="block truncate text-[11px] text-[#75777f]">{subtitle}</span>
        )}
      </span>
    </LocalizedClientLink>
  )
}

function formatEventDate(iso: string): string | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}
