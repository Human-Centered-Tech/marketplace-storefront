"use server"

import { DirectoryListing } from "@/types/directory"
import { getAuthHeaders } from "./cookies"

/**
 * Authenticated server-action helpers for directory operations that
 * require a logged-in customer.
 *
 * Why server actions instead of client-side fetch: the customer auth
 * token is in an `httpOnly` cookie on the storefront domain, not
 * accessible from JS. Client-side `fetch` with `credentials: "include"`
 * doesn't help because the backend is on a different origin
 * (cross-domain cookies aren't sent). Server actions read the cookie
 * via `next/headers` and forward it as `Authorization: Bearer <token>`.
 */

async function authedBackendFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const authHeaders = await getAuthHeaders()
  if (!("authorization" in authHeaders)) {
    return { ok: false, error: "Not signed in" }
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
      let message = `Request failed (${res.status})`
      try {
        const body = await res.json()
        if (body?.message) message = body.message
      } catch {
        // Non-JSON error body — keep the status-derived message.
      }
      return { ok: false, error: message }
    }
    const data = (await res.json()) as T
    return { ok: true, data }
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" }
  }
}

export async function createDirectoryListing(
  payload: Record<string, unknown>
): Promise<{ ok: true; listing: DirectoryListing } | { ok: false; error: string }> {
  const res = await authedBackendFetch<{ listing: DirectoryListing }>(
    "/store/directory/listings",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
  if (!res.ok) return res
  return { ok: true, listing: res.data.listing }
}

export async function updateDirectoryListing(
  id: string,
  payload: Record<string, unknown>
): Promise<{ ok: true; listing: DirectoryListing } | { ok: false; error: string }> {
  const res = await authedBackendFetch<{ listing: DirectoryListing }>(
    `/store/directory/listings/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  )
  if (!res.ok) return res
  return { ok: true, listing: res.data.listing }
}

export async function getMyDirectoryListing(): Promise<DirectoryListing | null> {
  // /store/directory/listings/me returns the authed customer's own listing
  // regardless of verification/subscription status. The plain
  // /store/directory/listings endpoint hides not-yet-active listings for
  // public-visibility reasons, which is the wrong filter when the vendor
  // is loading their OWN listing during checkout.
  const res = await authedBackendFetch<{ listing: DirectoryListing | null }>(
    "/store/directory/listings/me"
  )
  if (!res.ok) return null
  return res.data.listing ?? null
}

export async function createDirectorySubscriptionCheckout(payload: {
  listing_id: string
  tier: string
  success_url?: string
  cancel_url?: string
}): Promise<{ ok: true; checkout_url: string } | { ok: false; error: string }> {
  const res = await authedBackendFetch<{ checkout_url: string }>(
    "/store/directory/subscriptions",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
  if (!res.ok) return res
  return { ok: true, checkout_url: res.data.checkout_url }
}
