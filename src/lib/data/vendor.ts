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
  // Normalize the email exactly as signup()/login() do (trim + lowercase).
  // The customer record is created with a lowercased email, but the seller
  // identity + member here used the raw-cased input — so a vendor who typed
  // any uppercase (e.g. "John@Example.com") got a seller member whose email
  // didn't match their customer email. /store/account/vendor-status matches
  // the seller member by the customer's (lowercased) email, so the mismatch
  // made is_vendor return false: the merchant landed back on the /user
  // dashboard with "Become a Merchant" still showing despite a created seller.
  const email = ((formData.get("email") as string) || "").trim().toLowerCase()
  const password = formData.get("password") as string
  // When the vendor is claiming an existing directory listing, we must NOT
  // auto-create a draft listing below: the claim attaches them to the
  // pre-seeded listing (which already has its own unique slug), so a fresh
  // auto-create would either collide on the slug or leave them with a
  // duplicate listing. Presence of this id means "claim flow — skip Step 4".
  const claimListingId = formData.get("claim_listing") as string | null
  // Funnel context. For a brand-new registration signup() persists these on
  // customer.metadata; for a logged-in convert (become-vendor page) nothing
  // else does, so persist them here — go-live's tier preselection reads
  // metadata.recommended_tier.
  const recommendedTier = formData.get("recommended_tier") as string | null
  const pillarsAffirmed =
    (formData.get("founding_pillars_affirmed") as string | null) === "true"

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

    // Step 4: give the vendor a draft directory listing. Non-fatal.
    //   - Normal signup: auto-create a fresh listing (per 3/31 decision),
    //     including vendor_id so floor-enforcement can find it by seller id.
    //   - Claim flow: ADOPT the listing they came to claim instead of
    //     creating a duplicate (which would collide on the unique slug). The
    //     attach endpoint sets owner_id + vendor_id and marks it pending, so
    //     they pay/activate it via the standard go-live flow — landing them on
    //     the dashboard like every other vendor.
    try {
      const customerHeaders = await getAuthHeaders()
      if (customerHeaders && "authorization" in customerHeaders) {
        const baseHeaders = {
          "Content-Type": "application/json",
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          ...customerHeaders,
        }
        if (claimListingId) {
          await fetch(
            `${process.env.MEDUSA_BACKEND_URL}/store/directory/listings/${claimListingId}/attach`,
            { method: "POST", headers: baseHeaders }
          )
        } else {
          await fetch(
            `${process.env.MEDUSA_BACKEND_URL}/store/directory/listings`,
            {
              method: "POST",
              headers: baseHeaders,
              body: JSON.stringify({
                business_name: name,
                contact_email: email,
                ...(sellerId ? { vendor_id: sellerId } : {}),
              }),
            }
          )
        }

        // Persist funnel context on customer.metadata for logged-in converts
        // (new registrations get this from signup()). Medusa merges metadata
        // keys on update, so this can't clobber unrelated keys. Best-effort.
        if (recommendedTier || pillarsAffirmed) {
          await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/customers/me`, {
            method: "POST",
            headers: baseHeaders,
            body: JSON.stringify({
              metadata: {
                ...(recommendedTier
                  ? { recommended_tier: recommendedTier }
                  : {}),
                ...(pillarsAffirmed
                  ? {
                      founding_pillars_affirmed: true,
                      founding_pillars_affirmed_at: new Date().toISOString(),
                    }
                  : {}),
              },
            }),
          }).catch(() => {})
        }
      }
    } catch {
      // Non-fatal — vendor can create/claim the listing from the dashboard.
    }

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.toString() }
  }
}

/**
 * Existing-customer → merchant conversion (Bug #2).
 *
 * A person who already has a customer account cannot re-register the same
 * email as a merchant: sdk.auth.register() returns "Identity with email
 * already exists", which dead-ends the merchant signup form. Instead of
 * re-registering (the thing that 409s), we convert their EXISTING account.
 * The caller logs the customer in first; this helper then hits the
 * idempotent backend endpoint
 *   POST /store/account/become-merchant
 * which creates + links a seller onto the customer's existing auth identity
 * (no second registration → nothing collides) and is a safe no-op if they
 * are already a merchant. See
 * marketplace-backend/src/api/store/account/become-merchant/route.ts.
 *
 * The backend route only creates the seller — it does not touch storefront
 * cookies or the directory listing. So after the seller exists we run the
 * SAME tail becomeVendor() runs for a brand-new merchant:
 *   - mint + store the seller (vendor) token, so /api/vendor-handoff has a
 *     cookie to hand to the vendor app (because the seller was linked
 *     synchronously, /auth/seller/emailpass returns a populated actor_id
 *     right away), and
 *   - give them a draft directory listing (or attach the one they're
 *     claiming), exactly as becomeVendor Step 4 does.
 * The caller then redirects to /api/vendor-handoff, landing the converted
 * customer exactly where a fresh merchant lands.
 *
 * We deliberately do NOT reuse becomeVendor() here: its Step 2 POSTs
 * /vendor/sellers to CREATE a seller, which would collide on the unique
 * seller handle now that become-merchant already created one.
 *
 * Requires the customer to already be authenticated (getAuthHeaders() must
 * carry an authorization bearer — the caller logs them in first).
 *
 * FormData: { name, email, password, claim_listing? } — same shape as
 * becomeVendor().
 */
export async function becomeMerchant(formData: FormData) {
  const name = formData.get("name") as string
  // Normalize identically to signup()/login()/becomeVendor() (trim + lower).
  const email = ((formData.get("email") as string) || "").trim().toLowerCase()
  const password = formData.get("password") as string
  const claimListingId = formData.get("claim_listing") as string | null

  const customerHeaders = await getAuthHeaders()
  if (!customerHeaders || !("authorization" in customerHeaders)) {
    return { success: false, error: "Please sign in first." }
  }

  const baseHeaders = {
    "Content-Type": "application/json",
    "x-publishable-api-key":
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
    ...customerHeaders,
  }

  // Step 1: create / link the seller onto the customer's auth identity.
  // Idempotent — a repeat call just returns the existing seller.
  let sellerId: string | undefined
  let directToken: string | null = null
  try {
    const res = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/account/become-merchant`,
      {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({ name, business_name: name }),
      }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return {
        success: false,
        error:
          err?.message ||
          "Could not convert your account to a merchant. Please try again.",
      }
    }
    const data = await res.json()
    sellerId = data?.seller_id
    // become-merchant now returns a ready seller token — use it directly
    // instead of the racy seller-login poll below.
    directToken = typeof data?.token === "string" ? data.token : null
  } catch (error: any) {
    return { success: false, error: error.toString() }
  }

  // Step 2: mint a seller (vendor) token and store it, so /api/vendor-handoff
  // has a cookie to hand to the vendor app. become-merchant links the seller
  // to the existing auth identity synchronously, so /auth/seller/emailpass
  // with the same credentials returns a token carrying a populated actor_id
  // immediately — but poll a couple of times to be safe against any lag.
  const decodeActor = (jwt: string): string => {
    try {
      const body = jwt.split(".")[1]
      const padded = body + "=".repeat((4 - (body.length % 4)) % 4)
      const json = JSON.parse(
        Buffer.from(
          padded.replace(/-/g, "+").replace(/_/g, "/"),
          "base64"
        ).toString()
      )
      return json?.actor_id ?? ""
    } catch {
      return ""
    }
  }

  // Poll the seller login until the JWT carries a populated actor_id, and
  // REFUSE to store a stale (empty actor_id) token — mirror becomeVendor's
  // Step 2b guard exactly. become-merchant links the seller synchronously so
  // this almost always succeeds on the first try, but a slow auth-identity
  // write can briefly return an empty actor_id; storing that seeds the stale
  // vendor cookie that later forces a second login at /api/vendor-handoff.
  // Polling ~12x/~4s (was 4x/~900ms) and never persisting an empty-actor_id
  // token eliminates that.
  const REISSUE_MAX_TRIES = 12
  const REISSUE_DELAY_MS = 350
  // Prefer the token become-merchant returned directly (deterministic — no race);
  // only fall back to polling seller-login if it's absent or has an empty actor_id.
  let vendorToken: string | null =
    directToken && decodeActor(directToken) ? directToken : null
  for (let attempt = 0; !vendorToken && attempt < REISSUE_MAX_TRIES; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, REISSUE_DELAY_MS))
    const loginRes = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/auth/seller/emailpass`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    )
    if (!loginRes.ok) continue
    const token = (await loginRes.json())?.token
    if (typeof token !== "string") continue
    if (decodeActor(token)) {
      vendorToken = token
      break
    }
  }

  if (vendorToken) {
    await setVendorToken(vendorToken)
    await setVendorFlag(true)
  }
  // If we never got a token with a populated actor_id, fall through WITHOUT
  // storing one: the seller exists, and /api/vendor-handoff now mints a fresh
  // seller token from the customer session (PART B) — or, failing that, routes
  // a missing/stale cookie to a recovery page.

  // Step 3: draft directory listing — mirror becomeVendor Step 4 exactly.
  //   - Claim flow: ADOPT the listing they came to claim (no duplicate slug).
  //   - Otherwise: auto-create a fresh draft listing (per the 3/31 decision),
  //     including vendor_id so floor-enforcement can find it by seller id.
  // Non-fatal — they can create/claim it from the dashboard.
  try {
    if (claimListingId) {
      await fetch(
        `${process.env.MEDUSA_BACKEND_URL}/store/directory/listings/${claimListingId}/attach`,
        { method: "POST", headers: baseHeaders }
      )
    } else {
      await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/directory/listings`, {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({
          business_name: name,
          contact_email: email,
          ...(sellerId ? { vendor_id: sellerId } : {}),
        }),
      })
    }
  } catch {
    // Non-fatal.
  }

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  return { success: true, error: null }
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

