import { SellerTabs } from "@/components/organisms"
import { SellerPageHeader } from "@/components/sections"
import { retrieveCustomer } from "@/lib/data/customer"
import { getRegion } from "@/lib/data/regions"
import { getSellerByHandle } from "@/lib/data/seller"
import { SellerProps } from "@/types/seller"

export default async function SellerPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params

  const seller = (await getSellerByHandle(handle)) as SellerProps

  const user = await retrieveCustomer()

  const currency_code = (await getRegion(locale))?.currency_code || "usd"

  const tab = "products"

  if (!seller) {
    return null
  }

  return (
    <main className="flex flex-col items-center text-[#1b1c1a]">
      <SellerPageHeader seller={seller} user={user} />

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
        />
      </div>
    </main>
  )
}
