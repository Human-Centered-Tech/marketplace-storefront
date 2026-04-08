import {
  CartItemsFooter,
  CartItemsHeader,
  CartItemsProducts,
} from "@/components/cells"
import { HttpTypes } from "@medusajs/types"
import { EmptyCart } from "./EmptyCart"

export const CartItems = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  if (!cart) return null

  const groupedItems: any = groupItemsBySeller(cart)

  if (!Object.keys(groupedItems).length) return <EmptyCart />

  return Object.keys(groupedItems).map((key) => (
    <div key={key} className="mb-6 border border-[rgba(var(--neutral-100))] rounded-sm overflow-hidden">
      <div className="p-5 border-b border-[rgba(var(--neutral-100))]">
        <CartItemsHeader seller={groupedItems[key]?.seller} />
      </div>
      <div className="p-5">
        <CartItemsProducts
          products={groupedItems[key].items || []}
          currency_code={cart.currency_code}
        />
      </div>
      <div className="p-5 border-t border-[rgba(var(--neutral-100))] bg-[rgba(var(--neutral-25))]">
        <CartItemsFooter
          currency_code={cart.currency_code}
          price={cart.shipping_subtotal}
        />
      </div>
    </div>
  ))
}

function groupItemsBySeller(cart: HttpTypes.StoreCart) {
  const groupedBySeller: any = {}

  cart.items?.forEach((item: any) => {
    const seller = item.product?.seller
    if (seller) {
      if (!groupedBySeller[seller.id]) {
        groupedBySeller[seller.id] = {
          seller: seller,
          items: [],
        }
      }
      groupedBySeller[seller.id].items.push(item)
    } else {
      if (!groupedBySeller["catholic-owned"]) {
        groupedBySeller["catholic-owned"] = {
          seller: {
            name: "Catholic Owned",
            id: "catholic-owned",
            photo: "/Logo.png",
            created_at: new Date(),
          },
          items: [],
        }
      }
      groupedBySeller["catholic-owned"].items.push(item)
    }
  })

  return groupedBySeller
}
