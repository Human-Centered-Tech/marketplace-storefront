"use client"

// Single-tier picker until the rest of the 2026-05 Canva tier ladder
// (local_boost, tier2_*, tier3, tier4) has live Stripe products + price
// IDs wired through STRIPE_PRICE_DIRECTORY_* env vars. The legacy
// verified/featured/enterprise options were retired with the new ladder
// but the UI still listed them — surfacing those caused vendors to
// pick a tier we no longer want to sell, and our $99 product was
// unreachable. Add the rest back here once the corresponding Stripe
// products + env vars exist in prod.
const tiers = [
  {
    id: "local",
    name: "Merchant Membership",
    price: "$99/year",
    parishes: 1,
    features: [
      "Public directory listing",
      "Sell products through the marketplace",
      "Owner interview + parish affiliation",
    ],
  },
]

type DirectorySubscriptionCardProps = {
  currentTier?: string
  subscriptionStatus?: string
  onSelectTier?: (tier: string) => void
  loading?: boolean
}

export const DirectorySubscriptionCard = ({
  currentTier,
  subscriptionStatus,
  onSelectTier,
  loading,
}: DirectorySubscriptionCardProps) => {
  return (
    <div>
      <div
        className={
          tiers.length === 1
            ? "max-w-md mx-auto"
            : "grid grid-cols-1 md:grid-cols-3 gap-4"
        }
      >
        {tiers.map((tier) => {
          const isCurrent = tier.id === currentTier
          return (
            <div
              key={tier.id}
              className={`border rounded-sm p-4 ${
                isCurrent ? "border-2 border-primary" : ""
              }`}
            >
              <h3 className="heading-sm text-primary">{tier.name}</h3>
              <p className="text-lg font-bold mt-1">{tier.price}</p>
              <ul className="mt-3 space-y-1">
                {tier.features.map((f) => (
                  <li key={f} className="text-sm text-secondary">
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                {isCurrent && subscriptionStatus === "active" ? (
                  <span className="text-sm text-green-700 font-medium">
                    Current Plan
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectTier?.(tier.id)}
                    disabled={loading}
                    className="bg-primary text-white px-4 py-2 rounded-sm text-sm uppercase font-medium w-full disabled:opacity-50"
                  >
                    {loading ? "..." : isCurrent ? "Renew" : "Select"}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
