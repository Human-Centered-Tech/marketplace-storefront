import { SellerProps } from "@/types/seller"
import { sdk } from "../config"

export const getSellerByHandle = async (handle: string) => {
  return sdk.client
    .fetch<{ seller: SellerProps }>(`/store/seller/${handle}`, {
      query: {
        fields:
          "+created_at,+email,+reviews.seller.name,+reviews.rating,+reviews.customer_note,+reviews.seller_note,+reviews.created_at,+reviews.updated_at,+reviews.customer.first_name,+reviews.customer.last_name",
      },
      cache: "no-cache",
    })
    .then(async ({ seller }) => {
      // Fetch the vendor's storefront extension data from the Catholic-
      // Owned companion module (seller_storefront). Mercur's seller row
      // doesn't carry a cover or a refund policy — both live in our
      // companion table. One round trip returns both fields. Fail open:
      // an unreachable endpoint surfaces as null for each, the hero
      // falls back to the default banner, and the refund policy section
      // simply doesn't render.
      let cover_image_url: string | null = null
      let refund_policy: string | null = null
      try {
        const storefront = await sdk.client.fetch<{
          cover_image_url: string | null
          refund_policy: string | null
        }>(`/store/sellers/${handle}/storefront`, { cache: "no-cache" })
        cover_image_url = storefront?.cover_image_url ?? null
        refund_policy = storefront?.refund_policy ?? null
      } catch {
        cover_image_url = null
        refund_policy = null
      }

      const response = {
        ...seller,
        cover_image_url,
        refund_policy,
        reviews:
          seller.reviews
            ?.filter((item) => item !== null)
            .sort((a, b) => b.created_at.localeCompare(a.created_at)) ?? [],
      }

      return response as SellerProps
    })
    .catch(() => [])
}
