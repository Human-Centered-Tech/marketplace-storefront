import { HttpTypes } from "@medusajs/types"
import { Parish } from "@/types/directory"
import { DirectoryListing } from "@/types/directory"
import { BarterListing } from "@/types/barter"

/**
 * Public (unauthenticated) data helpers for parish pages. Membership
 * mutations live in parish-actions.ts (server actions — they need the
 * httpOnly auth cookie).
 */

const backendUrl = () =>
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const publishableKey = () =>
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export type ParishFeedData = {
  parish: Parish
  listings: DirectoryListing[]
  product_ids: string[]
  barter_listings: BarterListing[]
}

export async function getParishFeed(
  parishId: string
): Promise<ParishFeedData | null> {
  try {
    const res = await fetch(
      `${backendUrl()}/store/directory/parishes/${parishId}/feed`,
      {
        headers: { "x-publishable-api-key": publishableKey() },
        next: { revalidate: 60, tags: ["parish-feed"] },
      }
    )
    if (!res.ok) return null
    return (await res.json()) as ParishFeedData
  } catch {
    return null
  }
}

export async function getParish(parishId: string): Promise<Parish | null> {
  try {
    const res = await fetch(
      `${backendUrl()}/store/directory/parishes/${parishId}`,
      {
        headers: { "x-publishable-api-key": publishableKey() },
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return (data.parish as Parish) ?? null
  } catch {
    return null
  }
}

// Same explicit-id product fetch as the homepage featured section: the SDK
// serializes id arrays as CSV, but /store/products only accepts repeated
// `id[]=` params — so build the query by hand (see HomeFeaturedProducts).
const PRODUCT_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,*seller,*variants"

export async function fetchProductsByIds(
  ids: string[],
  regionId: string,
  countryCode: string
): Promise<HttpTypes.StoreProduct[]> {
  if (!ids.length) return []
  const params = new URLSearchParams()
  params.set("country_code", countryCode)
  params.set("region_id", regionId)
  params.set("limit", String(ids.length))
  params.set("fields", PRODUCT_FIELDS)
  for (const id of ids) params.append("id[]", id)

  try {
    const res = await fetch(
      `${backendUrl()}/store/products?${params.toString()}`,
      {
        headers: { "x-publishable-api-key": publishableKey() },
        next: { revalidate: 60, tags: ["parish-feed"] },
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.products || []) as HttpTypes.StoreProduct[]
  } catch {
    return []
  }
}
