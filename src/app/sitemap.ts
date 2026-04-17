import type { MetadataRoute } from "next"
import { listProducts } from "@/lib/data/products"
import { listRegions } from "@/lib/data/regions"

const STATIC_PATHS = [
  { path: "/", priority: 1.0, changefreq: "daily" as const },
  { path: "/categories", priority: 0.9, changefreq: "daily" as const },
  { path: "/directory", priority: 0.9, changefreq: "daily" as const },
  { path: "/barter", priority: 0.7, changefreq: "daily" as const },
  { path: "/networking", priority: 0.7, changefreq: "weekly" as const },
  { path: "/sell", priority: 0.8, changefreq: "weekly" as const },
  { path: "/for-business", priority: 0.8, changefreq: "weekly" as const },
  { path: "/about", priority: 0.6, changefreq: "monthly" as const },
  { path: "/faq", priority: 0.5, changefreq: "monthly" as const },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" as const },
  { path: "/terms", priority: 0.3, changefreq: "yearly" as const },
]

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
  } catch {
    // ignore
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

  // Products — cap to a reasonable window for sitemap size
  try {
    for (const locale of locales) {
      const { response } = await listProducts({
        countryCode: locale,
        queryParams: { limit: 1000, fields: "handle,updated_at" },
        forceCache: false,
      })
      for (const prod of response.products || []) {
        if (!prod.handle) continue
        entries.push({
          url: `${base}/${locale}/products/${prod.handle}`,
          lastModified: prod.updated_at ? new Date(prod.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.8,
        })
      }
    }
  } catch {
    // product listing failed — ship static entries at minimum
  }

  // Directory listings
  try {
    const backend =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
    const res = await fetch(
      `${backend}/store/directory/listings?limit=1000`,
      {
        headers: { "x-publishable-api-key": key },
        next: { revalidate: 3600 },
      }
    )
    if (res.ok) {
      const { listings } = (await res.json()) as { listings: any[] }
      for (const locale of locales) {
        for (const listing of listings || []) {
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
    }
  } catch {
    // ignore
  }

  // Barter listings
  try {
    const backend =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
    const res = await fetch(
      `${backend}/store/barter/listings?limit=500`,
      {
        headers: { "x-publishable-api-key": key },
        next: { revalidate: 3600 },
      }
    )
    if (res.ok) {
      const { listings } = (await res.json()) as { listings: any[] }
      for (const locale of locales) {
        for (const listing of listings || []) {
          entries.push({
            url: `${base}/${locale}/barter/${listing.id}`,
            lastModified: listing.updated_at
              ? new Date(listing.updated_at)
              : now,
            changeFrequency: "weekly",
            priority: 0.5,
          })
        }
      }
    }
  } catch {
    // ignore
  }

  return entries
}
