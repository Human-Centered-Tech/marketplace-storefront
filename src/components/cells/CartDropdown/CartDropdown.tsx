"use client"

import { Badge, Button } from "@/components/atoms"
import { CartDropdownItem, Dropdown } from "@/components/molecules"
import { usePrevious } from "@/hooks/usePrevious"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { CartIcon, CloseIcon } from "@/icons"
import { convertToLocale } from "@/lib/helpers/money"
import { filterValidCartItems } from "@/lib/helpers/filter-valid-cart-items"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useCartContext } from "@/components/providers"

const getItemCount = (cart: HttpTypes.StoreCart | null) => {
  return cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
}

export const CartDropdown = () => {
  const { cart } = useCartContext()
  const [open, setOpen] = useState(false)
  // When opened by adding an item, the dropdown is "pinned": it stays until the
  // user explicitly closes it (X button or click outside), rather than closing
  // on mouse-leave like the transient hover preview does.
  const [pinned, setPinned] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = () => {
    setOpen(false)
    setPinned(false)
  }

  const previousItemCount = usePrevious(getItemCount(cart))
  const cartItemsCount = (cart && getItemCount(cart)) || 0
  const pathname = usePathname()

  // Filter out items with invalid data (missing prices/variants)
  const validItems = filterValidCartItems(cart?.items)

  const total = convertToLocale({
    amount: cart?.total || 0,
    currency_code: cart?.currency_code || "eur",
  })

  const delivery = convertToLocale({
    amount: cart?.shipping_subtotal || 0,
    currency_code: cart?.currency_code || "eur",
  })

  const tax = convertToLocale({
    amount: cart?.tax_total || 0,
    currency_code: cart?.currency_code || "eur",
  })

  const items = convertToLocale({
    amount: cart?.item_subtotal || 0,
    currency_code: cart?.currency_code || "eur",
  })

  // Close on click outside the dropdown ("click away").
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  useEffect(() => {
    if (
      previousItemCount !== undefined &&
      cartItemsCount > previousItemCount &&
      pathname.split("/")[2] !== "cart"
    ) {
      setOpen(true)
      setPinned(true)
    }
  }, [cartItemsCount, previousItemCount])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => {
        if (!pinned) setOpen(false)
      }}
    >
      <LocalizedClientLink
        href="/cart"
        className="relative"
        aria-label="Go to cart"
      >
        <CartIcon size={20} />
        {Boolean(cartItemsCount) && (
          <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0">
            {cartItemsCount}
          </Badge>
        )}
      </LocalizedClientLink>
      <Dropdown show={open}>
        <div className="lg:w-[460px] shadow-lg">
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="uppercase heading-md">Shopping cart</h3>
            <button
              type="button"
              onClick={close}
              aria-label="Close cart"
              className="text-secondary hover:text-primary"
            >
              <CloseIcon size={20} />
            </button>
          </div>
          <div className="p-4">
            {Boolean(cartItemsCount) ? (
              <div>
                <div className="overflow-y-scroll max-h-[360px] no-scrollbar">
                  {validItems.map((item) => (
                    <CartDropdownItem
                      key={`${item.product_id}-${item.variant_id}`}
                      item={item}
                      currency_code={cart?.currency_code || "eur"}
                    />
                  ))}
                </div>
                <div className="pt-4">
                  <div className="text-secondary flex justify-between items-center">
                    Items <p className="label-md text-primary">{items}</p>
                  </div>
                  <div className="text-secondary flex justify-between items-center">
                    Delivery <p className="label-md text-primary">{delivery}</p>
                  </div>
                  <div className="text-secondary flex justify-between items-center">
                    Tax <p className="label-md text-primary">{tax}</p>
                  </div>
                  <div className="text-secondary flex justify-between items-center">
                    Total <p className="label-xl text-primary">{total}</p>
                  </div>
                  <LocalizedClientLink href="/cart">
                    <Button className="w-full mt-4 py-3">Go to cart</Button>
                  </LocalizedClientLink>
                </div>
              </div>
            ) : (
              <div className="px-8">
                <h4 className="heading-md uppercase text-center">
                  Your shopping cart is empty
                </h4>
                <p className="text-lg text-center py-4">
                  Are you looging for inspiration?
                </p>
                <LocalizedClientLink href="/categories">
                  <Button className="w-full py-3">Explore Home Page</Button>
                </LocalizedClientLink>
              </div>
            )}
          </div>
        </div>
      </Dropdown>
    </div>
  )
}
