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
      // Fetch the vendor's cover image from the Catholic-Owned companion
      // module. Mercur's seller row only carries the logo (`photo`); the
      // hero banner lives in `seller_storefront`. Done as a separate
      // request because Mercur's /store/seller/:handle is owned upstream
      // and not extensible. Fail open: an unreachable endpoint or a
      // seller without an uploaded cover both surface as null and the
      // hero falls back to the default banner.
      let cover_image_url: string | null = null
      try {
        const storefront = await sdk.client.fetch<{
          cover_image_url: string | null
        }>(`/store/sellers/${handle}/storefront`, { cache: "no-cache" })
        cover_image_url = storefront?.cover_image_url ?? null
      } catch {
        cover_image_url = null
      }

      const response = {
        ...seller,
        cover_image_url,
        reviews:
          seller.reviews
            ?.filter((item) => item !== null)
            .sort((a, b) => b.created_at.localeCompare(a.created_at)) ?? [],
      }

      return response as SellerProps
    })
    .catch(() => [])
}
