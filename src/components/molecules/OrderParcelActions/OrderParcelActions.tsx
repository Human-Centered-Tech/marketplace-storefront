import { OrderCancel } from "@/components/cells/OrderCancel/OrderCancel"
import { OrderReturn } from "@/components/cells/OrderReturn/OrderReturn"

// Tracking used to render here for `shipped` orders. It now has its own row in
// OrderParcels (via OrderParcelTracking, which still falls back to the same
// <OrderTrack> block when there's no live carrier status) — so that a buyer
// can still see where a parcel went AFTER it's delivered, instead of the
// tracking disappearing the moment this switches to the returns flow.
export const OrderParcelActions = ({ order }: { order: any }) => {
  // if (order.status === "pending") return <OrderCancel order={order} />
  if (order.fulfillment_status === "delivered")
    return <OrderReturn order={order} />

  return null
}
