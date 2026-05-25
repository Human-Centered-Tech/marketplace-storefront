import {
  ProductDetailsHeader,
} from "@/components/cells"

import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { listMyRegistries } from "@/lib/data/registry"
import { getSellerStorefrontByHandle } from "@/lib/data/seller"
import { AdditionalAttributeProps } from "@/types/product"
import { SellerProps } from "@/types/seller"
import { Wishlist } from "@/types/wishlist"
import { GiftRegistry } from "@/types/registry"
import { HttpTypes } from "@medusajs/types"

export const ProductDetails = async ({
  product,
  locale,
}: {
  product: HttpTypes.StoreProduct & {
    seller?: SellerProps
    attribute_values?: AdditionalAttributeProps[]
  }
  locale: string
}) => {
  const user = await retrieveCustomer()

  let wishlist: Wishlist[] = []
  let registries: GiftRegistry[] = []
  if (user) {
    try {
      const response = await getUserWishlists()
      wishlist = response.wishlists
    } catch {
      // Wishlist service unavailable — continue without it
    }
    try {
      const response = await listMyRegistries()
      registries = response.registries
    } catch {
      // Registry service unavailable — continue without it
    }
  }

  // Pull the vendor's storefront-extension data so the PDP can surface
  // the refund policy link next to Add to Cart (Etsy/Amazon-style:
  // policy at the purchase-decision moment). Null when the vendor
  // hasn't posted one — the link simply doesn't render.
  const sellerHandle = product.seller?.handle
  const sellerRefundPolicy = sellerHandle
    ? (await getSellerStorefrontByHandle(sellerHandle)).refund_policy
    : null

  return (
    <div className="space-y-6">
      <ProductDetailsHeader
        product={product}
        locale={locale}
        user={user}
        wishlist={wishlist}
        registries={registries}
        sellerRefundPolicy={sellerRefundPolicy}
      />
    </div>
  )
}
