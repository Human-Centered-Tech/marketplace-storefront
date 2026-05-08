/**
 * Gift guide data layer. Backed by the gift-guide custom Medusa module
 * (see marketplace-backend/src/modules/gift-guide). Admins manage guides
 * in the Medusa admin UI; this file just fetches them.
 *
 * Same exported function names + types as the previous static implementation,
 * but they're now async — callers must `await`.
 */

export type GiftGuide = {
  id?: string
  slug: string
  title: string
  subtitle: string
  lede: string
  hero_image: string
  tags: string[]
  category_handle?: string
  sort_order: number
  featured?: boolean
  active_from?: string | null
  active_until?: string | null
}

const REVALIDATE_SECONDS = 60

function backendUrl() {
  return process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
}

function publishableKey() {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
}

async function fetchGuides(query: Record<string, string> = {}): Promise<GiftGuide[]> {
  const params = new URLSearchParams(query).toString()
  const url = `${backendUrl()}/store/gift-guides${params ? `?${params}` : ""}`
  try {
    const res = await fetch(url, {
      headers: { "x-publishable-api-key": publishableKey() },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["gift-guides"] },
    })
    if (!res.ok) {
      console.error(`[gift-guides] list failed: ${res.status}`)
      return []
    }
    const data = await res.json()
    return data.gift_guides || []
  } catch (e) {
    console.error("[gift-guides] list error:", e)
    return []
  }
}

export async function listActiveGiftGuides(): Promise<GiftGuide[]> {
  return fetchGuides()
}

export async function listFeaturedGiftGuides(): Promise<GiftGuide[]> {
  return fetchGuides({ featured: "true" })
}

export async function getGiftGuide(slug: string): Promise<GiftGuide | null> {
  try {
    const res = await fetch(`${backendUrl()}/store/gift-guides/${slug}`, {
      headers: { "x-publishable-api-key": publishableKey() },
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ["gift-guides", `gift-guide:${slug}`],
      },
    })
    if (!res.ok) {
      if (res.status !== 404) {
        console.error(`[gift-guides] retrieve "${slug}" failed: ${res.status}`)
      }
      return null
    }
    const data = await res.json()
    return data.gift_guide || null
  } catch (e) {
    console.error(`[gift-guides] retrieve "${slug}" error:`, e)
    return null
  }
}
