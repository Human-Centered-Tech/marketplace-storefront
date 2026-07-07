"use server"

import { Parish } from "@/types/directory"
import { getAuthHeaders } from "./cookies"

/**
 * Server actions for the logged-in customer's parish memberships
 * ("My Parishes"). Same authedBackendFetch pattern as directory-actions.ts:
 * the customer token is an httpOnly cookie, so mutations must run
 * server-side and forward it as a Bearer header.
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

type MembershipsResponse = { parishes: Parish[]; limit: number }

export async function getMyParishes(): Promise<{
  authenticated: boolean
  parishes: Parish[]
  limit: number
}> {
  const res = await authedBackendFetch<MembershipsResponse>(
    "/store/customers/me/parishes"
  )
  if (!res.ok) {
    return { authenticated: res.error !== "Not signed in", parishes: [], limit: 10 }
  }
  return {
    authenticated: true,
    parishes: res.data.parishes ?? [],
    limit: res.data.limit ?? 10,
  }
}

export async function addMyParish(
  parishId: string
): Promise<
  | { ok: true; parishes: Parish[]; limit: number }
  | { ok: false; error: string }
> {
  const res = await authedBackendFetch<MembershipsResponse>(
    "/store/customers/me/parishes",
    { method: "POST", body: JSON.stringify({ parish_id: parishId }) }
  )
  if (!res.ok) return res
  return { ok: true, parishes: res.data.parishes, limit: res.data.limit }
}

export async function removeMyParish(
  parishId: string
): Promise<
  | { ok: true; parishes: Parish[]; limit: number }
  | { ok: false; error: string }
> {
  const res = await authedBackendFetch<MembershipsResponse>(
    "/store/customers/me/parishes",
    { method: "DELETE", body: JSON.stringify({ parish_id: parishId }) }
  )
  if (!res.ok) return res
  return { ok: true, parishes: res.data.parishes, limit: res.data.limit }
}
