export type DirectoryCategory = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  sort_order: number
  description: string | null
}

export type Parish = {
  id: string
  name: string
  diocese: string
  city: string
  state: string
  address: Record<string, unknown> | null
}

export type DirectoryParishAffiliation = {
  id: string
  listing_id: string
  parish_id: string
  parish?: Parish
}

export type DirectoryBadge = {
  id: string
  name: string
  slug: string
  description: string | null
  icon_url: string | null
  color: string
  sort_order: number
}

export type DirectoryListingBadge = {
  id: string
  listing_id: string
  badge_id: string
  badge?: DirectoryBadge
}

export type DirectoryListing = {
  id: string
  business_name: string
  slug: string
  description: string | null
  category_id: string | null
  category?: DirectoryCategory
  // Many-to-many category set (primary + additional). category/category_id
  // stay the PRIMARY. `category_links` is the backend pivot relation;
  // `category_ids` comes from the Algolia hit (search results).
  category_ids?: string[]
  category_links?: Array<{
    category_id: string
    is_primary?: boolean
    category?: DirectoryCategory
  }>
  subscription_tier:
    | "verified"
    | "featured"
    | "enterprise"
    | "local"
    | "merchant"
    | "tier2_startup"
    | "tier2_nonprofit"
    | "tier2_business"
    | "tier3"
    | "tier4"
  // The Canva billing plan, distinct from subscription_tier (visibility tier).
  // Drives the Essential vs Merchant vs Local badge distinction for
  // verified-tier listings. Optional: unclaimed/legacy listings may lack it.
  pricing_tier?:
    | "local"
    | "merchant"
    | "tier2_startup"
    | "tier2_nonprofit"
    | "tier2_business"
    | "tier3"
    | "tier4"
    | null
  subscription_status: "active" | "expired" | "cancelled" | "pending"
  stripe_subscription_id: string | null
  subscription_expires_at: string | null
  verification_status: "pending" | "approved" | "rejected"
  verified_by: string | null
  verified_at: string | null
  owner_id: string | null
  vendor_id: string | null
  // Resolved by the GET /store/directory/listings/:id route, present ONLY
  // when the linked store's store_status === "ACTIVE" (a live storefront).
  // Use seller.handle to build the storefront link; absence means "no live
  // shop" and the "Visit Our Shop" CTA should not render.
  seller?: { id: string; handle: string } | null
  contact_email: string | null
  contact_phone: string | null
  website_url: string | null
  address: {
    full?: string
    street?: string
    city?: string
    state?: string
    zip?: string
    country?: string
    // Comma-separated 2-letter codes the business serves; drives the
    // directory state filter. Stored as a string; the picker works in arrays.
    serviced_states?: string
  } | null
  // Whether the listing's exact street-level location/pin is shown publicly on
  // the map. Nullable: null = use precise_location_default. Set/edited via the
  // owner's listing form.
  show_precise_location?: boolean | null
  // Owner-only hint returned on the owner's listing response: the default
  // checked state for the "show precise location" toggle (true when the
  // business is "local only"). Used only to seed the form's initial state.
  precise_location_default?: boolean
  social_links: {
    // New shape: up to 3 free-form URLs (platform detected per URL).
    links?: string[]
    // Legacy keyed shape, still read for back-compat.
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  } | null
  hours_of_operation: Record<string, { open: string; close: string }> | null
  always_open?: boolean
  owner_interview?: {
    photo_url?: string
    q1_prompt?: string
    q1_answer?: string
    q2_prompt?: string
    q2_answer?: string
    q3_prompt?: string
    q3_answer?: string
    q4_prompt?: string
    q4_answer?: string
  } | null
  devotional?: {
    image_url?: string
    question?: string
    answer?: string
  } | null
  cta_type?:
    | "visit_shop"
    | "book_now"
    | "shop_now"
    | "learn_more"
    | "book_a_call"
  cta_url?: string | null
  logo_url: string | null
  cover_image_url: string | null
  gallery_urls: string[] | null
  metadata: Record<string, unknown> | null
  affiliations?: DirectoryParishAffiliation[]
  badges?: DirectoryListingBadge[]
  created_at: string
  updated_at: string
}
