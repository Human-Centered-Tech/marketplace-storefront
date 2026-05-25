import { SellerTabs } from "@/components/organisms"
import {
  SellerPageHeader,
  SellerCollectionsStrip,
} from "@/components/sections"
import { TrackPageView } from "@/components/sections/Analytics/TrackPageView"
import { retrieveCustomer } from "@/lib/data/customer"
import { getRegion } from "@/lib/data/regions"
import { getSellerByHandle } from "@/lib/data/seller"
import { retrieveVendorStatus } from "@/lib/data/vendor"
import { SellerProps } from "@/types/seller"
import { notFound } from "next/navigation"

export default async function SellerPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string; locale: string }>
  searchParams: Promise<{ preview?: string }>
}) {
  const { handle, locale } = await params
  const { preview } = await searchParams

  const seller = (await getSellerByHandle(handle)) as SellerProps

  const user = await retrieveCustomer()

  const currency_code = (await getRegion(locale))?.currency_code || "usd"

  const tab = "products"

  // Preview mode: only the seller themselves can view their own draft
  // store. We verify by matching the vendor cookie's seller_handle to
  // the URL handle — no public preview links, no token sharing.
  const isOwnerPreview = await (async () => {
    if (preview !== "1") return false
    const vendor = await retrieveVendorStatus()
    return Boolean(
      vendor.isVendor && vendor.sellerHandle && vendor.sellerHandle === handle
    )
  })()

  // getSellerByHandle returns `[]` on fetch error (preserved for back-compat);
  // also bail when the store is INACTIVE (vendor still in draft) or
  // SUSPENDED (admin-blocked) so non-live stores aren't browsable —
  // unless this is the seller previewing their own draft.
  if (!seller || Array.isArray(seller)) {
    notFound()
  }
  if (seller.store_status !== "ACTIVE" && !isOwnerPreview) {
    notFound()
  }

  return (
    <main className="flex flex-col items-center text-[#1b1c1a]">
      <TrackPageView entity_type="seller" entity_id={seller.id} />
      {isOwnerPreview && seller.store_status !== "ACTIVE" && (
        <div className="w-full bg-amber-50 border-b border-amber-300 text-amber-900 px-4 py-2 text-center text-sm">
          🚧 Previewing your draft store. Shoppers don't see this view.
        </div>
      )}
      <SellerPageHeader seller={seller} user={user} />

      <SellerCollectionsStrip handle={seller.handle} />

      {/* Decorative Divider */}
      <div className="w-full max-w-7xl mx-auto px-8 my-8">
        <div className="flex items-center justify-center w-full">
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-[#755b00]/40 to-transparent" />
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-8 pb-24">
        <SellerTabs
          tab={tab}
          seller_id={seller.id}
          seller_handle={seller.handle}
          locale={locale}
          currency_code={currency_code}
          owner_preview={isOwnerPreview}
          refund_policy={seller.refund_policy ?? null}
        />
      </div>
    </main>
  )
}
