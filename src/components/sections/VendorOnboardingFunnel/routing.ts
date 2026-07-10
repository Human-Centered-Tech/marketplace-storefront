import {
  RecommendedTierKey,
  ScreeningMethod,
  SizingAnswers,
  TierInfo,
} from "./types"

const PRE_APPROVED_SCREENING: ScreeningMethod[] = [
  "home_auto_health_commercial",
  "ave_maria_funds",
  "catholic_financial_life",
  "catholic_life_insurance",
  "catholic_order_of_foresters",
  "catholic_united_financial",
  "knights_of_columbus",
]

export function isPreApprovedScreening(method: ScreeningMethod): boolean {
  return PRE_APPROVED_SCREENING.includes(method)
}

export const SCREENING_OPTIONS: { value: ScreeningMethod; label: string }[] = [
  { value: "home_auto_health_commercial", label: "Home / Auto / Health / Commercial Insurance" },
  { value: "ave_maria_funds", label: "Ave Maria Funds" },
  { value: "catholic_financial_life", label: "Catholic Financial Life" },
  { value: "catholic_life_insurance", label: "Catholic Life Insurance" },
  { value: "catholic_order_of_foresters", label: "Catholic Order of Foresters" },
  { value: "catholic_united_financial", label: "Catholic United Financial" },
  { value: "knights_of_columbus", label: "Knights of Columbus" },
  { value: "independent_faith_based", label: "Independent, Faith-Based Screening Process" },
  { value: "charles_schwab", label: "Charles Schwab" },
  { value: "edward_jones", label: "Edward Jones" },
  { value: "fidelity", label: "Fidelity" },
  { value: "vanguard", label: "Vanguard" },
  { value: "other_secular_brokerage", label: "Other Secular / Mainstream Financial Brokerage" },
]

const TIER_INFO: Record<RecommendedTierKey, TierInfo> = {
  local: {
    key: "local",
    name: "Catholic Owned Local",
    price: "$99",
    period: "/ yr",
    bookCallOption: false,
    // Local Boost is a local-tier-only add-on (Brooke 7/10) — every other
    // tier must keep this false so the upsell never renders off the local
    // flow.
    localBoostUpsell: true,
  },
  merchant: {
    key: "merchant",
    name: "Marketplace Merchant Membership",
    price: "$99",
    period: "/ yr + 11% per sale",
    bookCallOption: false,
    localBoostUpsell: false,
  },
  tier2_startup: {
    key: "tier2_startup",
    name: "Tier 2 — Startup",
    price: "$349",
    period: "onboarding",
    bookCallOption: true,
    localBoostUpsell: false,
  },
  tier2_nonprofit: {
    key: "tier2_nonprofit",
    name: "Tier 2 — Non-profit",
    price: "$349",
    period: "onboarding",
    bookCallOption: true,
    localBoostUpsell: false,
  },
  tier2_business: {
    key: "tier2_business",
    name: "Tier 2",
    price: "$699",
    period: "onboarding",
    bookCallOption: true,
    // Show "Tier 3 ($2,999) also available" on the $699 card — one price up
    // front, next tier noted, never the full list (Brooke 6/26).
    upsellTier: "tier3",
    localBoostUpsell: false,
  },
  tier3: {
    key: "tier3",
    name: "Tier 3",
    price: "$2,999",
    period: "onboarding",
    bookCallOption: true,
    upsellTier: "tier4",
    localBoostUpsell: false,
  },
  tier4: {
    key: "tier4",
    name: "Tier 4",
    price: "$10,000",
    period: "onboarding",
    bookCallOption: true,
    localBoostUpsell: false,
  },
}

export function getTierInfo(key: RecommendedTierKey): TierInfo {
  return TIER_INFO[key]
}

export function recommendTier(answers: SizingAnswers): RecommendedTierKey {
  const isLargeInvoice =
    answers.avgInvoice === "$1,500-$3,000" || answers.avgInvoice === "$3,000+"
  const isHighRevenue = answers.revenueOrBudget === ">$250,000"

  if (answers.isNonProfit) {
    const isSmallNonProfit =
      (answers.revenueOrBudget === "<$50,000" ||
        answers.revenueOrBudget === "$50,000-$100,000") &&
      answers.years === "0-3" &&
      answers.employees === "1"

    if (isSmallNonProfit) return "tier2_nonprofit"
    if (isHighRevenue || isLargeInvoice) return "tier3"
    return "tier2_nonprofit"
  }

  // For-profit branch.
  //
  // The $349 Tier 2 Startup discount mirrors Tier 2 Nonprofit — same
  // price, same benefits, different audience. Per the Canva "Sales Page
  // Logic" chart's Possible Combinations #1 (paired with combo #2 above
  // for the nonprofit case), the qualifying for-profit profile is:
  //   - 0-3 years in business
  //   - annual revenue <$50,000
  //   - 1 employee
  // All three required; same posture as isSmallNonProfit. Must fire
  // before the Tier 3 / Tier 2 Business split below or those will
  // catch the same vendor at a higher price.
  const isEarlyStageForProfit =
    answers.years === "0-3" &&
    answers.revenueOrBudget === "<$50,000" &&
    answers.employees === "1"
  if (isEarlyStageForProfit) return "tier2_startup"

  if (isLargeInvoice || isHighRevenue) return "tier3"
  return "tier2_business"
}
