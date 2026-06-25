import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

type Tile = {
  label: string
  subtitle: string
  href: string
  /** Larger tiles (top row) get a taller aspect. */
  feature?: boolean
  /** Outline ring — a gold gradient or a solid color, rendered as the wrapper
      background behind a 2–3px inset so we get a true gradient outline. */
  ring: string
  /** Inner fill — solid, kept light so the label stays the focus. */
  fill: string
  /** Label text color. */
  text: string
  /** Subtitle text color. */
  subtitleColor: string
}

// Gold gradient ring, reused on the two "anchor" tiles (Marketplace + About Us)
const GOLD_RING = "bg-gradient-to-br from-[#E7C360] via-[#BE9B32] to-[#D2AF37]"
const NAVY_RING = "bg-[#17294A]"

const TILES: Tile[] = [
  {
    label: "Marketplace",
    subtitle: "Shop quality goods from faithful merchants",
    href: "/categories",
    feature: true,
    ring: GOLD_RING,
    fill: "bg-[#FAF9F5]",
    text: "text-[#17294A]",
    subtitleColor: "text-[#8A6D1A]",
  },
  {
    label: "Directory",
    subtitle: "Find Catholic businesses and professionals",
    href: "/directory",
    feature: true,
    ring: NAVY_RING,
    fill: "bg-[#FAF9F5]",
    text: "text-[#17294A]",
    subtitleColor: "text-[#17294A]/65",
  },
  {
    label: "Events",
    subtitle: "Attend Upcoming Gatherings",
    href: "/networking",
    ring: NAVY_RING,
    fill: "bg-[#E1E5F0]", // lighter blue
    text: "text-[#17294A]",
    subtitleColor: "text-[#17294A]/65",
  },
  {
    label: "Sacred Exchange",
    subtitle: "Trade goods within the community",
    href: "/trade",
    ring: NAVY_RING,
    fill: "bg-white",
    text: "text-[#17294A]",
    subtitleColor: "text-[#17294A]/65",
  },
  {
    label: "About Us",
    subtitle: "Building the New Catholic Economy®",
    href: "/about",
    ring: GOLD_RING,
    fill: "bg-[#2D3A6E]", // medium blue
    text: "text-white",
    subtitleColor: "text-[#E7C360]",
  },
]

const TileCard = ({ tile }: { tile: Tile }) => (
  <LocalizedClientLink
    href={tile.href}
    className={`group block rounded-lg sm:rounded-xl p-[2px] sm:p-[3px] shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all ${
      tile.ring
    } ${
      // Mobile: fill the row (rows grow to fill the hero). From sm: upward,
      // fixed heights — the desktop layout is unchanged.
      tile.feature ? "h-full sm:h-60 lg:h-80" : "h-full sm:h-48 lg:h-64"
    }`}
  >
    {/* Inner fill — the inset that reveals the ring around it */}
    <div
      className={`flex h-full flex-col justify-end rounded-[6px] sm:rounded-[10px] p-2.5 sm:p-5 lg:p-6 ${tile.fill}`}
    >
      <h3
        className={`font-serif text-lg leading-tight sm:text-2xl lg:text-3xl font-bold ${tile.text}`}
      >
        {tile.label}
      </h3>
      {/* Subtitle: web only (and only once tiles are tall enough), per Brooke's note */}
      <p
        className={`hidden sm:block mt-1.5 text-xs font-semibold uppercase tracking-widest ${tile.subtitleColor}`}
      >
        {tile.subtitle}
      </p>
    </div>
  </LocalizedClientLink>
)

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
