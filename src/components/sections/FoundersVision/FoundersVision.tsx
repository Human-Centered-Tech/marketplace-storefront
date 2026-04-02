import Image from "next/image"

export function FoundersVision() {
  return (
    <section className="py-24 lg:py-32 w-full bg-[#f4f4f0] border-t border-[#F2CD69]/20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        {/* Left — The Angelus painting with gold quote overlay */}
        <div className="relative group flex justify-center">
          <div className="absolute -inset-6 bg-[#001435]/5 rounded-[2rem] -rotate-3" />
          <Image
            src="/images/the-angelus.jpg"
            alt="The Angelus by Jean-François Millet — two figures praying in a field at sunset"
            width={600}
            height={500}
            className="relative rounded-[2rem] w-full h-auto max-h-[600px] object-cover shadow-2xl"
          />
          {/* Gold quote overlay */}
          <div className="absolute -bottom-8 -right-8 bg-[#F2CD69] p-8 rounded-2xl shadow-xl max-w-xs hidden md:block">
            <p className="font-serif italic text-[#001435] leading-relaxed">
              &ldquo;Every transaction is an opportunity for mission.&rdquo;
            </p>
          </div>
        </div>

        {/* Right — Founder story */}
        <div className="space-y-8">
          <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-[#001435] font-bold">
            Our Heart &amp; Soul
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#001435] italic leading-tight">
            A Vision for the Marketplace
          </h2>
          <div className="space-y-6 text-lg text-[#44474e] leading-relaxed font-serif">
            <p>
              We founded Catholic Owned Marketplace with a simple yet profound
              realization: our daily spending is a powerful tool for building the
              Kingdom. By connecting faithful providers with intentional consumers,
              we aren&apos;t just transacting business&mdash;we&apos;re reinforcing our shared
              identity.
            </p>
            <p>
              We believe that every Catholic business owner is a pioneer in a new
              era of commerce&mdash;one where integrity, prayer, and excellence are
              the standard, not the exception.
            </p>
          </div>
          <div className="pt-8">
            <p className="font-serif text-3xl text-[#755b00] italic">
              The Thompson Family
            </p>
            <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-[#75777f] mt-2">
              Founders &amp; Stewards
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
