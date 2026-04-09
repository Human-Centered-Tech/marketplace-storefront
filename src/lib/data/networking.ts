"use server"

import { NetworkingEvent } from "@/types/networking"
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
