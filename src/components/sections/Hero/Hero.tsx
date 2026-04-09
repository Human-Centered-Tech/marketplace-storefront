import Image from "next/image"
import Link from "next/link"

type HeroProps = {
  image: string
  heading: string
  paragraph: string
  buttons: { label: string; path: string }[]
}

export const Hero = ({ image, heading, paragraph, buttons }: HeroProps) => {
  return (
    <section className="w-full relative overflow-hidden">
      <div className="relative min-h-[400px] lg:min-h-[75vh]">
        {/* Full-bleed background image */}
        <Image
          src={decodeURIComponent(image)}
          fill
          alt={`Hero banner - ${heading}`}
          className="object-cover" style={{ objectPosition: "center 85%" }}
          priority
          fetchPriority="high"
          quality={80}
          sizes="100vw"
        />

        {/* Dark overlay — heavier at bottom-left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#001435]/75 via-[#001435]/40 to-transparent" />

        {/* Content — pinned to bottom-left */}
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="px-6 lg:px-16 pb-16 lg:pb-24 max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold text-white uppercase leading-[1.05] drop-shadow-lg mb-6">
              Building the New<br />
              <span className="italic">Catholic Economy</span>
              <sup className="text-[#BE9B32] text-[0.2em] relative top-[-1.2em] ml-[2px]">&reg;</sup>
            </h1>
            <p className="font-serif text-base lg:text-lg italic text-white/75 mb-10 max-w-xl drop-shadow leading-relaxed">
              {paragraph}
            </p>
            <div className="flex flex-wrap gap-4">
              {buttons.map(({ label, path }, i) => (
                <Link
                  key={path}
                  href={path}
                  className={`inline-flex items-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xs transition-colors ${
                    i === 0
                      ? "bg-[#BE9B32] text-[#001435] hover:bg-[#d4af4c] shadow-lg"
                      : "bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
