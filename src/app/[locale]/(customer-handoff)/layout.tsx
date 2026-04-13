import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import Image from "next/image"

export default function CustomerHandoffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header>
        <div className="relative w-full py-2 lg:px-8 px-4">
          <div className="flex items-center justify-center pl-4 lg:pl-0 w-full">
            <LocalizedClientLink href="/" className="text-2xl font-bold">
              <Image
                src="/Logo.png"
                width={160}
                height={90}
                alt="Catholic Owned"
                priority
              />
            </LocalizedClientLink>
          </div>
        </div>
      </header>
      {children}
    </>
  )
}
