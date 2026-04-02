import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { Button } from "@/components/atoms"

export const OrderConfirmedSection = ({
  order,
}: {
  order: HttpTypes.StoreOrder
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgba(var(--gold-400))] flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold text-primary mb-2">
          Thank You for Building the New Catholic Economy®
        </h1>
        <p className="text-[15px] text-secondary mb-8 italic">
          Your order is confirmed and your support is making a difference.
        </p>

        <div
          className="bg-[rgba(var(--neutral-0))] border border-[rgba(var(--neutral-100))] rounded-sm p-6 mb-8 text-left"
          data-testid="order-complete-container"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="label-sm text-secondary">Order Number</p>
              <p className="font-semibold text-primary">
                #{order.display_id}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[rgba(var(--gold-600))]">
              <span>📦</span>
              <span>3-5 Business Days via Faithful Logistics</span>
            </div>
          </div>

          <p className="text-[14px] text-secondary">
            Confirmation sent to{" "}
            <span className="font-semibold text-primary" data-testid="order-email">
              {order.email}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <LocalizedClientLink href="/categories">
            <Button className="bg-gold text-navy-dark hover:bg-gold-dark px-6 py-3 uppercase tracking-[0.08em] text-[13px] font-semibold">
              Continue Shopping
            </Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/user/orders">
            <Button className="bg-navy text-white hover:bg-navy-dark px-6 py-3 uppercase tracking-[0.08em] text-[13px] font-semibold">
              View My Orders
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
