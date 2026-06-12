import { SellerProps } from "@/types/seller"
import { sdk } from "../config"

// Storefront-extension fields for a seller, sourced from the Catholic-
// Owned seller_storefront companion module. Mercur's seller row doesn't
// carry these. Callers use it both on the seller page hero (cover) and
// on the product page (refund_policy link near Add to Cart). Returns
// nulls for both fields on any fetch failure so callers can default
// the UI gracefully.
export const getSellerStorefrontByHandle = async (handle: string) => {
  try {
    const data = await sdk.client.fetch<{
      cover_image_url: string | null
      refund_policy: string | null
      is_on_vacation: boolean
    }>(`/store/sellers/${handle}/storefront`, { cache: "no-cache" })
    return {
      cover_image_url: data?.cover_image_url ?? null,
      refund_policy: data?.refund_policy ?? null,
      is_on_vacation: Boolean(data?.is_on_vacation),
    }
  } catch {
    return {
      cover_image_url: null,
      refund_policy: null,
      is_on_vacation: false,
    }
  }
}

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
      // companion table. Helper handles fail-open.
      const { cover_image_url, refund_policy, is_on_vacation } =
        await getSellerStorefrontByHandle(handle)

      const response = {
        ...seller,
        cover_image_url,
        refund_policy,
        is_on_vacation,
        reviews:
          seller.reviews
            ?.filter((item) => item !== null)
            .sort((a, b) => b.created_at.localeCompare(a.created_at)) ?? [],
      }

      return response as SellerProps
    })
    .catch(() => [])
}
