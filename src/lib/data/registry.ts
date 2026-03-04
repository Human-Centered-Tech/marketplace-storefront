import { GiftRegistry } from "@/types/registry"
import { sdk } from "../config"

export const listMyRegistries = async () => {
  return sdk.client
    .fetch<{
      registries: GiftRegistry[]
      count: number
    }>("/store/registry/me", {
      cache: "no-cache",
    })
    .catch(() => ({ registries: [], count: 0 }))
}

export const getRegistry = async (id: string) => {
  return sdk.client
    .fetch<{ registry: GiftRegistry }>(`/store/registry/${id}`, {
      cache: "no-cache",
    })
    .then(({ registry }) => registry)
    .catch(() => null)
}

export const createRegistry = async (
  body: Partial<
    Pick<
      GiftRegistry,
      "title" | "description" | "sacrament_type" | "event_date" | "cover_image_url"
    >
  >
) => {
  return sdk.client
    .fetch<{ registry: GiftRegistry }>("/store/registry", {
      method: "POST",
      body,
      cache: "no-cache",
    })
    .then(({ registry }) => registry)
}

export const updateRegistry = async (
  id: string,
  body: Partial<
    Pick<
      GiftRegistry,
      "title" | "description" | "sacrament_type" | "event_date" | "status" | "cover_image_url"
    >
  >
) => {
  return sdk.client
    .fetch<{ registry: GiftRegistry }>(`/store/registry/${id}`, {
      method: "PUT",
      body,
      cache: "no-cache",
    })
    .then(({ registry }) => registry)
}

export const deleteRegistry = async (id: string) => {
  return sdk.client
    .fetch<void>(`/store/registry/${id}`, {
      method: "DELETE",
      cache: "no-cache",
    })
    .catch(() => null)
}

export const addRegistryItem = async (
  registryId: string,
  body: {
    product_id?: string
    variant_id?: string | null
    product_title: string
    product_image?: string | null
    quantity_desired: number
    priority?: number
    note?: string | null
  }
) => {
  return sdk.client
    .fetch<{ item: GiftRegistry["items"][0] }>(
      `/store/registry/${registryId}/items`,
      {
        method: "POST",
        body,
        cache: "no-cache",
      }
    )
    .then(({ item }) => item)
}

export const updateRegistryItem = async (
  registryId: string,
  itemId: string,
  body: {
    quantity_desired?: number
    priority?: number
    note?: string | null
  }
) => {
  return sdk.client
    .fetch<{ item: GiftRegistry["items"][0] }>(
      `/store/registry/${registryId}/items/${itemId}`,
      {
        method: "PUT",
        body,
        cache: "no-cache",
      }
    )
    .then(({ item }) => item)
}

export const deleteRegistryItem = async (
  registryId: string,
  itemId: string
) => {
  return sdk.client
    .fetch<void>(`/store/registry/${registryId}/items/${itemId}`, {
      method: "DELETE",
      cache: "no-cache",
    })
    .catch(() => null)
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
