// Client-side mirror of marketplace-backend/src/lib/directory-tier.ts
// (PRICING_TO_SUBSCRIPTION_TIER). Lets us derive the parish-affiliation limit
// from the owner's SELECTED membership (`recommended_tier`, a pricing tier
// stashed on customer.metadata) BEFORE a listing exists — so the create form's
// parish picker offers the right number of slots. The backend /affiliations
// endpoint remains authoritative and enforces the real cap on save.
const PRICING_TO_SUBSCRIPTION_TIER: Record<string, string> = {
  local: "verified",
  merchant: "verified",
  tier2_startup: "featured",
  tier2_nonprofit: "featured",
  tier2_business: "featured",
  tier3: "enterprise",
  tier4: "enterprise",
}

/**
 * Map a pricing tier (e.g. `recommended_tier`) to the visibility/subscription
 * tier that drives parish limits. Returns undefined for unknown/absent input,
 * which callers treat as the default (verified → 1 slot).
 */
export function subscriptionTierForPricing(
  pricingTier?: string | null
): string | undefined {
  if (!pricingTier) return undefined
  return PRICING_TO_SUBSCRIPTION_TIER[pricingTier]
}
