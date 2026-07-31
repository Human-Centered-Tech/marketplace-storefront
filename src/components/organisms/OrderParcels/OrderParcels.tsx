import { Avatar } from "@/components/atoms"
import { Chat } from "../Chat/Chat"
import { retrieveCustomer } from "@/lib/data/customer"
import { retrieveOrderTracking, type OrderTracking } from "@/lib/data/orders"
import { OrderParcelItems } from "@/components/molecules/OrderParcelItems/OrderParcelItems"
import { OrderParcelStatus } from "@/components/molecules/OrderParcelStatus/OrderParcelStatus"
import { OrderParcelActions } from "@/components/molecules/OrderParcelActions/OrderParcelActions"
import { OrderParcelTracking } from "@/components/molecules/OrderParcelTracking/OrderParcelTracking"

// Is there anything to show in the tracking row? Either a live-tracked parcel,
// or a shipping label with a number (what the fallback <OrderTrack> renders).
const hasTracking = (order: any, tracking: OrderTracking[]) =>
  tracking.length > 0 ||
  (order?.fulfillments || []).some((f: any) => f?.labels?.length)

export const OrderParcels = async ({ orders }: { orders: any[] }) => {
  const user = await retrieveCustomer()

  // Live carrier status per order, fetched in parallel. retrieveOrderTracking
  // never throws (it returns [] on any failure), so a tracking-provider or
  // backend hiccup can't take the order page down with it.
  const tracking = await Promise.all(
    orders.map((order) => retrieveOrderTracking(order.id))
  )

  return (
    <>
      {orders.map((order, index) => (
        <div key={order.id} className="w-full mb-8">
          <div className="border rounded-sm p-4 bg-component-secondary font-semibold text-secondary uppercase">
            Order #{order.display_id}
          </div>
          <div className="border rounded-sm">
            <div className="p-4 border-b">
              <OrderParcelStatus order={order} />
            </div>
            <div className="p-4 border-b md:flex items-center justify-between">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <Avatar src={order.seller.photo} />
                <p className="text-primary">{order.seller.name}</p>
              </div>
              <Chat
                user={user}
                seller={order.seller}
                order_id={order.id}
                buttonClassNames="label-md text-action-on-secondary uppercase flex items-center gap-2"
              />
            </div>
            {/* Tracking gets its own row rather than living inside
                OrderParcelActions, so it stays visible after delivery — that
                component switches to the returns flow at `delivered` and the
                tracking block used to vanish exactly when a buyer wants to
                check where the parcel ended up.

                Gated on there being something to render, not on the
                fulfillment status: a vendor can legitimately ship with no
                tracking number ("this order has no tracking number" in the
                vendor form), and that must not leave an empty bordered row. */}
            {hasTracking(order, tracking[index]) && (
              <div className="p-4 border-b">
                <OrderParcelTracking order={order} tracking={tracking[index]} />
              </div>
            )}
            <div className="p-4 border-b">
              <OrderParcelItems
                items={order.items}
                currency_code={order.currency_code}
              />
            </div>
            <div className="p-4">
              <OrderParcelActions order={order} />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
