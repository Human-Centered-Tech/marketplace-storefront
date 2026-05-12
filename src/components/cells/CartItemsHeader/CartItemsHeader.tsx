import { SingleProductSeller } from "@/types/product"
import { SellerAvatar } from "../SellerAvatar/SellerAvatar"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const CartItemsHeader = ({
  seller,
}: {
  seller: SingleProductSeller
}) => {
  return (
    <LocalizedClientLink href={`/sellers/${seller.handle}`}>
      <div className="flex gap-4 items-center">
        <SellerAvatar photo={seller.photo} size={32} alt={seller.name} />
        <p className="uppercase heading-xs">{seller.name}</p>
      </div>
    </LocalizedClientLink>
  )
}
