"use client"

import { useState } from "react"
import { Card } from "@/components/atoms"
import { CARRIERS, buildTrackingUrl } from "@/lib/carriers"

// Buyer-facing "track my package" block on the order page.
//
// The seller enters a tracking number at ship time and (since the carrier
// dropdown shipped) picks a carrier, stored on order.metadata.carrier. When we
// know the carrier we link straight to the carrier's tracking page. When we
// don't (older orders, or the seller chose "Other"), we show a small carrier
// picker so the buyer can still open the right tracking page — instead of the
// old broken link that used the bare tracking number as the href.
export const OrderTrack = ({ order }: { order: any }) => {
  const labels = order?.fulfillments?.[0]?.labels
  if (!labels?.length) return null

  const carrier: string | undefined = order?.metadata?.carrier

  return (
    <div>
      <h2 className="text-primary label-lg uppercase">Order Tracking</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {labels.map((item: any) => (
          <li key={item.id}>
            <TrackRow
              trackingNumber={item.tracking_number}
              trackingUrl={item.tracking_url}
              carrier={carrier}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

const TrackRow = ({
  trackingNumber,
  trackingUrl,
  carrier,
}: {
  trackingNumber: string
  trackingUrl?: string
  carrier?: string
}) => {
  const [picked, setPicked] = useState("")

  // Prefer the real carrier URL stored on the label (newer orders), then the
  // carrier the seller selected, then the buyer's manual pick. Guard against the
  // legacy "#" placeholder and bare tracking numbers used as URLs.
  const storedUrl =
    trackingUrl && /^https?:\/\//i.test(trackingUrl) ? trackingUrl : null
  const knownUrl = storedUrl || buildTrackingUrl(carrier, trackingNumber)
  const pickedUrl = buildTrackingUrl(picked, trackingNumber)

  if (knownUrl) {
    return (
      <a href={knownUrl} target="_blank" rel="noopener noreferrer">
        <Card className="px-4 py-3 hover:bg-secondary/30 flex items-center justify-between gap-4">
          <span className="font-medium break-all">{trackingNumber}</span>
          <span className="text-primary text-sm whitespace-nowrap">
            Track package →
          </span>
        </Card>
      </a>
    )
  }

  return (
    <Card className="px-4 py-3 flex flex-col gap-2">
      <span className="font-medium break-all">{trackingNumber}</span>
      <span className="text-secondary text-sm">
        Select your shipping carrier to track this package:
      </span>
      <div className="flex items-center gap-2">
        <select
          value={picked}
          onChange={(e) => setPicked(e.target.value)}
          className="border border-secondary/40 rounded-md px-2 py-1.5 text-sm"
        >
          <option value="">Choose carrier…</option>
          {CARRIERS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <a
          href={pickedUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!pickedUrl}
          onClick={(e) => {
            if (!pickedUrl) e.preventDefault()
          }}
          className={`rounded-md px-3 py-1.5 text-sm ${
            pickedUrl
              ? "bg-primary text-white hover:opacity-90"
              : "bg-secondary/30 text-secondary pointer-events-none"
          }`}
        >
          Track
        </a>
      </div>
    </Card>
  )
}
