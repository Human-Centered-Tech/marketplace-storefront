"use client"

import { useState } from "react"
import { AdditionalAttributeProps } from "@/types/product"

const tabs = ["Description", "Reviews", "Shipping Info"] as const
type Tab = (typeof tabs)[number]

export const ProductDetailsTabs = ({
  description,
  shippingInfo,
  attributes,
}: {
  description: string
  shippingInfo: string
  attributes: AdditionalAttributeProps[]
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("Description")

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
                  dangerouslySetInnerHTML={{ __html: description }}
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
              <p className="text-[#75777f] italic">
                No reviews yet. Be the first to share your experience with this
                product.
              </p>
            </div>
          )}

          {activeTab === "Shipping Info" && (
            <div className="font-serif text-[#001435] leading-relaxed space-y-4">
              <p>
                Free standard shipping on all orders within the continental U.S.
                Expedited shipping options are available at an additional cost.
                Orders typically ship within 3-5 business days.
              </p>
              <p>
                We offer a 30-day return policy. If you are not completely
                satisfied with your purchase, you can return the item for a full
                refund or exchange, provided it is in its original condition and
                packaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
