// Single source of truth for a directory tier -> public badge (label + color).
//
// This replaces two divergent maps that disagreed for the SAME tier: the home
// "From the Directory" preview labeled the enterprise tier "Pillar Founding
// Member" while the directory search page labeled it "Enterprise" — which is
// the "badges are off and weird throughout the directory" Brooke flagged.
// Change a label here once and it updates everywhere (home preview, search
// cards, map).
//
// NOTE (taxonomy decision pending): the directory currently carries TWO
// overlapping tier vocabularies — the original verified/featured/enterprise and
// the newer "Canva" local / tier2_* / tier3 / tier4 / merchant set. Both are
// mapped below so nothing renders blank. Settling on ONE canonical set and the
// final public names is a product call for Brooke; until then this at least
// keeps the labels consistent.

export type TierBadgeColor = "gold" | "navy" | "outline"
export type TierBadge = { label: string; color: TierBadgeColor }

const TIER_BADGES: Record<string, TierBadge> = {
  // Canva tier set
  local: { label: "Local", color: "outline" },
  merchant: { label: "Merchant", color: "outline" },
  tier2_startup: { label: "Tier 2", color: "navy" },
  tier2_nonprofit: { label: "Tier 2", color: "navy" },
  tier2_business: { label: "Tier 2", color: "navy" },
  tier3: { label: "Tier 3", color: "gold" },
  tier4: { label: "Tier 4", color: "gold" },
  // Original/legacy set
  enterprise: { label: "Enterprise", color: "gold" },
  featured: { label: "Featured", color: "navy" },
  verified: { label: "Verified", color: "navy" },
}

// A recognized tier wins; a claimed + approved listing with no special tier
// falls back to "Verified"; anything else (e.g. unclaimed) returns null so the
// caller can omit the badge.
export function getTierBadge(
  tier?: string | null,
  verificationStatus?: string | null
): TierBadge | null {
  if (tier && TIER_BADGES[tier]) return TIER_BADGES[tier]
  if (verificationStatus === "approved") {
    return { label: "Verified", color: "navy" }
  }
  return null
}

// Tailwind classes per semantic color, for callers that render their own pill.
export const tierBadgeColorClass: Record<TierBadgeColor, string> = {
  gold: "bg-gold text-navy-dark",
  navy: "bg-navy-dark text-white",
  outline: "bg-white text-navy-dark border border-navy-dark",
}
