import { BarterListing, BarterCategory } from "@/types/barter"
import { sdk } from "../config"

export const listBarterListings = async (params?: {
  category_id?: string
  listing_type?: string
  condition?: string
  q?: string
  limit?: number
  offset?: number
}) => {
  return sdk.client
    .fetch<{
      listings: BarterListing[]
      count: number
      limit: number
      offset: number
    }>("/store/barter/listings", {
      query: params as Record<string, string | number>,
      cache: "no-cache",
    })
    .catch(() => ({ listings: [], count: 0, limit: 20, offset: 0 }))
}

export const getBarterListing = async (id: string) => {
  return sdk.client
    .fetch<{ listing: BarterListing }>(`/store/barter/listings/${id}`, {
      cache: "no-cache",
    })
    .then(({ listing }) => listing)
    .catch(() => null)
}

export const listBarterCategories = async () => {
  return sdk.client
    .fetch<{ categories: BarterCategory[] }>("/store/barter/categories", {
      cache: "no-cache",
    })
    .then(({ categories }) => categories)
    .catch(() => [])
}
