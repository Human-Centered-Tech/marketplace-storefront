"use client"

import { useEffect } from "react"
import { track } from "@/lib/analytics"

/**
 * Emits the `purchase` analytics event once per order, on the order-confirmed
 * page. Sibling of TrackPageView — same "drop a client component into a server
 * page" trick.
 *
 * Why this exists: `purchase` is the last step of the product_view → cart_add →
 * purchase funnel in the admin and vendor dashboards, but nothing in the
 * storefront ever emitted it, so that bar read zero by construction no matter
 * how many orders were placed. (Revenue figures were never affected — the admin
 * route sources money from the order module, not from these events.)
 *
 * ONCE PER ORDER, NOT ONCE PER MOUNT. The confirmation page is bookmarkable,
 * refreshable, and reachable from order history, and React re-runs effects on
 * remount — a naive mount-emit would inflate the funnel every time someone
 * revisited their receipt. sessionStorage keyed on the order id keeps it to one
 * event per browser session. Deliberately sessionStorage and not localStorage:
 * a lost event is a slightly low count, whereas a permanent client-side record
 * of every order id someone has ever bought is data we have no reason to keep.
 */
export function TrackPurchase({ order_id }: { order_id: string }) {
  useEffect(() => {
    if (!order_id) return

    const key = `co_purchase_tracked_${order_id}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, "1")
    } catch {
      // Private mode / storage disabled. Emitting a possible duplicate beats
      // dropping the signal entirely, so fall through rather than return.
    }

    track({
      event_type: "purchase",
      entity_type: "order",
      entity_id: order_id,
    })
  }, [order_id])

  return null
}
