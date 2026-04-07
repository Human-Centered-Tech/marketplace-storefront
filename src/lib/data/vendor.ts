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
  sellerName?: string | null
  storeStatus?: string | null
}

export async function retrieveVendorStatus(): Promise<VendorStatus> {
  const vendorToken = await getVendorToken()
  if (!vendorToken) {
    return { isVendor: false }
  }

  // Optionally fetch richer data from the backend
  const headers = await getAuthHeaders()
  if (!headers || !("authorization" in headers)) {
    return { isVendor: true }
  }

  try {
    const res = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/account/vendor-status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      }
    )

    if (res.ok) {
      const data = await res.json()
      return {
        isVendor: data.is_vendor,
        sellerName: data.seller_name,
        storeStatus: data.store_status,
      }
    }
  } catch {
    // Fall back to cookie-based check
  }

  return { isVendor: true }
}

export async function becomeVendor(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { success: false, error: "All fields are required" }
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

    // Step 3: Store vendor token and flag
    await setVendorToken(vendorToken)
    await setVendorFlag(true)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.toString() }
  }
}
