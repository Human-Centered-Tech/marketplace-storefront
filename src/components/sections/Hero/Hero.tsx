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
      {/* Background — navy with damask/cross pattern */}
      <div
        className="relative grid grid-cols-1 lg:grid-cols-2 min-h-[600px] lg:min-h-[870px]"
        style={{ backgroundColor: "#001435" }}
      >
        {/* Damask pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M39 5v14h2V5h-2zm0 56v14h2V61h-2zM5 39h14v2H5v-2zm56 0h14v2H61v-2z' fill='%23F2CD69' fill-opacity='0.5' fill-rule='evenodd'/%3E%3Ccircle cx='40' cy='40' r='2' fill='%23F2CD69' fill-opacity='0.3'/%3E%3Ccircle cx='40' cy='10' r='1' fill='%23F2CD69' fill-opacity='0.2'/%3E%3Ccircle cx='40' cy='70' r='1' fill='%23F2CD69' fill-opacity='0.2'/%3E%3Ccircle cx='10' cy='40' r='1' fill='%23F2CD69' fill-opacity='0.2'/%3E%3Ccircle cx='70' cy='40' r='1' fill='%23F2CD69' fill-opacity='0.2'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Left — Content */}
        <div className="relative z-10 flex flex-col justify-center px-6 lg:px-16 xl:px-24 py-12 lg:py-20">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-xl uppercase leading-[1.1]">
            Building the New{" "}
            <span className="italic">Catholic Economy</span>
            <sup className="text-[#BE9B32] text-[0.25em] relative top-[-0.8em] ml-[2px]">&reg;</sup>
          </h1>
          <p className="font-serif text-lg italic text-white/60 mb-10 max-w-md">
            {paragraph}
          </p>
          <div className="flex flex-wrap gap-4">
            {buttons.map(({ label, path }, i) => (
              <Link
                key={path}
                href={path}
                className={`inline-flex items-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xs transition-colors ${
                  i === 0
                    ? "bg-[#BE9B32] text-[#001435] hover:bg-[#e6c05a]"
                    : "bg-transparent border border-white/30 text-white hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right — Image */}
        <div className="relative lg:flex items-center justify-center p-8 lg:p-16 hidden">
          <div className="relative w-full h-full max-w-[600px] max-h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={decodeURIComponent(image)}
              fill
              alt={`Hero banner - ${heading}`}
              className="object-cover"
              priority
              fetchPriority="high"
              quality={75}
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>

        {/* Mobile image (shown below content on small screens) */}
        <div className="relative lg:hidden min-h-[300px]">
          <Image
            src={decodeURIComponent(image)}
            fill
            alt={`Hero banner - ${heading}`}
            className="object-cover"
            priority
            fetchPriority="high"
            quality={75}
            sizes="100vw"
          />
        </div>
      </div>
    </section>
  )
}
