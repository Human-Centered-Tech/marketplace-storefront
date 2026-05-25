import { Suspense } from "react"
import { ProductListingSkeleton } from "../ProductListingSkeleton/ProductListingSkeleton"
import { AlgoliaProductsListing, ProductListing } from "@/components/sections"
import { TabsContent, TabsList } from "@/components/molecules"
import { SellerReviewTab } from "@/components/cells"

const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY

export const SellerTabs = ({
  tab,
  seller_handle,
  seller_id,
  locale,
  currency_code,
  owner_preview,
  refund_policy,
}: {
  tab: string
  seller_handle: string
  seller_id: string
  locale: string
  currency_code: string
  // True when the requesting customer is the seller behind this handle
  // viewing their own draft store via ?preview=1. Drops the
  // store_status:ACTIVE Algolia filter so unpublished/inactive stores
  // are previewable. Always already verified server-side.
  owner_preview?: boolean
  // Plain-text policy the vendor published on the storefront-edit page.
  // Null = no policy → the policies tab is omitted entirely (no empty
  // tab for vendors who haven't filled it in).
  refund_policy?: string | null
}) => {
  const hasPolicy = Boolean(refund_policy && refund_policy.trim().length > 0)

  const tabsList = [
    { label: "products", link: `/sellers/${seller_handle}/` },
    {
      label: "reviews",
      link: `/sellers/${seller_handle}/reviews`,
    },
    ...(hasPolicy
      ? [{ label: "policies", link: `/sellers/${seller_handle}/policies` }]
      : []),
  ]

  return (
    <div>
      {/* Styled Tab Bar */}
      <div className="bg-[#f4f4f0] p-4 rounded-xl mb-8">
        <TabsList list={tabsList} activeTab={tab} />
      </div>

      <TabsContent value="products" activeTab={tab}>
        <Suspense fallback={<ProductListingSkeleton />}>
          {!ALGOLIA_ID || !ALGOLIA_SEARCH_KEY ? (
            <ProductListing showSidebar seller_id={seller_id} />
          ) : (
            <AlgoliaProductsListing
              locale={locale}
              seller_handle={seller_handle}
              currency_code={currency_code}
              owner_preview={owner_preview}
            />
          )}
        </Suspense>
      </TabsContent>
      <TabsContent value="reviews" activeTab={tab}>
        <Suspense>
          <SellerReviewTab seller_handle={seller_handle} />
        </Suspense>
      </TabsContent>
      {hasPolicy && (
        <TabsContent value="policies" activeTab={tab}>
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-[#d6d0c4]/40 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#001435] mb-4">
              Refund &amp; return policy
            </h2>
            <p className="text-[15px] text-[#001435] whitespace-pre-line leading-relaxed">
              {refund_policy}
            </p>
          </div>
        </TabsContent>
      )}
    </div>
  )
}
