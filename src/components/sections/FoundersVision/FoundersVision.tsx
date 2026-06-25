import Image from "next/image"

export function FoundersVision() {
  return (
    <section className="py-24 lg:py-32 w-full overflow-hidden bg-[#f4f4f0] border-t border-[#BE9B32]/20">
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
          {/* Gold-gradient quote box — Pope Benedict XVI, per Brooke */}
          <div className="absolute -bottom-8 -right-8 bg-gradient-to-br from-[#F2CD69] to-[#BE9B32] p-6 rounded-2xl shadow-xl max-w-sm hidden md:block">
            <p className="font-serif italic text-[#001435] text-sm leading-relaxed">
              &ldquo;It is good for people to realize that purchasing is always a
              moral &mdash; and not simply economic &mdash; act. Hence the
              consumer has a specific social responsibility, which goes
              hand-in-hand with the social responsibility of the enterprise.&rdquo;
            </p>
            <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#001435]/80 mt-3">
              &mdash; Pope Benedict XVI, Caritas in Veritate §66
            </p>
          </div>
        </div>

        {/* Right — Founder story */}
        <div className="space-y-8">
          <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-[#001435] font-bold">
            Our Heart &amp; Soul
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#001435] leading-tight">
            A Vision for the Marketplace
          </h2>
          <div className="space-y-6 text-lg text-[#44474e] leading-relaxed font-serif">
            <p>
              We founded Catholic Owned&reg; with a simple yet profound
              realization: our daily spending is a powerful tool for building the
              Kingdom when it is used with intention. By connecting faithful
              providers with intentional consumers across industries, we are doing
              more than transacting business. We are reinforcing our shared
              identity and helping Catholics support one another in everyday life.
            </p>
            <p>
              We believe every Catholic business owner is helping pioneer a new
              era of commerce, where integrity, prayer, and excellence are the
              standard, not the exception. And we believe empowered consumers can
              make a difference with every purchase.
            </p>
          </div>
          <div className="pt-8">
            <p className="font-serif text-3xl text-[#755b00] italic">
              The Onori Family
            </p>
            <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-[#75777f] mt-2">
              Founders
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
