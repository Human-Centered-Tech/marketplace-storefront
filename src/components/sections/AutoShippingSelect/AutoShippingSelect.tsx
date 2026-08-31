"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { setShippingMethod } from "@/lib/data/cart"
import { HttpTypes } from "@medusajs/types"

// Outbound (non-return) options only — return options are never selectable
// for a checkout.
const outboundMethods = (methods: any[] | null | undefined) =>
  (methods ?? []).filter(
    (sm: any) =>
      sm.rules?.find((rule: any) => rule.attribute === "is_return")?.value !==
      "true"
  )

/**
 * Auto-selects the first available shipping method for each seller when no
 * shipping method is set yet. Per 4/1 decision: basic shipping is included in
 * pricing, no shipping method selection for MVP.
 *
 * Triggers a router refresh after selection so the cart state is up-to-date
 * for downstream components (PaymentButton, CartReview).
 *
 * When there is NOTHING to select — the seller has no shipping option that
 * reaches this address — this is the only place that knows, so it renders
 * the notice. Without it the failure was completely silent: no shipping
 * step, the old "Missing seller shipping option" modal is dead code, and
 * checkout simply never reached payment (qa78-checkout-shipping).
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

  const hasAddress = Boolean(cart.shipping_address)
  const hasSelection = Boolean(cart.shipping_methods?.length)
  const validMethods = outboundMethods(availableShippingMethods)
  // null = the options request itself failed (distinct from "seller offers none")
  const optionsUnavailable = availableShippingMethods === null

  useEffect(() => {
    if (didRun.current) return
    if (!hasAddress) return
    if (hasSelection) return
    if (!validMethods.length) return

    didRun.current = true

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, availableShippingMethods, router])

  // Nothing to say until an address exists, and nothing to say once a
  // method is selected or about to be (the effect above handles that).
  if (!hasAddress || hasSelection || validMethods.length > 0) return null

  return (
    <div
      role="alert"
      className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-navy-dark"
    >
      <p className="font-serif text-lg font-bold mb-1">
        {optionsUnavailable
          ? "We couldn't load shipping options"
          : "No shipping option is available for this address"}
      </p>
      <p className="text-sm text-navy-dark/80">
        {optionsUnavailable
          ? "Please refresh the page. If this keeps happening, contact support@catholicowned.com and we'll sort it out."
          : "The seller hasn't set up shipping to this address yet, so this order can't be completed here. Try a different address, or contact support@catholicowned.com and we'll get it fixed."}
      </p>
    </div>
  )
}
