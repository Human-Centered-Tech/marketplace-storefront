/**
 * Gift guide definitions. Per 3/31 decision these are curated,
 * lead-magnet collection views — Easter, Sacraments, Gifts for Him,
 * Gifts for Her, etc. Each guide filters the marketplace to a
 * pre-defined set of product tags + a price/category scope.
 *
 * Editing: update this file. Adding a new guide doesn't require a
 * migration — the tags just need to exist on products in the catalog.
 */

export type GiftGuide = {
  slug: string
  title: string
  subtitle: string
  lede: string
  hero_image: string
  // Product tag names that identify products in this guide. Any match
  // counts. Use broad tags like "easter" rather than store-specific
  // SKUs so vendors' auto-tagging picks up.
  tags: string[]
  // Optional category filter handle (Medusa product_categories.handle)
  category_handle?: string
  // Display order on the /gifts hub page (lower = sooner)
  sort_order: number
  // Seasonal guides get surfaced on the homepage from this date forward;
  // always_on guides don't have a start/end.
  active_from?: string
  active_until?: string
}

export const GIFT_GUIDES: GiftGuide[] = [
  {
    slug: "easter",
    title: "Easter Gifts",
    subtitle: "Celebrate the Resurrection",
    lede:
      "Rosaries, sacred art, and meaningful keepsakes to mark the high point of the liturgical year.",
    hero_image: "/images/hero/Image.jpg",
    tags: ["easter", "resurrection", "paschal"],
    sort_order: 10,
    active_from: "2026-02-15",
    active_until: "2026-05-15",
  },
  {
    slug: "sacraments",
    title: "Sacramental Gifts",
    subtitle: "For the moments that matter",
    lede:
      "Baptism, First Communion, Confirmation, Wedding, Ordination — thoughtful Catholic gifts for every sacrament.",
    hero_image: "/images/hero/stpeters.jpg",
    tags: [
      "sacrament",
      "baptism",
      "first-communion",
      "confirmation",
      "wedding",
      "ordination",
    ],
    sort_order: 20,
  },
  {
    slug: "for-him",
    title: "Gifts for Him",
    subtitle: "For the Catholic men in your life",
    lede:
      "Handcrafted leather, classic devotionals, and gear that reflects his faith.",
    hero_image: "/images/hero/Image.jpg",
    tags: ["mens", "for-him", "fathers"],
    sort_order: 30,
  },
  {
    slug: "for-her",
    title: "Gifts for Her",
    subtitle: "For the Catholic women in your life",
    lede:
      "Elegant jewelry, devotional art, and gifts that speak to feminine genius.",
    hero_image: "/images/hero/stpeters.jpg",
    tags: ["womens", "for-her", "mothers"],
    sort_order: 40,
  },
  {
    slug: "advent",
    title: "Advent & Christmas",
    subtitle: "Prepare the way",
    lede:
      "Advent wreaths, Nativity sets, and Christmas gifts rooted in the Church's richest season.",
    hero_image: "/images/hero/Image.jpg",
    tags: ["advent", "christmas", "nativity"],
    sort_order: 50,
    active_from: "2026-11-01",
    active_until: "2027-01-10",
  },
]

export function getGiftGuide(slug: string): GiftGuide | null {
  return GIFT_GUIDES.find((g) => g.slug === slug) || null
}

export function listActiveGiftGuides(now: Date = new Date()): GiftGuide[] {
  const ts = now.getTime()
  return GIFT_GUIDES
    .filter((g) => {
      if (g.active_from && ts < new Date(g.active_from).getTime()) return false
      if (g.active_until && ts > new Date(g.active_until).getTime()) return false
      return true
    })
    .sort((a, b) => a.sort_order - b.sort_order)
}
