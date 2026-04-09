import {
  ProductDetailsHeader,
} from "@/components/cells"

import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { listMyRegistries } from "@/lib/data/registry"
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

  return (
    <div className="space-y-6">
      <ProductDetailsHeader
        product={product}
        locale={locale}
        user={user}
        wishlist={wishlist}
        registries={registries}
      />
    </div>
  )
}
