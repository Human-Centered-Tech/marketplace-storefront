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
  subscription_tier: "verified" | "featured" | "enterprise"
  subscription_status: "active" | "expired" | "cancelled" | "pending"
  stripe_subscription_id: string | null
  subscription_expires_at: string | null
  verification_status: "pending" | "approved" | "rejected"
  verified_by: string | null
  verified_at: string | null
  owner_id: string
  vendor_id: string | null
  contact_email: string | null
  contact_phone: string | null
  website_url: string | null
  address: {
    street?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  } | null
  social_links: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  } | null
  hours: Record<string, { open: string; close: string }> | null
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
