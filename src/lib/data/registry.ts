"use server"

import { GiftRegistry } from "@/types/registry"
import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string

async function authedFetch<T>(
  path: string,
  options?: { method?: string; body?: unknown }
): Promise<T> {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: options?.method || "GET",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
      "x-publishable-api-key": API_KEY,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
    cache: "no-cache",
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const listMyRegistries = async () => {
  try {
    return await authedFetch<{ registries: GiftRegistry[]; count: number }>(
      "/store/registry/me"
    )
  } catch {
    return { registries: [], count: 0 }
  }
}

export const getRegistry = async (id: string) => {
  try {
    const { registry } = await authedFetch<{ registry: GiftRegistry }>(
      `/store/registry/${id}`
    )
    return registry
  } catch (err) {
    console.error("[getRegistry] failed for id:", id, err)
    // Fallback: try fetching from /me and filtering
    try {
      const { registries } = await authedFetch<{
        registries: GiftRegistry[]
      }>("/store/registry/me")
      return registries.find((r) => r.id === id) ?? null
    } catch {
      return null
    }
  }
}

export const createRegistry = async (body: {
  title: string
  description?: string | null
  sacrament_type: string
  event_date?: string | null
}) => {
  const { registry } = await authedFetch<{ registry: GiftRegistry }>(
    "/store/registry",
    { method: "POST", body }
  )
  return registry
}

export const updateRegistry = async (
  id: string,
  body: Record<string, unknown>
) => {
  const { registry } = await authedFetch<{ registry: GiftRegistry }>(
    `/store/registry/${id}`,
    { method: "PUT", body }
  )
  return registry
}

export const deleteRegistry = async (id: string) => {
  try {
    await authedFetch<void>(`/store/registry/${id}`, { method: "DELETE" })
    return true
  } catch {
    return false
  }
}

export const addRegistryItem = async (
  registryId: string,
  body: {
    product_id?: string
    product_title: string
    product_image?: string | null
    quantity_desired: number
    note?: string | null
  }
) => {
  const { item } = await authedFetch<{ item: GiftRegistry["items"][0] }>(
    `/store/registry/${registryId}/items`,
    { method: "POST", body }
  )
  return item
}

export const deleteRegistryItem = async (
  registryId: string,
  itemId: string
) => {
  try {
    await authedFetch<void>(`/store/registry/${registryId}/items/${itemId}`, {
      method: "DELETE",
    })
    return true
  } catch {
    return false
  }
}

export const getSharedRegistry = async (token: string) => {
  return sdk.client
    .fetch<{ registry: GiftRegistry }>(`/store/registry/share/${token}`, {
      cache: "no-cache",
    })
    .then(({ registry }) => registry)
    .catch(() => null)
}

export const markItemPurchased = async (
  token: string,
  itemId: string,
  quantity?: number
) => {
  return sdk.client
    .fetch<{ item: GiftRegistry["items"][0] }>(
      `/store/registry/share/${token}`,
      {
        method: "POST",
        body: { item_id: itemId, quantity: quantity ?? 1 },
        cache: "no-cache",
      }
    )
    .then(({ item }) => item)
}
