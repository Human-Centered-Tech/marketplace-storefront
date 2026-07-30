"use client"

import { useState } from "react"
import { AdditionalAttributeProps } from "@/types/product"
import { sanitizeHtml } from "@/lib/util/sanitize-html"

const tabs = ["Description", "Reviews", "Shipping & Return Policy"] as const
type Tab = (typeof tabs)[number]

/** A product review as the `*reviews` expansion returns it. */
export type ProductReview = {
  id: string
  rating: number
  customer_note: string | null
  seller_note: string | null
  created_at: string
  customer?: { first_name?: string | null; last_name?: string | null } | null
}

/** "First name + last initial." — the platform-wide review byline (Liam 7/8). */
const authorName = (review: ProductReview) => {
  const first = review.customer?.first_name?.trim() || ""
  const last = review.customer?.last_name?.trim() || ""
  return (
    [first, last ? `${last.charAt(0).toUpperCase()}.` : null]
      .filter(Boolean)
      .join(" ") || "Verified buyer"
  )
}

const Stars = ({ rate, size = 18 }: { rate: number; size?: number }) => (
  <div className="flex" aria-label={`${rate} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={star <= Math.round(rate) ? "#BE9B32" : "none"}
        stroke="#BE9B32"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
)

export const ProductDetailsTabs = ({
  description,
  shippingInfo,
  attributes,
  refundPolicy,
  reviews = [],
}: {
  description: string
  shippingInfo: string
  attributes: AdditionalAttributeProps[]
  // Seller-set return/refund policy (plain text). Null = none posted →
  // the tab shows a fallback prompting the buyer to message the seller.
  refundPolicy?: string | null
  // Reviews of THIS product (reference: 'product'). Previously the tab was a
  // hardcoded "No reviews yet" string, so product reviews written from the
  // mobile app were invisible on web no matter how many existed.
  reviews?: ProductReview[]
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("Description")

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0

  return (
    <section className="mb-16">
      {/* Tab navigation */}
      <div className="flex justify-center gap-8 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-sans text-sm uppercase tracking-widest transition-colors ${
              activeTab === tab
                ? "border-b-2 border-[#755b00] text-[#001435] font-semibold"
                : "text-[#75777f] hover:text-[#001435]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="relative bg-[#f4f4f0] rounded-2xl p-8 md:p-12 overflow-hidden">
        {/* Damask pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23755b00' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10">
          {activeTab === "Description" && (
            <div className="font-serif text-[#001435] leading-relaxed space-y-4">
              {description ? (
                <div
                  className="product-details prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
                />
              ) : (
                <p className="text-[#75777f] italic">
                  No description available for this product.
                </p>
              )}

              {attributes.length > 0 && (
                <div className="mt-8 pt-8 border-t border-[#755b00]/10">
                  <h4 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#755b00] mb-4">
                    Additional Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {attributes.map((attr) => (
                      <div key={attr.id} className="flex flex-col">
                        <span className="font-sans text-xs text-[#75777f] uppercase tracking-wider">
                          {attr.attribute.name}
                        </span>
                        <span className="font-serif text-[#001435]">
                          {attr.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "Reviews" && (
            <div className="font-serif text-[#001435] leading-relaxed">
              {reviews.length === 0 ? (
                <p className="text-[#75777f] italic">
                  No reviews yet. Be the first to share your experience with
                  this product.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl font-bold">
                      {averageRating.toFixed(1)}
                    </span>
                    <div>
                      <Stars rate={averageRating} />
                      <p className="font-sans text-sm text-[#75777f] mt-1">
                        {reviews.length}{" "}
                        {reviews.length === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-[#755b00]/10 pb-6 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-sans font-semibold text-sm">
                            {authorName(review)}
                          </span>
                          <Stars rate={review.rating} size={14} />
                        </div>
                        {review.customer_note && (
                          <p className="mt-2 whitespace-pre-line break-words">
                            {review.customer_note}
                          </p>
                        )}
                        {review.seller_note && (
                          <div className="mt-3 ml-4 border-l-2 border-[#BE9B32] pl-4">
                            <p className="font-sans text-xs uppercase tracking-widest text-[#755b00]">
                              Reply from the seller
                            </p>
                            <p className="mt-1 text-[#44474e] whitespace-pre-line break-words">
                              {review.seller_note}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "Shipping & Return Policy" && (
            <div className="font-serif text-[#001435] leading-relaxed space-y-4">
              <p>
                Shipping is included on all orders within the continental U.S. —
                there is no separate shipping charge at checkout.
              </p>
              <p>
                Ship times vary by item and seller. Message the seller if you
                need a specific delivery timeframe.
              </p>
              <div className="mt-6 pt-6 border-t border-[#755b00]/10">
                <h4 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#755b00] mb-3">
                  Return Policy
                </h4>
                {refundPolicy && refundPolicy.trim().length > 0 ? (
                  <p className="whitespace-pre-line">{refundPolicy}</p>
                ) : (
                  <p className="text-[#75777f]">
                    This seller hasn't posted a return policy. Message the
                    seller for their return terms before purchasing.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
