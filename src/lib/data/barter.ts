"use server"

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

// --- Authenticated helpers for create + image upload ---------------------

import { getAuthHeaders } from "./cookies"

async function authedFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; data: T | null; error: string | null }> {
  const BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const authHeaders = await getAuthHeaders()
  if (!("authorization" in authHeaders)) {
    return { ok: false, data: null, error: "Not authenticated" }
  }

  const headers = {
    ...authHeaders,
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
    ...(init.headers || {}),
  }

  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return {
        ok: false,
        data: null,
        error: body?.message || `HTTP ${res.status}`,
      }
    }
    return { ok: true, data: (await res.json()) as T, error: null }
  } catch (err: any) {
    return { ok: false, data: null, error: err?.message || "Network error" }
  }
}

export const createBarterListing = async (body: Record<string, unknown>) => {
  return authedFetch<{ listing: BarterListing }>("/store/barter/listings", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export const uploadBarterImage = async (
  listingId: string,
  dataUrl: string,
  sortOrder?: number
) => {
  return authedFetch<{ image: { id: string; url: string; sort_order: number } }>(
    `/store/barter/listings/${listingId}/images`,
    {
      method: "POST",
      body: JSON.stringify({
        data_url: dataUrl,
        sort_order: sortOrder,
      }),
    }
  )
}

export const deleteBarterImage = async (listingId: string, imageId: string) => {
  return authedFetch<{ id: string; deleted: boolean }>(
    `/store/barter/listings/${listingId}/images/${imageId}`,
    {
      method: "DELETE",
      body: JSON.stringify({ image_id: imageId }),
    }
  )
}

export const listMyBarterListings = async () => {
  return authedFetch<{ listings: BarterListing[]; count: number }>(
    "/store/barter/me"
  )
}

export const updateBarterListing = async (
  id: string,
  body: Record<string, unknown>
) => {
  return authedFetch<{ listing: BarterListing }>(
    `/store/barter/listings/${id}`,
    { method: "PUT", body: JSON.stringify(body) }
  )
}

export const renewBarterListing = async (id: string) => {
  return authedFetch<{ listing: BarterListing }>(
    `/store/barter/listings/${id}/renew`,
    { method: "POST" }
  )
}
