"use server"

import { DirectoryListing, DirectoryParishAffiliation } from "@/types/directory"
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

/**
 * Upload a directory image (logo / cover / owner photo / devotional) for the
 * logged-in customer. Reads the file server-side, base64-encodes it, and
 * posts JSON to the customer-authed backend route, which writes it to MinIO
 * and returns a public URL. Called from the listing editor's image fields.
 */
export async function uploadDirectoryImage(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided" }
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "Image exceeds the 10MB limit" }
  }

  const data_base64 = Buffer.from(await file.arrayBuffer()).toString("base64")

  const res = await authedBackendFetch<{ url: string }>(
    "/store/directory/uploads",
    {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        content_type: file.type,
        data_base64,
      }),
    }
  )
  if (!res.ok) return res
  return { ok: true, url: res.data.url }
}

export async function getMyDirectoryListing(): Promise<{
  authenticated: boolean
  listing: DirectoryListing | null
}> {
  // /store/directory/listings/me returns the authed customer's own listing
  // regardless of verification/subscription status. The plain
  // /store/directory/listings endpoint hides not-yet-active listings for
  // public-visibility reasons, which is the wrong filter when the vendor
  // is loading their OWN listing during checkout.
  const res = await authedBackendFetch<{ listing: DirectoryListing | null }>(
    "/store/directory/listings/me"
  )
  if (!res.ok) {
    // Distinguish "no customer session on this device" from "signed in but no
    // listing". Vendors reach the edit/checkout pages via a reverse-SSO handoff
    // from the dashboard; when that handoff's token mint fails it drops them
    // here with NO storefront customer cookie, so /me is unauthenticated. The
    // page should send them through login to re-establish the session (the data
    // is correct — the owner_id matches their account) instead of dead-ending
    // on "no listing found".
    const unauthenticated =
      res.error === "Not signed in" ||
      /\b401\b/.test(res.error) ||
      /unauthor/i.test(res.error)
    return { authenticated: !unauthenticated, listing: null }
  }
  return { authenticated: true, listing: res.data.listing ?? null }
}

// Read the authoritative parish-affiliation limit for a listing. The backend
// accounts for the owner's SELECTED membership (recommended_tier) during
// pre-payment setup, so this can exceed what the listing's stored
// subscription_tier alone would imply. Falls back to null limit on error so the
// UI can use its tier-derived default.
export async function getParishAffiliations(listingId: string): Promise<{
  affiliations: DirectoryParishAffiliation[]
  limit: number | null
  remaining: number | null
}> {
  const res = await authedBackendFetch<{
    affiliations: DirectoryParishAffiliation[]
    limit: number
    remaining: number
  }>(`/store/directory/listings/${listingId}/affiliations`)
  if (!res.ok) return { affiliations: [], limit: null, remaining: null }
  return {
    affiliations: res.data.affiliations ?? [],
    limit: res.data.limit ?? null,
    remaining: res.data.remaining ?? null,
  }
}

export async function addParishAffiliation(
  listingId: string,
  parishId: string
): Promise<
  | { ok: true; affiliation: DirectoryParishAffiliation }
  | { ok: false; error: string; code?: "tier_limit" | "duplicate" }
> {
  const res = await authedBackendFetch<{
    affiliation: DirectoryParishAffiliation
  }>(`/store/directory/listings/${listingId}/affiliations`, {
    method: "POST",
    body: JSON.stringify({ parish_id: parishId }),
  })
  if (!res.ok) {
    // The backend's 422 message reads "Your membership allows a maximum of …"
    // and 409 "Already affiliated"; pass a discriminator up so the form can
    // decide whether to show it inline vs as a generic error.
    const e = res.error
    const code = e.includes("allows a maximum of")
      ? "tier_limit"
      : e.toLowerCase().startsWith("already affiliated")
        ? "duplicate"
        : undefined
    return { ok: false, error: e, code }
  }
  return { ok: true, affiliation: res.data.affiliation }
}

export async function removeParishAffiliation(
  listingId: string,
  affiliationId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await authedBackendFetch<{ id: string; deleted: boolean }>(
    `/store/directory/listings/${listingId}/affiliations`,
    {
      method: "DELETE",
      body: JSON.stringify({ affiliation_id: affiliationId }),
    }
  )
  if (!res.ok) return res
  return { ok: true }
}

/**
 * Claim-flow rebuild (7/7): submit the rightful-owner attestation for an
 * unclaimed listing. Grandfathered (already-paid Bubble) members get ownership
 * immediately; everyone else gets an attested intent and proceeds to the
 * membership checkout (ownership transfers when payment lands).
 */
export async function claimListing(listingId: string): Promise<
  | {
      ok: true
      status: "completed" | "attested"
      grandfathered: boolean
      message?: string
    }
  | { ok: false; error: string; code?: "claim_pending" | "already_claimed" }
> {
  const res = await authedBackendFetch<{
    status: "completed" | "attested"
    grandfathered: boolean
    message?: string
  }>(`/store/directory/listings/${listingId}/claim`, {
    method: "POST",
    body: JSON.stringify({ attested: true }),
  })
  if (!res.ok) {
    const code = res.error.includes("already claimed")
      ? ("already_claimed" as const)
      : res.error.includes("already in progress")
        ? ("claim_pending" as const)
        : undefined
    return { ok: false, error: res.error, code }
  }
  return {
    ok: true,
    status: res.data.status,
    grandfathered: res.data.grandfathered,
    message: res.data.message,
  }
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
