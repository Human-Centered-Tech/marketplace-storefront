import { Button } from "@/components/atoms"
import { CartEmpty, CartItems, CartSummary } from "@/components/organisms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { retrieveCart } from "@/lib/data/cart"
import CartPromotionCode from "../CartReview/CartPromotionCode"

export const Cart = async () => {
  const cart = await retrieveCart()

  // Pre-launch kill-switch: shoppers can still browse and build a cart, but
  // checkout is held back until we're ready for public sales. Flip
  // NEXT_PUBLIC_CHECKOUT_DISABLED=false (+ redeploy, it's inlined at build
  // time) to open checkout. Independent of the vendor PAYMENTS_DISABLED flags.
  const checkoutDisabled = process.env.NEXT_PUBLIC_CHECKOUT_DISABLED === "true"

  if (!cart || !cart.items?.length) {
    return <CartEmpty />
  }

  return (
    <>
      <div className="col-span-12 lg:col-span-7">
        <CartItems cart={cart} />
      </div>
      <div className="lg:col-span-1"></div>
      <div className="col-span-12 lg:col-span-4">
        <div className="sticky top-24">
          <div className="bg-[rgba(var(--neutral-0))] border border-[rgba(var(--neutral-100))] rounded-sm p-5 mb-4">
            <h3 className="font-serif text-lg font-semibold text-primary mb-4 uppercase tracking-[0.05em]">
              Order Summary
            </h3>
            <CartPromotionCode cart={cart} />
          </div>
          <div className="bg-[rgba(var(--neutral-0))] border border-[rgba(var(--neutral-100))] rounded-sm p-5">
            <CartSummary
              item_total={cart?.item_subtotal || 0}
              shipping_total={cart?.shipping_subtotal || 0}
              total={cart?.total || 0}
              currency_code={cart?.currency_code || ""}
              tax={cart?.tax_total || 0}
              discount_total={cart?.discount_total || 0}
            />
            {checkoutDisabled ? (
              <div className="mt-4">
                <Button
                  disabled
                  className="w-full py-3.5 flex justify-center items-center bg-navy text-white uppercase tracking-[0.1em] text-[13px] font-semibold opacity-50 cursor-not-allowed hover:bg-navy"
                >
                  Proceed to Checkout
                </Button>
                <p className="text-center text-xs text-secondary mt-2">
                  Checkout coming soon
                </p>
              </div>
            ) : (
              <LocalizedClientLink href="/checkout?step=address">
                <Button className="w-full py-3.5 flex justify-center items-center bg-navy text-white hover:bg-navy-dark uppercase tracking-[0.1em] text-[13px] font-semibold mt-4">
                  Proceed to Checkout
                </Button>
              </LocalizedClientLink>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
