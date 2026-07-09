import { DirectoryCategory, DirectoryListing, Parish } from "@/types/directory"
import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"

export const listFeaturedListings = async () => {
  return sdk.client
    .fetch<{ featured_listings: DirectoryListing[]; count: number }>(
      "/store/featured-listings",
      { cache: "no-cache" }
    )
    .then((d) => d.featured_listings || [])
    .catch(() => [] as DirectoryListing[])
}

export const listDirectoryListings = async (params?: {
  category_id?: string
  city?: string
  state?: string
  verification_status?: string
  subscription_tier?: string
  q?: string
  limit?: number
  offset?: number
  near_lat?: number
  near_lon?: number
  radius_km?: number
}) => {
  return sdk.client
    .fetch<{
      listings: DirectoryListing[]
      count: number
      limit: number
      offset: number
      filtered_by_proximity?: boolean
      radius_km?: number
    }>("/store/directory/listings", {
      query: params as Record<string, string | number>,
      cache: "no-cache",
    })
    .catch(() => ({ listings: [], count: 0, limit: 20, offset: 0 }))
}

// Public claim status (claim-flow rebuild 7/7): whether a claim is already
// in progress on an unclaimed listing. Sent with auth headers so `mine` is
// populated for the claimant themselves (their own pending claim isn't a
// block — they get a resume link instead).
export const getDirectoryClaimStatus = async (id: string) => {
  const authHeaders = await getAuthHeaders()
  return sdk.client
    .fetch<{
      claimable: boolean
      claim_pending: boolean
      claimed: boolean
      mine?: boolean
    }>(`/store/directory/listings/${id}/claim`, {
      cache: "no-cache",
      headers: { ...(authHeaders as Record<string, string>) },
    })
    .catch(() => null)
}

export const getDirectoryListing = async (id: string) => {
  return sdk.client
    .fetch<{ listing: DirectoryListing }>(`/store/directory/listings/${id}`, {
      cache: "no-cache",
    })
    .then(({ listing }) => listing)
    .catch(() => null)
}

export const listDirectoryCategories = async () => {
  return sdk.client
    .fetch<{ categories: DirectoryCategory[] }>(
      "/store/directory/categories",
      {
        cache: "no-cache",
      }
    )
    .then(({ categories }) => categories)
    .catch(() => [])
}

export const listParishes = async (params?: {
  q?: string
  state?: string
  diocese?: string
}) => {
  return sdk.client
    .fetch<{ parishes: Parish[] }>("/store/directory/parishes", {
      query: params as Record<string, string | number>,
      cache: "no-cache",
    })
    .then(({ parishes }) => parishes)
    .catch(() => [])
}
