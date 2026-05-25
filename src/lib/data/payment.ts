"use server"

import { sdk } from "../config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { isManual } from "../constants"
import { HttpTypes } from "@medusajs/types"

export const listCartPaymentMethods = async (regionId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("payment_providers")),
  }

  // Manual payment (`pp_system_default`) places a fully-paid order without
  // actually charging, so it must never reach real customers. Allow it only in
  // local dev, or where explicitly enabled (e.g. staging) for placing test
  // orders without Stripe.
  const allowManual =
    process.env.NODE_ENV === "development" ||
    process.env.ENABLE_MANUAL_PAYMENT === "true"

  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(
      `/store/payment-providers`,
      {
        method: "GET",
        query: { region_id: regionId },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ payment_providers }) =>
      payment_providers
        .filter((provider) => allowManual || !isManual(provider.id))
        .sort((a, b) => {
          return a.id > b.id ? 1 : -1
        })
    )
    .catch(() => {
      return null
    })
}
