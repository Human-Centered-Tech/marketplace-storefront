"use server"

import { sdk } from "../config"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  removeVendorFlag,
  removeVendorToken,
  setAuthToken,
  setVendorFlag,
  setVendorToken,
} from "./cookies"

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          // Medusa v2's `fields=` is a SELECTION list — anything not
          // mentioned is excluded. History on this line:
          //   "*orders,metadata"   silently dropped email/first_name/
          //                        etc., breaking become-vendor in
          //                        prod ("Invalid email" from backend)
          //   "*,*orders,metadata" backend rejects with 400
          //                        "Requested fields [] are not valid"
          //                        — bare `*` isn't allowed on
          //                        customer module; retrieveCustomer
          //                        catches and returns null, so users
          //                        appear logged out everywhere
          // Explicit list is the working pattern: name every scalar
          // we depend on across the storefront, plus the orders
          // relation and metadata JSONB.
          fields:
            "id,email,first_name,last_name,phone,company_name,has_account,created_at,updated_at,metadata,*orders",
        },
        headers,
        next,
        // Auth-sensitive flags (email_verified, vendor status) must always
        // reflect latest backend state. The verify-email route bumps the
        // cache tag via revalidateTag, but skipping the cache outright is
        // the bulletproof guard — backend cost is negligible per user.
        cache: "no-store",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch((err) => {
      throw new Error(err.message)
    })

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(formData: FormData) {
  const password = formData.get("password") as string
  // Tier from the /sell/onboarding sizing quiz, threaded through the
  // register URL as ?recommended_tier=. Stored on customer.metadata so
  // /vendor/store/go-live can read it later and build subscribe_url
  // for the right tier without re-asking the quiz questions.
  const recommendedTier = formData.get("recommended_tier") as string | null
  // "How did you hear about us?" — captured at signup and stored on
  // customer.metadata so the Freshworks CRM sync can read marketing_source /
  // marketing_subsource (it already looks for these keys).
  const marketingSource = formData.get("marketing_source") as string | null
  const marketingSubsource = formData.get("marketing_subsource") as
    | string
    | null
  // Founding Pillars affirmation, forwarded from the /sell/onboarding gate.
  // Stored on customer.metadata so there's a record the vendor affirmed the
  // pillars at signup. (A fuller audit trail — timestamp + copy snapshot on
  // the seller record — is a backend follow-up.)
  const foundingPillarsAffirmed =
    formData.get("founding_pillars_affirmed") as string | null
  const customerForm: Record<string, unknown> = {
    // Email is case-insensitive — normalize so login always matches.
    email: ((formData.get("email") as string) || "").trim().toLowerCase(),
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }
  const metadata: Record<string, unknown> = {}
  if (recommendedTier) metadata.recommended_tier = recommendedTier
  if (marketingSource) metadata.marketing_source = marketingSource
  if (marketingSubsource) metadata.marketing_subsource = marketingSubsource
  if (foundingPillarsAffirmed === "true") {
    metadata.founding_pillars_affirmed = true
    metadata.founding_pillars_affirmed_at = new Date().toISOString()
  }
  if (Object.keys(metadata).length) {
    customerForm.metadata = metadata
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email as string,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm as any,
      {},
      headers
    )

    // Post-create steps are best-effort. The customer exists in Medusa
    // and the auth token from sdk.auth.register() above is already set,
    // so a transient failure here (e.g. flaky second-login network call)
    // must NOT bubble up as a signup error — that's the source of the
    // brief red error flash the user sees after a successful register.
    try {
      const loginToken = await sdk.auth.login("customer", "emailpass", {
        email: customerForm.email,
        password,
      })
      await setAuthToken(loginToken as string)

      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)

      await transferCart()
    } catch {
      // Swallow — the user is already registered + authenticated.
    }

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(formData: FormData) {
  // Email is case-insensitive — normalize to match how it's stored.
  const email = ((formData.get("email") as string) || "").trim().toLowerCase()
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }

  // Attempt seller authentication with same credentials
  try {
    const sellerAuthRes = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/auth/seller/emailpass`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    )
    if (sellerAuthRes.ok) {
      const { token: vendorToken } = await sellerAuthRes.json()
      if (vendorToken) {
        // Decode JWT payload to check if a seller record is actually linked
        const payload = JSON.parse(
          Buffer.from(vendorToken.split(".")[1], "base64").toString()
        )
        if (payload.actor_id) {
          await setVendorToken(vendorToken)
          await setVendorFlag(true)
        }
      }
    }
  } catch {
    // User is not a vendor — silently ignore
  }

  try {
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout() {
  await sdk.auth.logout()

  await removeAuthToken()
  await removeVendorToken()
  await removeVendorFlag()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
  redirect(`/`)
}

/**
 * Initiate account deletion (Apple/Google/GDPR). On success the account is
 * deactivated server-side and we clear the local session. Returns the blocking
 * reasons (e.g. pending seller payout balance) instead of throwing on a 409 so
 * the page can explain them.
 */
export async function deleteAccount(): Promise<{
  success?: boolean
  blocked?: boolean
  reasons?: { code: string; message: string }[]
}> {
  const headers = { ...(await getAuthHeaders()) }
  try {
    await sdk.client.fetch("/store/customers/me/account", {
      method: "DELETE",
      body: { confirm: true },
      headers,
    })
  } catch (e: any) {
    const data = e?.response?.data ?? e?.data ?? e?.body
    if (data?.blocked) return { blocked: true, reasons: data.reasons ?? [] }
    throw e
  }

  await removeAuthToken()
  await removeVendorToken()
  await removeVendorFlag()
  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)
  await removeCartId()
  return { success: true }
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (formData: FormData): Promise<any> => {
  const address = {
    address_name: formData.get("address_name") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    province: formData.get("province") as string,
    is_default_billing: Boolean(formData.get("isDefaultBilling")),
    is_default_shipping: Boolean(formData.get("isDefaultShipping")),
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async ({ customer }) => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  formData: FormData
): Promise<any> => {
  const addressId = formData.get("addressId") as string

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    address_name: formData.get("address_name") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerPassword = async (
  password: string,
  token: string
): Promise<any> => {
  const res = await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/auth/customer/emailpass/update`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    }
  )
    .then(async () => {
      await removeAuthToken()
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err: any) => {
      return { success: false, error: err.toString() }
    })

  return res
}

