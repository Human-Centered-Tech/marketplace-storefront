import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

type Tile = {
  label: string
  subtitle: string
  href: string
  image: string
  /** Larger tiles (top row) get priority loading + a taller aspect. */
  feature?: boolean
}

const TILES: Tile[] = [
  {
    label: "Shop Marketplace",
    subtitle: "Handcrafted goods from faithful artisans",
    href: "/categories",
    image: "/images/hero/st-joseph-workshop.png",
    feature: true,
  },
  {
    label: "Browse Directory",
    subtitle: "Find Catholic businesses and professionals",
    href: "/directory",
    image: "/images/hero/cathedral.jpg",
    feature: true,
  },
  {
    label: "Events",
    subtitle: "Connect at Catholic networking gatherings",
    href: "/networking",
    image: "/images/hero/stpeters-square.webp",
  },
  {
    label: "Sacred Exchange",
    subtitle: "Trade goods within the Catholic community",
    href: "/trade",
    image: "/images/hero/barter-hero.jpg",
  },
  {
    label: "About Us",
    subtitle: "Our mission for the Catholic economy",
    href: "/about",
    image: "/images/the-angelus.jpg",
  },
]

const TileCard = ({ tile, priority }: { tile: Tile; priority?: boolean }) => (
  <LocalizedClientLink
    href={tile.href}
    className={`group relative block overflow-hidden rounded-lg sm:rounded-xl shadow-sm border border-[#d6d0c4]/40 hover:shadow-xl transition-all ${
      // Compact on mobile so all five tiles sit above the fold; full
      // height from sm: upward.
      tile.feature ? "h-32 sm:h-60 lg:h-80" : "h-24 sm:h-48 lg:h-64"
    }`}
  >
    <Image
      src={tile.image}
      alt={tile.label}
      fill
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      sizes={tile.feature ? "(min-width: 640px) 50vw, 50vw" : "(min-width: 640px) 33vw, 33vw"}
      priority={priority}
    />
    {/* Dark→gold overlay, heavier at the bottom for label legibility */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#17294A]/90 via-[#17294A]/30 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-5 lg:p-6">
      <h3 className="font-serif text-sm leading-tight sm:text-2xl lg:text-3xl font-bold text-white drop-shadow">
        {tile.label}
      </h3>
      {/* Subtitle: web only (and only once tiles are tall enough), per Brooke's note */}
      <p className="hidden sm:block mt-1.5 text-[#F2CD69] text-xs font-semibold uppercase tracking-widest">
        {tile.subtitle}
      </p>
    </div>
  </LocalizedClientLink>
)

export const HomeHeroTiles = () => {
  const [shop, directory, ...rest] = TILES

  return (
    <section className="w-full bg-catholic-lace px-3 sm:px-4 lg:px-8 py-4 lg:py-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 lg:gap-6">
        {/* Top row — two feature tiles (2-up on every breakpoint) */}
        <div className="grid grid-cols-2 gap-3 lg:gap-6">
          <TileCard tile={shop} priority />
          <TileCard tile={directory} priority />
        </div>
        {/* Bottom row — three tiles (3-up on every breakpoint) */}
        <div className="grid grid-cols-3 gap-3 lg:gap-6">
          {rest.map((tile) => (
            <TileCard key={tile.href} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  )
}
