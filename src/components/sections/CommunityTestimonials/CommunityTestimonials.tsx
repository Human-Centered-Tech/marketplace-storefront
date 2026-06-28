// Real shopper / app-user testimonials (Brooke, 2026-06-28 — from App Store &
// Play Store reviews and app users). Consumer-facing, so used on the homepage +
// About page (NOT the merchant-recruiting /sell page, which has its own seller
// testimonials). Lightly cleaned for card display; substance + attribution kept.
const COMMUNITY_TESTIMONIALS = [
  {
    quote:
      "An essential resource for Catholics in the 21st century. It bridges the gap between the modern age and the treasured values of the Catholic faith, connecting the faithful with vetted Catholic businesses. I always recommend it to friends and colleagues!",
    name: "Annalisa",
    source: "App Store review",
  },
  {
    quote:
      "I can trust that the businesses are vetted to align with truly Catholic values. I found Catholic authors for teen books and unique Sacred Heart flags I couldn't find anywhere else.",
    name: "JD",
    source: "Play Store review",
  },
  {
    quote:
      "Catholic Owned has given our family a safe space to find businesses we can support with confidence that they're faithful followers of Christ. We've used several, and we'll keep coming back.",
    name: "KAJ",
    source: "App Store review",
  },
  {
    quote:
      "Love being able to connect with and support local and national businesses that live their Catholic faith — and the map feature to see places in my parish area.",
    name: "Stephen",
    source: "Play Store review",
  },
  {
    quote:
      "I love how accessible this app makes it to find Catholic businesses of all kinds. It bridges the gap between Google searching and word of mouth — and it even has readings and prayer requests.",
    name: "Raquel",
    source: "App Store review",
  },
  {
    quote:
      "It has suggested so many Catholic-owned businesses that I've now purchased from. Easy to use, and it's great to know every business here supports and defends the Catholic faith.",
    name: "C. Nevers",
    source: "Play Store review",
  },
]

type Props = {
  /** How many testimonials to show (from the top of the list). */
  limit?: number
  /** Optional section background (e.g. "bg-[#faf9f5]"). */
  className?: string
  heading?: string
  eyebrow?: string
}

export const CommunityTestimonials = ({
  limit = 6,
  className = "",
  eyebrow = "From Our Community",
  heading = "Loved by Catholics nationwide",
}: Props) => {
  const items = COMMUNITY_TESTIMONIALS.slice(0, limit)
  return (
    <section className={`py-12 lg:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <p className="label-sm text-gold-dark tracking-[0.3em] mb-3 font-bold opacity-80">
            {eyebrow}
          </p>
          <h2 className="display-sm text-navy-dark">{heading}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t) => (
            <div
              key={t.name + t.quote.slice(0, 12)}
              className="bg-white rounded-2xl border border-gray-100/60 shadow-sm p-6 flex flex-col"
            >
              <p className="font-serif italic text-secondary leading-relaxed mb-4 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-navy-dark">{t.name}</p>
                <p className="text-xs text-gold-dark">{t.source}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CommunityTestimonials
