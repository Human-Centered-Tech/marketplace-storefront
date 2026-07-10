import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { DirectoryListing } from "@/types/directory"

const BENEFITS: { icon: string; title: string; body: string }[] = [
  {
    icon: "edit",
    title: "Make edits",
    body:
      "Update your business name, description, contact info, hours, photos, and more — directly from your dashboard.",
  },
  {
    icon: "verified",
    title: "Earn your member badge",
    body:
      "Stand out in search results with the trusted Catholic Owned member mark on your listing.",
  },
  {
    icon: "trending_up",
    title: "Move up in search",
    body:
      "Claimed and verified listings rank higher than unclaimed ones — meaning more eyes on your business.",
  },
  {
    icon: "campaign",
    title: "Eligible for promotions",
    body:
      "Get featured in our community newsletters, social posts, and seasonal guides.",
  },
  {
    icon: "groups",
    title: "Join the community",
    body:
      "Connect with fellow Catholic-owned businesses and access networking events.",
  },
]

export const ClaimListingSalesPage = ({
  listing,
}: {
  listing: DirectoryListing
}) => {
  const locationStr = listing.address
    ? [listing.address.city, listing.address.state]
        .filter(Boolean)
        .join(", ")
    : null

  // Claim-flow rebuild (7/7): the claim starts at the ATTESTATION step — a
  // regular account + rightful-owner checkbox, NO merchant onboarding.
  // Grandfathered members finish free; others pick a membership and ownership
  // transfers at payment (the listing stays visible as-is until then).
  // Product merchants who want a storefront get that path offered separately
  // on the claim step.
  const claimStartHref = `/directory/${listing.id}/claim/start`

  return (
    <main className="bg-[#FAF9F5] min-h-screen">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <section className="bg-navy-dark text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#F2CD69] text-[12px] font-semibold uppercase tracking-[0.2em] mb-3">
            Claim This Listing
          </p>
          <h1 className="font-serif text-3xl lg:text-5xl font-bold mb-4">
            {listing.business_name}
          </h1>
          {(listing.category?.name || locationStr) && (
            <p className="font-serif italic text-lg text-white/80">
              {listing.category?.name}
              {listing.category?.name && locationStr && " — "}
              {locationStr}
            </p>
          )}
        </div>
      </section>

      {/* Pitch + price */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-dark mb-4">
            Take ownership of your listing
          </h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            Right now, this listing is unclaimed — anyone can see it, but nobody
            on our side is editing it. Claim it and take the wheel.
          </p>
        </div>

        {/* Pricing card */}
        <div className="bg-white rounded-2xl border-2 border-[#F2CD69] shadow-xl p-8 lg:p-12 mb-12">
          <div className="text-center mb-8">
            <p className="text-[#F2CD69] text-[12px] font-semibold uppercase tracking-[0.2em] mb-2">
              Catholic Owned Local
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="font-serif text-6xl font-bold text-navy-dark">
                $99
              </span>
              <span className="text-secondary text-lg">/ year</span>
            </div>
            <p className="text-secondary text-sm">
              Membership renews annually. Cancel any time.
            </p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {BENEFITS.map((b) => (
              <li
                key={b.title}
                className="flex items-start gap-3 bg-[#FAF9F5] rounded-xl p-4"
              >
                <span
                  className="material-symbols-outlined text-[#F2CD69] shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {b.icon}
                </span>
                <div>
                  <p className="font-serif font-bold text-navy-dark mb-0.5">
                    {b.title}
                  </p>
                  <p className="text-secondary text-sm leading-relaxed">
                    {b.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <LocalizedClientLink
            href={claimStartHref}
            className="block w-full text-center bg-navy-dark text-white py-4 rounded-xl label-sm text-[12px] font-bold tracking-[0.15em] hover:bg-navy transition-colors"
          >
            Claim Your Listing &mdash; $99/yr
          </LocalizedClientLink>
          <p className="text-center text-xs text-secondary mt-4">
            You&apos;ll create an account, fill in your listing, and then enter
            payment details right before publishing.
          </p>
          {/* Grandfathered members (bubble_paid) claim free — but that only
              reveals itself AFTER attestation, so without this line an
              already-paid member stops at the $99 price and emails support
              (Brooke, 7/10). Kept generic on purpose: naming WHICH listings
              are free would advertise them for fraudulent free claims. */}
          <p className="text-center text-xs text-secondary mt-2">
            <strong className="text-navy-dark">Already a paying member from
            our previous site?</strong>{" "}
            Your membership carries over &mdash; sign in and claim your
            listing at no charge.
          </p>
        </div>

        {/* Local Boost upsell teaser */}
        <div className="bg-navy-dark/5 border border-navy-dark/10 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <span
              className="material-symbols-outlined text-navy-dark text-3xl shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              rocket_launch
            </span>
            <div>
              <p className="text-[#F2CD69] text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">
                Optional Add-on
              </p>
              <h3 className="font-serif text-xl font-bold text-navy-dark mb-2">
                Local Boost &mdash; $150 / month
              </h3>
              <p className="text-secondary leading-relaxed">
                Get 30,000 local Catholic impressions per month on your listing.
                We handle the ad setup; you focus on running your business.
                You&apos;ll see this offer right after you finish claiming.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