/**
 * PART B — password-less vendor session mint.
 *
 * Mints a fresh SELLER token from the CURRENT customer session by calling the
 * customer-authenticated backend endpoint GET /store/account/seller-token —
 * the missing direction of the SSO bridge (the existing /store/account/
 * customer-token does the inverse, seller → customer).
 *
 * The backend endpoint is the authority on ownership: it resolves the seller
 * the authenticated customer owns via the customer's email → member row →
 * seller_id, and 403s (minting nothing) if the caller owns no seller. So a
 * non-vendor calling this just gets null back — we never set a vendor cookie
 * for someone who isn't a vendor.
 *
 * On success we store the freshly-minted token (which always carries a
 * populated actor_id) and the vendor flag, exactly like becomeVendor()/login()
 * do, and return the token so the caller (/api/vendor-handoff) can hand it off
 * immediately — with NO second login.
 */
export async function mintVendorSession(): Promise<string | null> {
  const customerHeaders = await getAuthHeaders()
  if (!customerHeaders || !("authorization" in customerHeaders)) {
    return null
  }

  try {
    const res = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/account/seller-token`,
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
    if (!res.ok) return null
    const token = (await res.json())?.token
    if (typeof token !== "string" || !token) return null
    // Defensive: a freshly-minted token always has a populated actor_id, but
    // never persist a stale one (it would just re-trigger the second login).
    if (await isVendorTokenStale(token)) return null

    await setVendorToken(token)
    await setVendorFlag(true)
    return token
  } catch {
    return null
  }
}
