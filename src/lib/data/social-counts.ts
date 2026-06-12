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
      // Short revalidate — the badges don't need second-level accuracy and
      // this keeps the count queries off the hot path.
      { cache: "force-cache", next: { revalidate: 60 } }
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
