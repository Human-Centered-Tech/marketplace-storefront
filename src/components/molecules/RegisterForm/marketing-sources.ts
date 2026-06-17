// "How did you hear about us?" options. These MUST match the cf_marketing_source
// dropdown options configured in Freshworks exactly — the value is stored on
// customer.metadata.marketing_source and pushed verbatim to the CRM, where a
// mismatched string would land outside the dropdown. Keep in sync with Brooke's
// Freshworks config (see marketplace-backend/docs/freshworks-crm-mapping.md).
export const MARKETING_SOURCES = [
  "Affiliate",
  "App Store",
  "Article / Blog Post Online",
  "Event",
  "Influencer",
  "Organic Search Online",
  "Parish Bulletin / Email",
  "Podcast",
  "Radio",
  "Social Media",
  "Word of Mouth",
  "YouTube",
  "Outbound Sales Rep",
  "ChatGPT / Perplexity / Gemini or other AI",
  "Other",
] as const

export type MarketingSource = (typeof MARKETING_SOURCES)[number]
