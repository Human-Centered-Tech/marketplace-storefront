"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { setShippingMethod } from "@/lib/data/cart"
import { HttpTypes } from "@medusajs/types"

/**
 * Silently auto-selects the first available shipping method for each seller
 * when no shipping method is set yet. Per 4/1 decision: basic shipping is
 * included in pricing, no shipping method selection for MVP.
 *
 * Triggers a router refresh after selection so the cart state is up-to-date
 * for downstream components (PaymentButton, CartReview).
 */
export function AutoShippingSelect({
  cart,
  availableShippingMethods,
}: {
  cart: HttpTypes.StoreCart
  availableShippingMethods: any[] | null
}) {
  const didRun = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (didRun.current) return
    if (!cart.shipping_address) return
    if (cart.shipping_methods && cart.shipping_methods.length > 0) return
    if (!availableShippingMethods?.length) return

    didRun.current = true

    const validMethods = availableShippingMethods.filter(
      (sm: any) =>
        sm.rules?.find((rule: any) => rule.attribute === "is_return")?.value !==
        "true"
    )

    if (!validMethods.length) return

    const seenSellers = new Set<string>()
    const toSelect: string[] = []

    for (const method of validMethods) {
      const sellerId = method.seller_id || "__default__"
      if (seenSellers.has(sellerId)) continue
      seenSellers.add(sellerId)
      toSelect.push(method.id)
    }

    ;(async () => {
      for (const methodId of toSelect) {
        await setShippingMethod({
          cartId: cart.id,
          shippingMethodId: methodId,
        })
      }
      router.refresh()
    })()
  }, [cart, availableShippingMethods, router])

  return null
}
