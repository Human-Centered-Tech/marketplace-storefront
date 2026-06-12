import type { ProductSocialCounts } from "@/lib/data/social-counts"

// Social-proof badges for the product detail page: "Currently in X carts",
// "In X wishlists", "Added to X registries". Each pill only renders at/above
// the display floor so we never show a weak "in 0/1". The whole row hides when
// nothing qualifies.
const MIN_DISPLAY = 1

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`

function Pill({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e7d9a8] bg-[#fdf6e3] px-3 py-1 text-xs font-semibold text-[#755b00]">
      {icon}
      {children}
    </span>
  )
}

export function SocialProofBadges({ counts }: { counts: ProductSocialCounts }) {
  const { cart_count, wishlist_count, registry_count } = counts

  const showCart = cart_count >= MIN_DISPLAY
  const showWishlist = wishlist_count >= MIN_DISPLAY
  const showRegistry = registry_count >= MIN_DISPLAY

  if (!showCart && !showWishlist && !showRegistry) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showCart && (
        <Pill
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          }
        >
          Currently in {plural(cart_count, "cart", "carts")}
        </Pill>
      )}
      {showWishlist && (
        <Pill
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          }
        >
          In {plural(wishlist_count, "wishlist", "wishlists")}
        </Pill>
      )}
      {showRegistry && (
        <Pill
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          }
        >
          Added to {plural(registry_count, "registry", "registries")}
        </Pill>
      )}
    </div>
  )
}
