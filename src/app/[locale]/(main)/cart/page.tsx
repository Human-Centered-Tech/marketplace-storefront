import { Cart } from "@/components/sections"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Your sacred goods, curated with care.",
}

export default function CartPage({}) {
  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <h1 className="font-serif text-3xl lg:text-4xl font-bold text-primary mb-2">
        Shopping Cart
      </h1>
      <p className="text-[14px] text-secondary italic mb-8">
        Curating the finest Catholic craftsmanship.
      </p>
      <div className="grid grid-cols-12 gap-6">
        <Suspense fallback={<>Loading...</>}>
          <Cart />
        </Suspense>
      </div>
    </main>
  )
}
