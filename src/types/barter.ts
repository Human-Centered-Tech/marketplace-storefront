export type BarterListing = {
  id: string
  owner_id: string
  title: string
  description: string
  listing_type: "sell" | "trade" | "barter" | "free"
  price: number | null
  trade_terms: string | null
  condition: "new" | "like_new" | "good" | "fair" | "poor"
  category_id: string | null
  location: { city?: string; state?: string; zip?: string } | null
  status: "active" | "pending" | "sold" | "traded" | "expired" | "removed"
  moderation_status: "pending" | "approved" | "rejected"
  expires_at: string | null
  images?: BarterListingImage[]
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type BarterListingImage = {
  id: string
  url: string
  sort_order: number
}

export type BarterCategory = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  icon: string | null
  sort_order: number
}
