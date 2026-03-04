"use client"

const tiers = [
  {
    id: "verified",
    name: "Verified",
    price: "$50/year",
    parishes: 1,
    features: ["Basic listing", "1 parish affiliation", "Search visibility"],
  },
  {
    id: "featured",
    name: "Featured",
    price: "$400/year",
    parishes: 3,
    features: [
      "Featured placement",
      "3 parish affiliations",
      "Priority search ranking",
      "Analytics dashboard",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$2,000/year",
    parishes: 10,
    features: [
      "Top placement",
      "10 parish affiliations",
      "Highest search priority",
      "Full analytics suite",
      "Dedicated support",
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
