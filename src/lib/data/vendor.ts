"use server"

import { revalidateTag } from "next/cache"
import {
  getAuthHeaders,
  getCacheTag,
  getVendorToken,
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

    // Step 2b: Re-issue the seller token so it carries a populated
    // actor_id.
    //
    // The token from /auth/seller/emailpass/register was issued BEFORE
    // any seller/member existed, so its JWT payload has actor_id="" and
    // empty app_metadata. It's good enough to call /vendor/sellers
    // (Mercur allows unregistered actors there) but every other vendor
    // route 401s on it — which sends the vendor app into a /dashboard
    // ↔ /login#handoff= reload loop once we hand it off.
    //
    // The seller-request-auto-approve subscriber runs asynchronously on
    // the requests.seller.created event, so we poll a re-login until
    // the JWT comes back with a real actor_id, or give up after a few
    // seconds and surface a retry-friendly error.
    const REISSUE_MAX_TRIES = 12
    const REISSUE_DELAY_MS = 350
    const decodeActor = (jwt: string): string => {
      try {
        const body = jwt.split(".")[1]
        const padded = body + "=".repeat((4 - (body.length % 4)) % 4)
        const json = JSON.parse(
          Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
        )
        return json?.actor_id ?? ""
      } catch {
        return ""
      }
    }

    let reissuedToken: string | null = null
    for (let attempt = 0; attempt < REISSUE_MAX_TRIES; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, REISSUE_DELAY_MS))
      }
      const loginRes = await fetch(
        `${process.env.MEDUSA_BACKEND_URL}/auth/seller/emailpass`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      )
      if (!loginRes.ok) continue
      const newToken = (await loginRes.json())?.token
      if (typeof newToken !== "string") continue
      if (decodeActor(newToken)) {
        reissuedToken = newToken
        break
      }
    }

    if (!reissuedToken) {
      return {
        success: false,
        error:
          "Your merchant account was created but is still finalizing. Try again in a few seconds.",
      }
    }
    vendorToken = reissuedToken

    // Step 3: Store the *re-issued* vendor token and the vendor flag.
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
