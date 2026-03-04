import { DirectoryCategory, DirectoryListing, Parish } from "@/types/directory"
import { sdk } from "../config"

export const listDirectoryListings = async (params?: {
  category_id?: string
  city?: string
  state?: string
  verification_status?: string
  subscription_tier?: string
  q?: string
  limit?: number
  offset?: number
}) => {
  return sdk.client
    .fetch<{
      listings: DirectoryListing[]
      count: number
      limit: number
      offset: number
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
