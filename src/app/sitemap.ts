import type { MetadataRoute } from "next"
import { listRegions } from "@/lib/data/regions"

const STATIC_PATHS = [
  { path: "/", priority: 1.0, changefreq: "daily" as const },
  { path: "/categories", priority: 0.9, changefreq: "daily" as const },
  { path: "/directory", priority: 0.9, changefreq: "daily" as const },
  { path: "/trade", priority: 0.7, changefreq: "daily" as const },
  { path: "/networking", priority: 0.7, changefreq: "weekly" as const },
  { path: "/sell", priority: 0.8, changefreq: "weekly" as const },
  { path: "/about", priority: 0.6, changefreq: "monthly" as const },
  { path: "/faq", priority: 0.5, changefreq: "monthly" as const },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" as const },
  { path: "/terms", priority: 0.3, changefreq: "yearly" as const },
]

/**
 * SIZE BUDGET — Google accepts at most 50,000 URLs / 50MB (uncompressed)
 * per sitemap file. Today we emit roughly:
 *
 *   static (10 × locales) + ~475 products + ~4,450 directory listings
 *   + a handful of trade listings  ≈  5,000 URLs / well under 1MB
 *
 * so a single flat sitemap is fine and we are ~10x under the limit.
 *
 * WHEN THE DIRECTORY GROWS PAST ~45,000 LISTINGS this file stops being
 * viable and /sitemap.xml has to become a sitemap INDEX. In Next.js that
 * means exporting `generateSitemaps()` (returning e.g. one id per entity
 * type, or chunks of 10-25k URLs) and taking `{ id }` in this function;
 * Next then serves /sitemap/[id].xml children plus an index. Do NOT simply
 * raise SITEMAP_URL_CAP — an oversized sitemap is rejected wholesale by
 * Google, which would put us right back where we were: zero product URLs.
 */
const SITEMAP_URL_CAP = 45000

const PRODUCT_PAGE_SIZE = 100
const DIRECTORY_PAGE_SIZE = 200
const BARTER_PAGE_SIZE = 200
/** Belt-and-braces stop so a bad `count` can never spin forever at build time. */
const MAX_PAGES = 500

function backendConfig() {
  const backend =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    process.env.MEDUSA_BACKEND_URL ||
    "http://localhost:9000"
  const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
  return { backend, key }
}

/**
 * Page through a Medusa store list endpoint with raw `fetch`.
 *
 * Deliberately NOT the `listProducts()` / `listX()` server actions. Those live
 * in `"use server"` modules that call `getAuthHeaders()` -> `cookies()`, and
 * `cookies()` throws a DynamicServerError while this sitemap is being
 * statically rendered. That throw — swallowed by a bare `catch {}` — is what
 * silently emptied the product block of this sitemap for months. Raw fetch +
 * the publishable key has no request-scoped dependency, so it cannot fail
 * that way. Every caller below LOGS its failure; never swallow silently.
 */
async function fetchAllPages<T>(
  /** Absolute URL, already carrying any non-paging query string. */
  url: string,
  itemsKey: string,
  pageSize: number,
  label: string
): Promise<T[]> {
  const { key } = backendConfig()
  const sep = url.includes("?") ? "&" : "?"
  const out: T[] = []
  let offset = 0

  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await fetch(`${url}${sep}limit=${pageSize}&offset=${offset}`, {
      headers: { "x-publishable-api-key": key },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(
        `${label} returned ${res.status} ${res.statusText} at offset ${offset}`
      )
    }

    const body = (await res.json()) as Record<string, any>
    const items = (body?.[itemsKey] as T[]) ?? []
    out.push(...items)

    const count = typeof body?.count === "number" ? body.count : out.length
    offset += pageSize

    if (
      items.length < pageSize ||
      offset >= count ||
      out.length >= SITEMAP_URL_CAP
    ) {
      break
    }
  }

  return out
}

