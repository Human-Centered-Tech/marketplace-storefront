import { SellerTabs } from "@/components/organisms"
import { SellerPageHeader } from "@/components/sections"
import { retrieveCustomer } from "@/lib/data/customer"
import { getRegion } from "@/lib/data/regions"
import { getSellerByHandle } from "@/lib/data/seller"
import { SellerProps } from "@/types/seller"
import { notFound } from "next/navigation"

// Per-tab seller page. Mirrors /sellers/[handle]/reviews — the only
// difference is tab="policies" so SellerTabs renders the refund policy
// pane. Returns 404 if the vendor hasn't posted a policy so the URL
// can't be guessed into rendering an empty card.
export default async function SellerPoliciesPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params

  const seller = (await getSellerByHandle(handle)) as SellerProps
  const currency_code = (await getRegion(locale))?.currency_code || "usd"
  const user = await retrieveCustomer()

  if (!seller || Array.isArray(seller) || seller.store_status !== "ACTIVE") {
    notFound()
  }

  if (!seller.refund_policy || !seller.refund_policy.trim()) {
    notFound()
  }

  return (
    <main className="flex flex-col items-center text-[#1b1c1a]">
      <SellerPageHeader seller={seller} user={user} />

      <div className="w-full max-w-7xl mx-auto px-8 my-8">
        <div className="flex items-center justify-center w-full">
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-[#755b00]/40 to-transparent" />
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-8 pb-24">
        <SellerTabs
          tab="policies"
          seller_id={seller.id}
          seller_handle={seller.handle}
          locale={locale}
          currency_code={currency_code}
          refund_policy={seller.refund_policy}
        />
      </div>
    </main>
  )
}
