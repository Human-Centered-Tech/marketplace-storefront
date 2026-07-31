import { DirectoryCategory, DirectoryListing, Parish } from "@/types/directory"
import { sdk } from "../config"

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

/**
 * One customer review on a directory listing (7/28).
 *
 * `author_name` is already collapsed to "First L." by the backend — the raw
 * last name never leaves the server on this public endpoint, so there's nothing
 * to truncate here. `customer_id` is present so a signed-in viewer can find
 * their own review and get the edit/delete affordance.
 */
export type ListingReview = {
  id: string
  rating: number
  customer_note: string | null
  seller_note: string | null
  created_at: string
  updated_at: string
  author_name: string
  customer_id: string | null
}

/**
 * Public, unauthenticated read — safe to live in this file, which gets pulled
 * into client bundles through the sections barrel. WRITES need auth headers and
 * therefore live in lib/data/reviews.ts ("use server"); importing getAuthHeaders
 * here would break the build. See the note in directory/[id]/page.tsx.
 */
export const listListingReviews = async (
  listingId: string,
  params?: { limit?: number; offset?: number }
) => {
  return sdk.client
    .fetch<{
      reviews: ListingReview[]
      rating: number | null
      review_count: number
      count: number
      limit: number
      offset: number
    }>(`/store/directory/listings/${listingId}/reviews`, {
      query: params as Record<string, string | number>,
      cache: "no-cache",
    })
    .catch(() => ({
      reviews: [] as ListingReview[],
      rating: null,
      review_count: 0,
      count: 0,
      limit: params?.limit ?? 10,
      offset: params?.offset ?? 0,
    }))
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
