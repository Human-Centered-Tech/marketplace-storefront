// Shown on a seller's public storefront page when the vendor has turned
// on vacation mode (store_status = INACTIVE + seller_storefront.is_on_vacation).
// Replaces the bare 404 a paused store would otherwise render, so shoppers
// understand the shop is temporarily away rather than gone.
export function VacationNotice({ sellerName }: { sellerName?: string }) {
  const name = sellerName?.trim() || "This shop"

  return (
    <main className="flex flex-col items-center justify-center text-center text-[#1b1c1a] px-6 py-24 min-h-[60vh]">
      <div className="text-5xl mb-6" aria-hidden="true">
        🌿
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold mb-3">
        {name} is taking a short break
      </h1>
      <p className="max-w-md text-[#5b6472] text-base leading-relaxed">
        This shop is temporarily on vacation and isn&apos;t accepting orders
        right now. Please check back soon — they&apos;ll be open again before
        long.
      </p>
      <div className="mt-8">
        <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-[#755b00]/40 to-transparent" />
      </div>
    </main>
  )
}
