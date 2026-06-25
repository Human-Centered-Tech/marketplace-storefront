import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

type Variant =
  | "goldOutline"
  | "navyOutline"
  | "lightBlue"
  | "white"
  | "mediumBlue"

type Tile = {
  label: string
  subtitle: string
  href: string
  variant: Variant
  /** Larger tiles (top row) get a taller aspect. */
  feature?: boolean
}

// Brooke 6/25: move away from photo backgrounds to a cohesive set of solid
// surfaces so the WORDS are the focus and visitors grasp each destination with
// minimal effort. The two feature tiles get button-like outlines (gold gradient
// / navy); the bottom three are interchangeable light-blue / white / medium-blue.
const TILES: Tile[] = [
  {
    label: "Marketplace",
    subtitle: "Shop quality goods from faithful merchants",
    href: "/categories",
    variant: "goldOutline",
    feature: true,
  },
  {
    label: "Directory",
    subtitle: "Find Catholic businesses and professionals",
    href: "/directory",
    variant: "navyOutline",
    feature: true,
  },
  {
    label: "Events",
    subtitle: "Attend Upcoming Gatherings",
    href: "/networking",
    variant: "lightBlue",
  },
  {
    label: "Sacred Exchange",
    subtitle: "Trade goods within the community",
    href: "/trade",
    variant: "white",
  },
  {
    label: "About Us",
    subtitle: "Building the New Catholic Economy®",
    href: "/about",
    variant: "mediumBlue",
  },
]

// `wrap` styles the link (the 2px outline for the feature tiles is a gradient/
// solid background showing through the inner div's padding); `inner` is the
// surface; `title`/`subtitle` adapt text color to the surface.
const VARIANTS: Record<
  Variant,
  { wrap: string; inner: string; title: string; subtitle: string }
> = {
  goldOutline: {
    wrap: "bg-gradient-to-br from-[#F2CD69] to-[#BE9B32] p-[2px]",
    inner: "bg-[#FAF9F5]",
    title: "text-[#17294A]",
    subtitle: "text-[#BE9B32]",
  },
  navyOutline: {
    wrap: "bg-[#17294A] p-[2px]",
    inner: "bg-[#FAF9F5]",
    title: "text-[#17294A]",
    subtitle: "text-[#17294A]/70",
  },
  lightBlue: {
    wrap: "",
    inner: "bg-[#E7EEF6] border border-[#17294A]/10",
    title: "text-[#17294A]",
    subtitle: "text-[#17294A]/60",
  },
  white: {
    wrap: "",
    inner: "bg-white border border-[#d6d0c4]/60",
    title: "text-[#17294A]",
    subtitle: "text-[#17294A]/60",
  },
  mediumBlue: {
    wrap: "",
    inner: "bg-[#2E4A78]",
    title: "text-white",
    subtitle: "text-[#F2CD69]",
  },
}

const TileCard = ({ tile }: { tile: Tile }) => {
  const v = VARIANTS[tile.variant]
  return (
    <LocalizedClientLink
      href={tile.href}
      className={`group relative block overflow-hidden rounded-lg sm:rounded-xl shadow-sm hover:shadow-xl transition-all ${
        tile.feature ? "h-full sm:h-60 lg:h-80" : "h-full sm:h-48 lg:h-64"
      } ${v.wrap}`}
    >
      <div
        className={`flex h-full w-full flex-col items-center justify-center text-center rounded-lg sm:rounded-xl p-4 sm:p-6 ${v.inner}`}
      >
        <h3
          className={`font-serif text-2xl leading-tight sm:text-3xl lg:text-4xl font-bold ${v.title}`}
        >
          {tile.label}
        </h3>
        {/* Subtitle centered under the label — the text is the focus now that
            tiles are solid. Hidden on the narrowest mobile tiles to avoid crowding. */}
        <p
          className={`hidden sm:block mt-2 max-w-[26ch] text-[11px] sm:text-sm font-semibold uppercase tracking-widest ${v.subtitle}`}
        >
          {tile.subtitle}
        </p>
      </div>
    </LocalizedClientLink>
  )
}

export const HomeHeroTiles = () => {
  const [shop, directory, ...rest] = TILES

  return (
    <section className="w-full bg-catholic-lace px-3 sm:px-4 lg:px-8 py-3 lg:py-10">
      {/* On mobile the grid grows to fill most of the viewport so the tiles
          dominate the fold and the guides rail peeks in below; from sm: up
          it reverts to the fixed-height desktop layout. */}
      <div className="max-w-7xl mx-auto flex flex-col gap-3 lg:gap-6 min-h-[64svh] sm:min-h-0">
        {/* Top row — two feature tiles (2-up on every breakpoint) */}
        <div className="grid grid-cols-2 gap-3 lg:gap-6 flex-[1.2] sm:flex-none">
          <TileCard tile={shop} />
          <TileCard tile={directory} />
        </div>
        {/* Bottom row — three tiles (3-up on every breakpoint) */}
        <div className="grid grid-cols-3 gap-3 lg:gap-6 flex-1 sm:flex-none">
          {rest.map((tile) => (
            <TileCard key={tile.href} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  )
}
