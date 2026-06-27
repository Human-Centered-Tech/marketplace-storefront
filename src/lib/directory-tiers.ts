// Single source of truth for a directory tier -> public badge (label + color).
//
// This replaces two divergent maps that disagreed for the SAME tier: the home
// "From the Directory" preview labeled the enterprise tier "Pillar Founding
// Member" while the directory search page labeled it "Enterprise" — which is
// the "badges are off and weird throughout the directory" Brooke flagged.
// Change a label here once and it updates everywhere (home preview, search
// cards, map).
//
// Canonical taxonomy (product decision, locked): the directory has ONE public
// tier vocabulary — Verified / Featured / Enterprise — plus "Unclaimed" for
// owner-less listings (handled at the call site, not here). The DB column
// `subscription_tier` is constrained to verified|featured|enterprise (see
// backend Migration20260521120000); the Canva billing tiers (local / merchant /
// tier2_* / tier3 / tier4) live in a separate `pricing_tier` column and never
// reach this badge map, so they are intentionally NOT keyed here.

export type TierBadgeColor = "gold" | "navy" | "outline"
export type TierBadge = { label: string; color: TierBadgeColor }

const TIER_BADGES: Record<string, TierBadge> = {
  verified: { label: "Verified", color: "navy" },
  featured: { label: "Featured", color: "navy" },
  enterprise: { label: "Enterprise", color: "gold" },
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
