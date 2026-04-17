"use server"

import {
  NetworkingContactExchange,
  NetworkingEvent,
  NetworkingRSVP,
  NetworkingSubscription,
} from "@/types/networking"
import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"

export const listNetworkingEvents = async (params?: {
  status?: string
  limit?: number
  offset?: number
}) => {
  return sdk.client
    .fetch<{
      events: NetworkingEvent[]
      count: number
    }>("/store/networking/events", {
      query: params as Record<string, string | number>,
      cache: "no-cache",
    })
    .catch(() => ({ events: [], count: 0 }))
}

export const getNetworkingEvent = async (id: string) => {
  // Single-event endpoint may not exist; fall back to listing and filtering
  try {
    const { event } = await sdk.client.fetch<{ event: NetworkingEvent }>(
      `/store/networking/events/${id}`,
      { cache: "no-cache" }
    )
    return event
  } catch {
    // Fallback: fetch all and find by id
    const { events } = await listNetworkingEvents()
    return events.find((e) => e.id === id) ?? null
  }
}

export const rsvpToEvent = async (eventId: string) => {
  const BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const authHeaders = await getAuthHeaders()
  const hasAuth = "authorization" in authHeaders

  if (!hasAuth) {
    return { ok: false, error: "SIGN_IN_REQUIRED" }
  }

  const headers = {
    ...authHeaders,
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  const res = await fetch(
    `${BACKEND_URL}/store/networking/events/${eventId}/rsvp`,
    {
      method: "POST",
      headers,
    }
  )

  if (!res.ok) {
    if (res.status === 401) {
      return {
        ok: false,
        error:
          "Your account is not linked to a customer profile. Please log out and register as a new customer, or contact support.",
      }
    }
    const data = await res.json().catch(() => ({}))
    return { ok: false, error: data.message || "Failed to RSVP" }
  }

  return { ok: true, error: null }
}

// --- User dashboard helpers -------------------------------------------

async function authedBackendFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T | null> {
  const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const authHeaders = await getAuthHeaders()
  if (!("authorization" in authHeaders)) return null

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
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export const getMyNetworkingDashboard = async () => {
  return authedBackendFetch<{
    subscription: NetworkingSubscription | null
    rsvps: NetworkingRSVP[]
    contacts: NetworkingContactExchange[]
  }>("/store/networking/me")
}

export const respondToContactExchange = async (
  contactId: string,
  consent: boolean
) => {
  const data = await authedBackendFetch<{
    contact_exchange: NetworkingContactExchange
  }>(`/store/networking/contacts/${contactId}/consent`, {
    method: "PUT",
    body: JSON.stringify({ consent }),
  })
  return data?.contact_exchange || null
}

export const subscribeToNetworking = async (plan: "monthly" | "annual") => {
  const data = await authedBackendFetch<{
    subscription?: NetworkingSubscription
    checkout_url?: string
    message?: string
  }>("/store/networking/subscriptions", {
    method: "POST",
    body: JSON.stringify({ plan }),
  })
  return data
}

export const cancelNetworkingSubscription = async (id: string) => {
  return authedBackendFetch<{ ok: true }>(
    `/store/networking/subscriptions/${id}`,
    { method: "DELETE" }
  )
}
