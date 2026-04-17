import { Cart } from "@/components/sections"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Your sacred goods, curated with care.",
}

export default function CartPage({}) {
  return (
    <main className="bg-catholic-lace min-h-screen">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-10">
          <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">
            Your Selection
          </p>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-[#17294A]">
            Shopping Cart
          </h1>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <Suspense fallback={<>Loading...</>}>
            <Cart />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
