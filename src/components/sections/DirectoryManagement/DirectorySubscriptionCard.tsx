"use client"

// These ids are BILLING tiers (pricing_tier) and must stay in the "modern"
// vocabulary — the keys the backend resolves to a real Stripe price ID via
// STRIPE_PRICE_DIRECTORY_*. The legacy ids (verified/featured/enterprise) are
// NOT in that map: they used to fall through to a hardcoded auto-created price
// and charged $50/$400/$2,000 while this page and checkout advertised the
// current rates. Nobody was ever billed through it (verified on prod 2026-07-14
// — zero legacy pricing_tier rows), but every "go live" and "upgrade" button in
// the product lands here, so the 96 pending listings would have been.
//
// Keep this list in step with the claim funnel's (ClaimListingStart.tsx) — the
// two surfaces sell the same thing and drifted apart once already.
const tiers = [
  {
    id: "local",
    name: "Catholic Owned® Local",
    price: "$99/year",
    parishes: 1,
    features: [
      "Local service listing",
      "1 parish affiliation",
      "Search visibility",
    ],
  },
  {
    id: "tier2_business",
    name: "Featured",
    price: "$699/year",
    parishes: 3,
    features: [
      "Featured placement",
      "3 parish affiliations",
      "Priority search ranking",
      "Catholic Owned®-funded ads",
      "Analytics dashboard",
    ],
  },
  {
    id: "tier2_startup",
    name: "Featured — Startup",
    price: "$349/year",
    parishes: 3,
    features: [
      "Featured benefits at early-stage pricing",
      "3 parish affiliations",
      "Priority search ranking",
      "Analytics dashboard",
    ],
  },
  {
    id: "tier2_nonprofit",
    name: "Featured — Non-profit",
    price: "$349/year",
    parishes: 3,
    features: [
      "Featured benefits at non-profit pricing",
      "3 parish affiliations",
      "Priority search ranking",
      "Analytics dashboard",
    ],
  },
  {
    id: "tier3",
    name: "Enterprise",
    price: "$2,999/year",
    parishes: 10,
    features: [
      "Top placement",
      "10 parish affiliations",
      "Highest search priority",
      "Sales-team consultation",
      "Full analytics suite",
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
