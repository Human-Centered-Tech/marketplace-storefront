import { Card } from "@/components/atoms"
import { OrderTrack } from "@/components/cells/OrderTrack/OrderTrack"
import { CARRIERS } from "@/lib/carriers"
import type { OrderTracking } from "@/lib/data/orders"
import { format } from "date-fns"

/**
 * Buyer-facing parcel tracking on the order page.
 *
 * Two modes, one component:
 *  - LIVE: the parcel is registered with the tracking provider, so we show the
 *    current status, where it was last scanned, the estimated delivery date
 *    and the full checkpoint timeline — no need to leave the site.
 *  - FALLBACK: no live data (order shipped before live tracking existed, the
 *    provider isn't configured, or registration failed). Renders the original
 *    <OrderTrack> block — carrier deep-link, or a "pick your carrier" selector
 *    when the seller didn't record one. Nothing regresses.
 *
 * Server component: the timeline is a <details> disclosure, so the whole thing
 * ships zero client JS. Only the fallback's carrier picker is interactive.
 */

// Statuses that mean "stop showing this as in-flight".
const DONE = new Set(["delivered", "expired"])

const dotClass = (status: string) => {
  if (status === "delivered") return "bg-green-600"
  if (status === "exception" || status === "attempt_failed")
    return "bg-amber-500"
  if (status === "expired") return "bg-secondary/50"
  return "bg-primary"
}

const carrierLabel = (carrier: string | null) => {
  if (!carrier) return null
  const found = CARRIERS.find((c) => c.value === carrier.toLowerCase())
  // "other" is a real stored value but a meaningless label — omit it.
  return found?.label || null
}

const formatDate = (value: string | null | undefined, withTime = true) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return format(parsed, withTime ? "MMM d, yyyy 'at' h:mm a" : "MMM d, yyyy")
}

export const OrderParcelTracking = ({
  order,
  tracking,
}: {
  order: any
  tracking: OrderTracking[]
}) => {
  // Only parcels the provider is actually watching get the live treatment.
  // A row that exists but was never registered has nothing to say beyond the
  // number itself, which the fallback already renders better.
  const liveParcels = tracking.filter(
    (t) => t.live && t.status && t.status !== "pending"
  )

  if (!liveParcels.length) {
    return <OrderTrack order={order} />
  }

  return (
    <div>
      <h2 className="text-primary label-lg uppercase">Order Tracking</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {liveParcels.map((parcel) => (
          <li key={parcel.id}>
            <ParcelCard parcel={parcel} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const ParcelCard = ({ parcel }: { parcel: OrderTracking }) => {
  const carrier = carrierLabel(parcel.carrier)
  const isDone = DONE.has(parcel.status)
  const deliveredAt = formatDate(parcel.delivered_at)
  const eta = formatDate(parcel.expected_delivery_at, false)
  const lastScanAt = formatDate(parcel.last_checkpoint_at)

  // Newest first for reading; the API returns oldest-first.
  const timeline = [...(parcel.checkpoints || [])].reverse()

  return (
    <Card className="px-4 py-3 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block size-2.5 rounded-full shrink-0 ${dotClass(
              parcel.status
            )}`}
            aria-hidden
          />
          <div>
            <p className="font-medium text-primary">{parcel.status_label}</p>
            {parcel.last_checkpoint_message && !isDone && (
              <p className="text-secondary text-sm">
                {parcel.last_checkpoint_message}
                {parcel.last_checkpoint_location
                  ? ` — ${parcel.last_checkpoint_location}`
                  : ""}
              </p>
            )}
            {parcel.status === "delivered" && deliveredAt && (
              <p className="text-secondary text-sm">Delivered {deliveredAt}</p>
            )}
            {!isDone && eta && (
              <p className="text-secondary text-sm">
                Estimated delivery {eta}
              </p>
            )}
          </div>
        </div>

        {parcel.tracking_url && (
          <a
            href={parcel.tracking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm whitespace-nowrap hover:underline"
          >
            {carrier ? `${carrier} →` : "Track package →"}
          </a>
        )}
      </div>

      <p className="text-secondary text-sm break-all">
        {carrier ? `${carrier} · ` : ""}
        {parcel.tracking_number}
        {lastScanAt && !isDone ? ` · updated ${lastScanAt}` : ""}
      </p>

      {timeline.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-primary list-none hover:underline">
            <span className="group-open:hidden">
              Show all updates ({timeline.length})
            </span>
            <span className="hidden group-open:inline">Hide updates</span>
          </summary>
          <ol className="mt-3 flex flex-col gap-3 border-l border-secondary/30 pl-4">
            {timeline.map((checkpoint, index) => (
              <li key={`${checkpoint.at || "na"}-${index}`} className="text-sm">
                <p className="text-primary">
                  {checkpoint.message || checkpoint.label || "Update"}
                </p>
                <p className="text-secondary">
                  {[formatDate(checkpoint.at), checkpoint.location]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ol>
        </details>
      )}
    </Card>
  )
}
