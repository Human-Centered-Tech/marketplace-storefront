export type ProductOrService = "product" | "service"

export type ScreeningMethod =
  | "home_auto_health_commercial"
  | "ave_maria_funds"
  | "catholic_financial_life"
  | "catholic_life_insurance"
  | "catholic_order_of_foresters"
  | "catholic_united_financial"
  | "knights_of_columbus"
  | "independent_faith_based"
  | "charles_schwab"
  | "edward_jones"
  | "fidelity"
  | "vanguard"
  | "other_secular_brokerage"

export type YearsRange = "0-3" | "4-7" | "8-10" | "11+"
export type RevenueRange = "<$50,000" | "$50,000-$100,000" | ">$100,000" | ">$250,000"
export type EmployeeRange = "1" | "2-5" | "6-10" | "11-20" | "21+"
export type InvoiceRange =
  | "$0-$250"
  | "$250-$500"
  | "$500-$1,500"
  | "$1,500-$3,000"
  | "$3,000+"

export type SizingAnswers = {
  isNonProfit: boolean
  years?: YearsRange
  revenueOrBudget?: RevenueRange
  employees?: EmployeeRange
  category?: string
  avgInvoice?: InvoiceRange
}

export type RecommendedTierKey =
  | "local"
  | "merchant"
  | "tier2_startup"
  | "tier2_nonprofit"
  | "tier2_business"
  | "tier3"
  | "tier4"

export type TierInfo = {
  key: RecommendedTierKey
  name: string
  price: string
  period: string
  bookCallOption: boolean
  upsellTier?: RecommendedTierKey
  localBoostUpsell: boolean
}

export type FunnelStep =
  | "service_area"
  | "product_or_service"
  | "service_is_financial"
  | "financial_screening"
  | "financial_preapproved"
  | "financial_book_call"
  | "service_for_profit"
  | "sizing_quiz"
  | "recommended_tier"

export type FunnelState = {
  step: FunnelStep
  serviceAreaIsLocalOnly?: boolean
  productOrService?: ProductOrService
  isFinancial?: boolean
  screeningMethod?: ScreeningMethod
  isNonProfit?: boolean
  sizing?: SizingAnswers
  recommendedTier?: RecommendedTierKey
}
