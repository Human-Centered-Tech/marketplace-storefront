// Single source of truth for a directory tier -> public badge (label + color).
//
// Canonical taxonomy (Brooke 7/6, "get rid of Verified everywhere"): the five
// public badges are Enterprise / Featured / Essential / Merchant / Local, plus
// "Unclaimed" for owner-less listings (handled at the call site, not here).
//
// The badge is derived from TWO columns:
//   - subscription_tier: the visibility tier (verified | featured | enterprise)
//     — drives Algolia ranking + parish limits.
//   - pricing_tier: the Canva billing plan (local | merchant | tier2_* | tier3
//     | tier4) — distinguishes a plain "verified" listing (Essential) from a
//     Merchant (product seller) or Local (local-only service) listing, which
//     otherwise all share subscription_tier=verified.
//
// "Verified" is intentionally NOT a label anymore — a claimed+approved listing
// with no premium tier reads as "Essential".

export type TierBadgeColor = "gold" | "navy" | "outline"
export type TierBadge = { label: string; color: TierBadgeColor }

// A recognized tier wins; a claimed + approved listing with no special tier
// falls back to "Essential"; anything else (e.g. unclaimed) returns null so the
// caller can omit the badge.
export function getTierBadge(
  tier?: string | null,
  verificationStatus?: string | null,
  pricingTier?: string | null
): TierBadge | null {
  const t = tier ?? ""
  const p = pricingTier ?? ""

  if (t === "enterprise" || t === "tier3" || t === "tier4") {
    return { label: "Enterprise", color: "gold" }
  }
  if (
    t === "featured" ||
    t === "tier2_startup" ||
    t === "tier2_nonprofit" ||
    t === "tier2_business"
  ) {
    return { label: "Featured", color: "navy" }
  }
  // Verified-level plans. subscription_tier is normally "verified" for these,
  // with pricing_tier carrying the distinction; check both defensively.
  if (t === "merchant" || p === "merchant") {
    return { label: "Merchant", color: "navy" }
  }
  if (t === "local" || p === "local") {
    return { label: "Local", color: "navy" }
  }
  if (t === "verified" || verificationStatus === "approved") {
    return { label: "Essential", color: "navy" }
  }
  return null
}

// Tailwind classes per semantic color, for callers that render their own pill.
export const tierBadgeColorClass: Record<TierBadgeColor, string> = {
  gold: "bg-gold text-navy-dark",
  navy: "bg-navy-dark text-white",
  outline: "bg-white text-navy-dark border border-navy-dark",
}
