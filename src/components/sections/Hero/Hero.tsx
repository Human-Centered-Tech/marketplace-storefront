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
      <div className="relative min-h-[400px] lg:min-h-[650px]">
        {/* Full-bleed background image */}
        <Image
          src={decodeURIComponent(image)}
          fill
          alt={`Hero banner - ${heading}`}
          className="object-cover object-center"
          priority
          fetchPriority="high"
          quality={80}
          sizes="100vw"
        />

        {/* Dark overlay — heavier at top for text, lighter at bottom for image */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#001435]/80 via-[#001435]/40 to-transparent" />

        {/* Content — pinned to top */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-12 lg:pt-16 max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 uppercase leading-[1.1] drop-shadow-lg">
            Building the New{" "}
            <span className="italic">Catholic Economy</span>
            <sup className="text-[#BE9B32] text-[0.25em] relative top-[-0.8em] ml-[2px]">&reg;</sup>
          </h1>
          <p className="font-serif text-lg italic text-white/80 mb-8 max-w-lg drop-shadow">
            {paragraph}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
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
    </section>
  )
}