/**
 * Dynamic sitemap covering:
 *  - static pages (home, marketplace, directory, sell, content)
 *  - one entry per locale (from configured regions) for each static path
 *  - product detail pages (Mercur)
 *  - directory listing detail pages
 *  - barter listing detail pages
 *  - vendor storefront pages
 *
 * Registry share links are intentionally excluded (they're sharable
 * tokens — not meant to be crawled).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://catholicowned.com"
  ).replace(/\/$/, "")

  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  // Locales we know about (keeps the sitemap per-locale). Fall back to
  // "us" if region lookup fails so we still publish something.
  let locales: string[] = []
  try {
    const regions = await listRegions()
    locales = Array.from(
      new Set(
        (regions || [])
          .flatMap((r: any) => r.countries || [])
          .map((c: any) => c.iso_2)
          .filter(Boolean)
      )
    ) as string[]
  } catch (err) {
    console.error("[sitemap] region lookup failed, falling back to 'us':", err)
  }
  if (!locales.length) locales = ["us"]

  // Static pages × locales
  for (const locale of locales) {
    for (const p of STATIC_PATHS) {
      entries.push({
        url: `${base}/${locale}${p.path === "/" ? "" : p.path}`,
        lastModified: now,
        changeFrequency: p.changefreq,
        priority: p.priority,
      })
    }
  }

  // Products — every product a shopper can actually reach, paged.
  try {
    const { backend } = backendConfig()
    const products = await fetchAllPages<{
      handle?: string | null
      updated_at?: string | null
      seller?: { store_status?: string | null } | null
    }>(
      `${backend}/store/products?fields=handle,updated_at,seller.store_status`,
      "products",
      PRODUCT_PAGE_SIZE,
      "GET /store/products"
    )

    // Only ACTIVE stores are visible to shoppers — INACTIVE is draft mode
    // (vendor hasn't paid / hit Go Live) and SUSPENDED is admin-blocked.
    // Their PDPs render "not found", so listing them here would just feed
    // Google soft-404s. This mirrors the filter in listProducts().
    const visible = products.filter(
      (p) => p.handle && p.seller?.store_status === "ACTIVE"
    )

    if (!visible.length) {
      console.error(
        `[sitemap] product block produced 0 URLs (fetched ${products.length} rows) — the sitemap will have no crawl path to any product page`
      )
    }

    for (const locale of locales) {
      for (const prod of visible) {
        entries.push({
          url: `${base}/${locale}/products/${prod.handle}`,
          lastModified: prod.updated_at ? new Date(prod.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.8,
        })
      }
    }
  } catch (err) {
    // Fail soft — ship the rest of the sitemap — but never silently.
    console.error(
      "[sitemap] product listing failed; sitemap will ship WITHOUT product URLs:",
      err
    )
  }

  // Directory listings — paged; there are thousands, one page never covers it.
  try {
    const { backend } = backendConfig()
    const listings = await fetchAllPages<{
      id?: string | null
      updated_at?: string | null
    }>(
      `${backend}/store/directory/listings`,
      "listings",
      DIRECTORY_PAGE_SIZE,
      "GET /store/directory/listings"
    )

    if (!listings.length) {
      console.error("[sitemap] directory block produced 0 URLs")
    }

    for (const locale of locales) {
      for (const listing of listings) {
        if (!listing.id) continue
        entries.push({
          url: `${base}/${locale}/directory/${listing.id}`,
          lastModified: listing.updated_at
            ? new Date(listing.updated_at)
            : now,
          changeFrequency: "weekly",
          priority: 0.7,
        })
      }
    }
  } catch (err) {
    console.error(
      "[sitemap] directory listing failed; sitemap will ship WITHOUT directory URLs:",
      err
    )
  }

  // Barter listings
  try {
    const { backend } = backendConfig()
    const listings = await fetchAllPages<{
      id?: string | null
      updated_at?: string | null
    }>(
      `${backend}/store/barter/listings`,
      "listings",
      BARTER_PAGE_SIZE,
      "GET /store/barter/listings"
    )

    for (const locale of locales) {
      for (const listing of listings) {
        if (!listing.id) continue
        entries.push({
          url: `${base}/${locale}/trade/${listing.id}`,
          lastModified: listing.updated_at
            ? new Date(listing.updated_at)
            : now,
          changeFrequency: "weekly",
          priority: 0.5,
        })
      }
    }
  } catch (err) {
    console.error(
      "[sitemap] barter listing failed; sitemap will ship WITHOUT trade URLs:",
      err
    )
  }

  if (entries.length > SITEMAP_URL_CAP) {
    // See the SIZE BUDGET note at the top of this file: this is the point at
    // which /sitemap.xml must be split into a sitemap index.
    console.error(
      `[sitemap] ${entries.length} URLs exceeds the ${SITEMAP_URL_CAP} soft cap — split this into a sitemap index before it reaches Google's 50,000 limit`
    )
  }

  return entries
}
