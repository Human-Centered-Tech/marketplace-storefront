import { Product } from "./product"

type SellerAddress = {
  address_line?: string
  city?: string
  country_code?: string
  postal_code?: string
}

export type SellerProps = SellerAddress & {
  id: string
  name: string
  handle: string
  description: string
  photo: string
  tax_id: string
  created_at: string
  reviews?: any[]
  products?: Product[]
  email?: string
  store_status?: "ACTIVE" | "SUSPENDED" | "INACTIVE"
  // Storefront hero/banner image. Fetched from the seller_storefront
  // companion module on the Catholic Owned backend (not part of
  // Mercur's seller schema). Null when the vendor hasn't uploaded one.
  cover_image_url?: string | null
  // Plain-text refund / return policy the vendor publishes on their
  // storefront. Same source as cover_image_url. Null = no policy
  // posted; the storefront simply doesn't render the section.
  refund_policy?: string | null
}
