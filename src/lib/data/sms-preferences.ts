"use server"

import { getAuthHeaders } from "./cookies"

/**
 * Server actions for the signed-in customer's marketing-SMS consent
 * (punchlist b716). Same authedBackendFetch pattern as parish-actions.ts:
 * the customer token is an httpOnly cookie, so the call must run server-side
 * and forward it as a Bearer header.
 *
 * Backed by the dedicated /store/customers/me/sms-preferences route — NOT the
 * native customer-metadata update, which would let a client write arbitrary
 * metadata keys (including recommended_tier).
 */

export type SmsPreferences = {
  sms_marketing_opt_in: boolean
  sms_marketing_opt_in_at: string | null
  sms_marketing_opt_in_source: "web" | "app" | null
  phone: string | null
  /**
   * The carrier is blocking texts to this number because STOP was sent from
   * it. Independent of consent — someone can hold valid consent on a
   * suppressed number, and only texting START lifts it.
   */
  carrier_suppressed: boolean
}

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

const EMPTY: SmsPreferences = {
  sms_marketing_opt_in: false,
  sms_marketing_opt_in_at: null,
  sms_marketing_opt_in_source: null,
  phone: null,
  carrier_suppressed: false,
}

export async function getSmsPreferences(): Promise<SmsPreferences> {
  const res = await authedBackendFetch<{ sms_preferences: SmsPreferences }>(
    "/store/customers/me/sms-preferences"
  )
  // Fail closed: an unreadable preference renders as opted-out, never as a
  // pre-checked box.
  if (!res.ok) return EMPTY
  return { ...EMPTY, ...res.data.sms_preferences }
}

export async function updateSmsPreferences(input: {
  optIn: boolean
  phone?: string
}): Promise<
  { ok: true; preferences: SmsPreferences } | { ok: false; error: string }
> {
  const res = await authedBackendFetch<{ sms_preferences: SmsPreferences }>(
    "/store/customers/me/sms-preferences",
    {
      method: "PUT",
      body: JSON.stringify({
        opt_in: input.optIn,
        phone: input.phone,
        source: "web",
      }),
    }
  )
  if (!res.ok) return res
  return { ok: true, preferences: { ...EMPTY, ...res.data.sms_preferences } }
}
