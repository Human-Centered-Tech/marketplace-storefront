// Storefront copy of the carrier list + tracking-URL builder. The backend owns
// the canonical version (marketplace-backend/src/lib/carriers.ts) used to build
// the "Track package" link in the shipped email; separate builds, so this is
// duplicated. Keep the `value`s in sync.

export const CARRIERS: { value: string; label: string }[] = [
  { value: "usps", label: "USPS" },
  { value: "ups", label: "UPS" },
  { value: "fedex", label: "FedEx" },
  { value: "dhl", label: "DHL" },
]

// Build a carrier tracking-page deep link from a carrier value + tracking
// number. Returns null for a missing/unknown carrier or empty number — callers
// fall back to the "pick a carrier" UI. Whitespace in the number is stripped
// (vendors often type the grouped "9400 1000 …" form).
export function buildTrackingUrl(
  carrier: string | null | undefined,
  trackingNumber: string | null | undefined
): string | null {
  const number = (trackingNumber || "").trim().replace(/\s+/g, "")
  if (!number) return null
  const n = encodeURIComponent(number)
  switch ((carrier || "").trim().toLowerCase()) {
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`
    case "ups":
      return `https://www.ups.com/track?tracknum=${n}`
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${n}`
    case "dhl":
      return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}`
    default:
      return null
  }
}
