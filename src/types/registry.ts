export type GiftRegistry = {
  id: string
  owner_id: string
  title: string
  description: string | null
  sacrament_type:
    | "wedding"
    | "baptism"
    | "first_communion"
    | "confirmation"
    | "ordination"
    | "other"
  event_date: string | null
  status: "active" | "closed" | "archived"
  sharing_token: string
  cover_image_url: string | null
  items: GiftRegistryItem[]
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type GiftRegistryItem = {
  id: string
  registry_id: string
  product_id: string
  variant_id: string | null
  product_title: string
  product_image: string | null
  quantity_desired: number
  quantity_purchased: number
  priority: number
  note: string | null
  metadata: Record<string, unknown> | null
}
