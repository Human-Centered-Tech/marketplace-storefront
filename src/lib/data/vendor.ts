"use server"

import { revalidateTag } from "next/cache"
import {
  getAuthHeaders,
  getCacheTag,
  getVendorToken,
  removeVendorToken,
  setVendorFlag,
  setVendorToken,
} from "./cookies"

export type VendorStatus = {
  isVendor: boolean
  sellerId?: string | null
  sellerName?: string | null
  sellerHandle?: string | null
  storeStatus?: string | null
}

// Returns true if the vendor JWT is malformed OR has an empty actor_id.
// An empty actor_id is the post-becomeVendor stale-token bug — the
// token gets issued by /auth/seller/emailpass/register BEFORE the
// seller/member is auto-created, so it works for /vendor/sellers
// (Mercur allows unregistered actors there) but 401s everywhere else,
// putting the vendor app into a /dashboard ↔ /login#handoff= loop.
export async function isVendorTokenStale(jwt: string): Promise<boolean> {
  try {
    const body = jwt.split(".")[1]
    if (!body) return true
    const padded = body + "=".repeat((4 - (body.length % 4)) % 4)
    const decoded = Buffer.from(
      padded.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString()
    const payload = JSON.parse(decoded)
    return !payload?.actor_id
  } catch {
    return true
  }
}

export async function retrieveVendorStatus(): Promise<VendorStatus> {
  const vendorToken = await getVendorToken()
  if (!vendorToken) {
    return { isVendor: false }
  }

  const headers = await getAuthHeaders()
  if (!headers || !("authorization" in headers)) {
    // We have a vendor cookie but no customer auth header to verify it
    // with. Cookie presence alone is not trustworthy — stale cookies
    // persist after seller-record cleanup. Safer default: false. The
    // user can still log into the vendor app via SSO; this only gates
    // UI affordances on the storefront.
    return { isVendor: false }
  }

  try {
    const res = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/account/vendor-status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          ...headers,
        },
      }
    )

    if (res.ok) {
      const data = await res.json()
      return {
        isVendor: data.is_vendor,
        sellerId: data.seller_id,
        sellerName: data.seller_name,
        sellerHandle: data.seller_handle,
        storeStatus: data.store_status,
      }
    }
  } catch {
    // Fall through to false. Stale-cookie fallback was harming UX
    // (vendor menu items showing for accounts whose seller record has
    // since been deleted).
  }

  // Backend call failed / non-OK — don't leak cookie state as a
  // positive signal. UI gates default to "not a vendor".
  return { isVendor: false }
}

export async function becomeVendor(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Guard against the email coming through as undefined or as the
  // literal string "undefined" (which is what FormData.set() does when
  // handed `undefined`). Without this check, the request reaches the
  // backend with member.email="undefined" and the Mercur validator
  // bubbles up an opaque "Invalid request: Invalid email" message —
  // hard to diagnose because the form *looks* like it submitted fine.
  if (!name || !email || email === "undefined" || !password) {
    return {
      success: false,
      error:
        !email || email === "undefined"
          ? "Could not detect your account email. Try refreshing the page; if it persists, sign out and back in."
          : "All fields are required",
    }
  }

  try {
    // Step 1: Get seller auth token. Try register first; if identity
    // already exists (customer registered first), fall back to login.
    let vendorToken: string

    const registerRes = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/auth/seller/emailpass/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    )

    if (registerRes.ok) {
      const data = await registerRes.json()
      vendorToken = data.token
    } else {
      // Identity already exists — try login instead
      const loginRes = await fetch(
        `${process.env.MEDUSA_BACKEND_URL}/auth/seller/emailpass`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      )

      if (!loginRes.ok) {
        return { success: false, error: "Invalid password" }
      }

      const data = await loginRes.json()
      vendorToken = data.token
    }

    // Step 2: Create seller record
    const createRes = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/vendor/sellers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${vendorToken}`,
        },
        body: JSON.stringify({
          name,
          member: { name, email },
        }),
      }
    )

    if (!createRes.ok) {
      const err = await createRes.json()
      return { success: false, error: err.message || "Failed to create seller" }
    }

    const sellerData = await createRes.json()
    const sellerId = sellerData?.seller?.id

    // Step 3: Store vendor token and flag
    await setVendorToken(vendorToken)
    await setVendorFlag(true)

    // Step 4: Auto-create a draft directory listing so the vendor has a
    // directory presence from the start (per 3/31 decision). Non-fatal.
    // Includes vendor_id so the floor-enforcement middleware can look up
    // the listing by seller ID without an email join.
    try {
      const customerHeaders = await getAuthHeaders()
      if (customerHeaders && "authorization" in customerHeaders) {
        await fetch(
          `${process.env.MEDUSA_BACKEND_URL}/store/directory/listings`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key":
                process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
              ...customerHeaders,
            },
            body: JSON.stringify({
              business_name: name,
              contact_email: email,
              ...(sellerId ? { vendor_id: sellerId } : {}),
            }),
          }
        )
      }
    } catch {
      // Non-fatal — vendor can create the listing from the dashboard.
    }

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.toString() }
  }
}

/**
 * Mint a fresh seller token for an existing merchant account whose
 * stored token has a stale empty actor_id. Used by the /api/vendor-
 * handoff route when it detects a bad token in the cookie — instead of
 * handing off the bad token (which would put the vendor app in a
 * /dashboard ↔ /login loop), we clear it and bounce the user here to
 * re-enter their password.
 *
 * The customer is already logged into the storefront via `_medusa_jwt`,
 * so we read their email server-side rather than asking them to type it.
 */
export async function refreshVendorSession(formData: FormData) {
  const password = formData.get("password") as string
  if (!password) {
    return { success: false, error: "Password is required" }
  }

  const customerHeaders = await getAuthHeaders()
  if (!customerHeaders || !("authorization" in customerHeaders)) {
    return { success: false, error: "Please sign in first." }
  }

  // Look up the customer's email server-side — they shouldn't have to
  // re-type it after already being logged in.
  const meRes = await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/store/customers/me`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        ...customerHeaders,
      },
      cache: "no-store",
    }
  )
  if (!meRes.ok) {
    return { success: false, error: "Could not look up your account." }
  }
  const me = await meRes.json()
  const email = me?.customer?.email
  if (!email) {
    return { success: false, error: "Could not detect your account email." }
  }

  // Re-login as the seller. Because the seller record now exists,
  // /auth/seller/emailpass will return a JWT with actor_id populated.
  const loginRes = await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/auth/seller/emailpass`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  )
  if (!loginRes.ok) {
    return { success: false, error: "Invalid password." }
  }
  const { token } = await loginRes.json()
  if (typeof token !== "string" || !token) {
    return { success: false, error: "Login returned no token." }
  }

  // Sanity check — if the new token ALSO has empty actor_id, the
  // auto-approve subscriber hasn't run yet and persisting this token
  // would just re-loop. Better to tell the user to try again shortly.
  if (await isVendorTokenStale(token)) {
    return {
      success: false,
      error:
        "Your merchant account is still being set up. Try again in a few seconds.",
    }
  }

  await setVendorToken(token)
  await setVendorFlag(true)
  return { success: true, error: null }
}
