import { sdk } from "../config"

export type ProductSocialCounts = {
  cart_count: number
  wishlist_count: number
  registry_count: number
}

const EMPTY: ProductSocialCounts = {
  cart_count: 0,
  wishlist_count: 0,
  registry_count: 0,
}

// Engagement counts (active carts / wishlists / registries) behind the
// social-proof badges on the PDP. Backed by GET
// /store/products/:id/social-counts. Fails open to zeros so the badges simply
// don't render on any error.
export const getProductSocialCounts = async (
  productId: string
): Promise<ProductSocialCounts> => {
  try {
    const data = await sdk.client.fetch<ProductSocialCounts>(
      `/store/products/${productId}/social-counts`,
      // No caching — fetch the live count on every page load so the badge
      // reflects the current cart/wishlist/registry state (matches mobile,
      // which fetches fresh each time the screen opens).
      { cache: "no-store" }
    )
    return {
      cart_count: data?.cart_count ?? 0,
      wishlist_count: data?.wishlist_count ?? 0,
      registry_count: data?.registry_count ?? 0,
    }
  } catch {
    return EMPTY
  }
}