/**
 * Accept a reverse-SSO handoff from the vendor dashboard.
 *
 * `token` is a deliberately short-lived (5m) bearer minted by the backend at
 * GET /store/account/customer-token. It exists only to carry the customer
 * identity across the SSO boundary in a URL fragment — it must NOT become the
 * persisted session, or the storefront would 401 the moment it expires (e.g. a
 * vendor still mid-edit on their directory listing). Exchange it for a
 * normal-length session token before persisting, mirroring the OAuth flow.
 */
export async function acceptCustomerHandoff(token: string) {
  const sessionToken = await exchangeHandoffForSession(token)
  await setAuthToken(sessionToken)
  await setVendorFlag(true)
}

/**
 * Trade the short-lived SSO handoff token for a normal-length customer session
 * token via Medusa's /auth/token/refresh (re-mints for the same actor with the
 * backend's default JWT expiry). Falls back to the original token if the
 * refresh fails, so the handoff still succeeds — just with the shorter window.
 */
async function exchangeHandoffForSession(token: string): Promise<string> {
  try {
    const res = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/auth/token/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
          "x-publishable-api-key": process.env
            .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
        },
      }
    )

    if (!res.ok) {
      return token
    }

    const { token: refreshed } = (await res.json()) as { token?: string }
    return refreshed || token
  } catch {
    return token
  }
}

export const sendResetPasswordEmail = async (email: string) => {
  const res = await sdk.auth
    .resetPassword("customer", "emailpass", {
      identifier: email,
    })
    .then(() => {
      return { success: true, error: null }
    })
    .catch((err: any) => {
      return { success: false, error: err.toString() }
    })

  return res
}

/**
 * Complete an OAuth sign-in. Medusa's Google auth provider redirects
 * the user back with a ?token= query param that's a short-lived JWT.
 * We persist it as the customer's auth token; the customer record
 * (if new) is auto-created by Medusa the first time the token is used.
 *
 * Returns true on success so the caller can redirect forward.
 */
export async function completeOAuthSignIn(token: string): Promise<boolean> {
  if (!token) return false
  try {
    // The bridge route on the backend has already handled customer
    // registration + token refresh, so this token is ready to go.
    await setAuthToken(token)
    const cacheTag = await getCacheTag("customers")
    revalidateTag(cacheTag)
    // Bind any pre-existing guest cart to the now-signed-in customer — the same
    // step login()/signup() do. Without this an OAuth (Google/Apple) shopper
    // keeps a customer_id=null cart, which is exactly how a typed checkout email
    // detaches the order to a guest. (Backend cart-identity guard backstops this
    // at complete; this binds it earlier so the receipt/customer resolve too.)
    try {
      await transferCart()
    } catch {
      // non-fatal
    }
    return true
  } catch {
    return false
  }
}
