"use server"

import { SellerProps } from "@/types/seller"
import { sdk } from "../config"
import medusaError from "../helpers/medusa-error"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const retrieveOrderSet = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<any>(`/store/order-set/${id}`, {
      method: "GET",
      headers,
      cache: "no-cache",
    })
    .then(({ order_set }) => order_set)
    .catch((err) => medusaError(err))
}

export type OrderTrackingCheckpoint = {
  at: string | null
  status: string | null
  label: string | null
  message: string | null
  location: string | null
}

export type OrderTracking = {
  id: string
  tracking_number: string
  carrier: string | null
  tracking_url: string | null
  status: string
  status_label: string
  status_detail: string | null
  last_checkpoint_message: string | null
  last_checkpoint_location: string | null
  last_checkpoint_at: string | null
  expected_delivery_at: string | null
  delivered_at: string | null
  checkpoints: OrderTrackingCheckpoint[]
  live: boolean
  updated_at: string | null
}

/**
 * Live carrier status for one order's parcels.
 *
 * FAILS SOFT BY DESIGN — returns [] on any error instead of throwing like the
 * other order fetchers. This is a decorative enhancement on the order page: if
 * the tracking provider, the route or the network is having a bad day, the
 * buyer should still see their order, with the carrier deep-link that has
 * worked since before live tracking existed.
 *
 * Never cached: the whole point is that it changes between page loads.
 */
export const retrieveOrderTracking = async (
  orderId: string
): Promise<OrderTracking[]> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const res = await sdk.client.fetch<{ tracking: OrderTracking[] }>(
      `/store/orders/${orderId}/tracking`,
      {
        method: "GET",
        headers,
        cache: "no-cache",
      }
    )
    return res?.tracking || []
  } catch {
    return []
  }
}

export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse & { seller: SellerProps }>(
      `/store/orders/${id}`,
      {
        method: "GET",
        query: {
          fields:
            "*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product,*items.product.images,*seller,*order_set",
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
}

export const createReturnRequest = async (data: any) => {
  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  const response = await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/store/return-request`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    }
  )
    .then(async (res) => await res.json())
    .catch((err) => medusaError(err))

  return response
}

export const getReturns = async () => {
  const headers = await getAuthHeaders()

  return sdk.client
    .fetch<{
      order_return_requests: Array<any>
    }>(`/store/return-request`, {
      method: "GET",
      headers,
      cache: "force-cache",
      query: { fields: "*line_items.reason_id" },
    })
    .then((res) => res)
    .catch((err) => medusaError(err))
}

export const retriveReturnMethods = async (order_id: string) => {
  const headers = await getAuthHeaders()

  return sdk.client
    .fetch<{
      shipping_options: Array<any>
    }>(`/store/shipping-options/return?order_id=${order_id}`, {
      method: "GET",
      headers,
      cache: "no-cache",
    })
    .then(({ shipping_options }) => shipping_options)
    .catch(() => [])
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<{
      orders: Array<
        HttpTypes.StoreOrder & {
          seller: { id: string; name: string; reviews?: any[] }
          reviews: any[]
        }
      >
    }>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        order: "-created_at",
        fields:
          // *reviews.product / *reviews.seller (7/28): `*reviews` alone returns
          // the review's own columns but not what it points AT, so there was no
          // way to tell which line item a review belonged to — which is why the
          // account Reviews page could only ever offer one review per order.
          "id,display_id,currency_code,status,*items,+items.metadata,*items.variant,*items.product,*items.product.images,*seller,*reviews,*reviews.product,*reviews.seller,*order_set,shipping_total,total,created_at",
        ...filters,
      },
      headers,
      next,
      cache: "no-cache",
    })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
}

export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Order ID is required", order: null }
  }

  const headers = await getAuthHeaders()

  return await sdk.store.order
    .requestTransfer(
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .acceptTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .declineTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const retrieveReturnReasons = async () => {
  const headers = await getAuthHeaders()

  return sdk.client
    .fetch<{
      return_reasons: Array<HttpTypes.StoreReturnReason>
    }>(`/store/return-reasons`, {
      method: "GET",
      headers,
      cache: "force-cache",
    })
    .then(({ return_reasons }) => return_reasons)
    .catch((err) => medusaError(err))
}
