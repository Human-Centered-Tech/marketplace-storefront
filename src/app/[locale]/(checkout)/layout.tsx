import { Button } from "@/components/atoms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { CollapseIcon } from "@/icons"
import Image from "next/image"

export default async function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="bg-catholic-lace min-h-screen">
      <header className="border-b border-[#d6d0c4]/30">
        <div className="relative w-full py-3 lg:px-8 px-4">
          <div className="absolute top-3 left-4 lg:left-8">
            <LocalizedClientLink href="/cart">
              <Button variant="tonal" className="flex items-center gap-2">
                <CollapseIcon className="rotate-90" />
                <span className="hidden lg:block">Back to cart</span>
              </Button>
            </LocalizedClientLink>
          </div>
          <div className="flex items-center justify-center w-full">
            <LocalizedClientLink href="/">
              <Image
                src="/Logo.png"
                width={140}
                height={80}
                alt="Catholic Owned"
                priority
              />
            </LocalizedClientLink>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-8">
          <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">
            Secure Checkout
          </p>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-[#17294A]">
            Complete Your Order
          </h1>
        </div>
        {children}
      </div>
      <footer className="border-t border-[#d6d0c4]/30 py-6 text-center">
        <p className="text-[11px] text-[#44474e]">
          Catholic Owned &mdash; Building the New Catholic Economy&reg;
        </p>
      </footer>
    </div>
  )
}
