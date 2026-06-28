"use client"

import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const damaskPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-3.3 0-6 2.7-6 6 0 2.2 1.2 4.1 3 5.1V20h6v-3.9c1.8-1 3-2.9 3-5.1 0-3.3-2.7-6-6-6zm0 2c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm-15 13c-3.3 0-6 2.7-6 6 0 2.2 1.2 4.1 3 5.1V35h6v-3.9c1.8-1 3-2.9 3-5.1 0-3.3-2.7-6-6-6zm0 2c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm30 0c-3.3 0-6 2.7-6 6 0 2.2 1.2 4.1 3 5.1V35h6v-3.9c1.8-1 3-2.9 3-5.1 0-3.3-2.7-6-6-6zm0 2c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zM30 35c-3.3 0-6 2.7-6 6 0 2.2 1.2 4.1 3 5.1V50h6v-3.9c1.8-1 3-2.9 3-5.1 0-3.3-2.7-6-6-6zm0 2c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z' fill='%2317294A' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`

const tiers = [
  {
    id: "local",
    name: "Local",
    label: "Starter",
    price: "$99",
    period: "/ yr",
    highlight: false,
    features: [
      { text: "Edit your listing", icon: "check_circle", bold: false },
      { text: "Verified Business badge", icon: "check_circle", bold: false },
      { text: "Higher rank in search", icon: "check_circle", bold: false },
      { text: "Local Boost ad upsell available", icon: "check_circle", bold: false },
    ],
    btnClass: "bg-[#17294A] text-white hover:bg-[#17294A]/90",
  },
  {
    id: "tier2_business",
    name: "Tier 2",
    label: "Most Popular",
    price: "$699",
    period: "/ yr",
    highlight: true,
    features: [
      { text: "Featured directory placement", icon: "stars", bold: true },
      { text: "Catholic Owned-funded ad placement", icon: "check_circle", bold: false },
      { text: "Local Boost upsell available", icon: "check_circle", bold: false },
      { text: "Non-profit & early-stage pricing: $349/yr", icon: "check_circle", bold: false },
    ],
    btnClass:
      "bg-[#BE9B32] text-[#17294A] hover:bg-[#DECF8F] shadow-lg shadow-[#BE9B32]/20",
  },
  {
    id: "tier3",
    name: "Tier 3",
    label: "Established",
    price: "$2,999",
    period: "/ yr",
    highlight: false,
    enterprise: true,
    features: [
      { text: "Premium directory placement", icon: "shield_with_heart", bold: true },
      { text: "Catholic Owned-funded ad placement", icon: "check_circle", bold: false },
      { text: "Sales-team consultation included", icon: "check_circle", bold: false },
      { text: "Tier 4 ($10K) available on call", icon: "check_circle", bold: false },
      { text: "Local Boost upsell available", icon: "check_circle", bold: false },
    ],
    btnClass: "bg-[#17294A] text-white hover:bg-[#17294A]/90",
  },
]

const testimonials = [
  {
    quote:
      "Catholic Owned has transformed how we connect with families seeking authentic, traditional liturgical art. It\u2019s more than a directory; it\u2019s a mission.",
    name: "Maria De Rossi",
    business: "De Rossi Liturgical Arts",
  },
  {
    quote:
      "The Featured plan paid for itself in the first month. The search visibility helped local parishioners find our family carpentry shop easily.",
    name: "Joseph Miller",
    business: "St. Joseph Custom Woodwork",
  },
  {
    quote:
      "Finding merchants who share our values was always a challenge. Catholic Owned has built a true ecosystem for the domestic church.",
    name: "Therese Martin",
    business: "Little Flower Apothecary",
  },
]

const comparisonRows = [
  { feature: "Search Visibility", local: "Higher than unclaimed", tier2: "Featured placement", tier3: "Premium placement" },
  { feature: "Funded ad placement", local: "\u2014", tier2: "Included", tier3: "Included (premium)" },
  { feature: "Local Boost upsell", local: "Available", tier2: "Available", tier3: "Available" },
  { feature: "Non-profit pricing", local: "\u2014", tier2: "$349/yr", tier3: "\u2014" },
  { feature: "Sales consultation", local: "\u2014", tier2: "\u2014", tier3: "Included" },
  { feature: "Top tier upsell", local: "\u2014", tier2: "\u2014", tier3: "Tier 4 ($10K) on call" },
]

const faqs = [
  {
    group: "Membership & Plans",
    items: [
      {
        q: "What\u2019s included in the Local tier?",
        a: "The $99/year Local tier lets you edit your listing, earn a Verified Business badge, rank above unclaimed listings, and become eligible for promotions and community networking. It\u2019s the right starting point for solo practitioners and small businesses.",
      },
      {
        q: "Can I upgrade my plan later?",
        a: "Yes, you can upgrade your plan at any time. The remaining balance of your current subscription will be prorated toward your new plan.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "You can cancel your subscription from your merchant dashboard settings. Your listing will remain active until the end of your current billing cycle.",
      },
    ],
  },
  {
    group: "Marketplace & Payments",
    items: [
      {
        q: "Do I need a directory listing to sell in the marketplace?",
        a: "Yes — a directory subscription is required to sell products within the Catholic Owned marketplace. The Local tier ($99/year) is the minimum and ensures all our sellers are vetted members of the community.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards, Apple Pay, Google Pay, and bank transfers for Enterprise accounts. All payments are processed securely via Stripe.",
      },
    ],
  },
]

type BusinessPricingSectionProps = {
  isLoggedIn: boolean
}

export const BusinessPricingSection = ({
  isLoggedIn,
}: BusinessPricingSectionProps) => {
  const getTierHref = (tierId: string) =>
    isLoggedIn
      ? `/user/directory/checkout?tier=${tierId}`
      : `/user/register?return_to=${encodeURIComponent(`/user/directory/checkout?tier=${tierId}`)}`

  return (
    <div>
      {/* Google Fonts for Material Symbols */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {/* Hero */}
      <header
        className="relative pt-32 pb-20 px-8 overflow-hidden bg-[#FAF9F5]"
        style={{ backgroundImage: damaskPattern }}
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1
            className="font-serif text-5xl md:text-7xl text-[#17294A] mb-6 tracking-tight leading-tight"
            style={{ fontWeight: 700 }}
          >
            Building the New <br />
            <span className="font-serif italic font-normal text-[#695e2a]">
              Catholic Economy&reg;
            </span>
          </h1>
          <p className="font-serif max-w-2xl mx-auto text-xl text-[#44474e] leading-relaxed">
            Connect your business with a community committed to tradition,
            excellence, and the common good. Choose the plan that fits your
            mission.
          </p>
          <div className="mt-12 h-[1px] w-48 bg-[#BE9B32] mx-auto" />
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20 px-8 bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto">
          {/* Marketplace banner */}
          <div className="mb-12 flex justify-center">
            <div className="bg-[#17294A]/5 border border-[#BE9B32]/30 px-8 py-3 rounded-full flex items-center gap-3">
              <span
                className="material-symbols-outlined text-[#BE9B32]"
                style={{
                  fontVariationSettings: "'FILL' 0, 'wght' 300",
                }}
              >
                info
              </span>
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-[#17294A]">
                Not sure which plan? Take our 60-second business quiz to get a
                tailored recommendation.
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`p-10 rounded-xl flex flex-col h-full transition-all ${
                  tier.highlight
                    ? "bg-white shadow-xl border-2 border-[#BE9B32] relative transform md:-translate-y-4"
                    : tier.enterprise
                    ? "bg-[#BE9B32] shadow-sm"
                    : "bg-white shadow-sm border border-transparent hover:shadow-md"
                }`}
              >
                {tier.highlight && (
                  <div className="font-sans absolute -top-4 left-1/2 -translate-x-1/2 bg-[#BE9B32] text-[#17294A] px-6 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <span
                    className={`font-sans text-xs font-bold uppercase tracking-widest ${
                      tier.enterprise
                        ? "text-[#17294A]/70"
                        : tier.highlight
                        ? "text-[#BE9B32]"
                        : "text-[#44474e]"
                    }`}
                  >
                    {tier.label}
                  </span>
                  <h3
                    className={`font-serif text-3xl mt-2 ${
                      tier.enterprise ? "text-[#17294A]" : "text-[#17294A]"
                    }`}
                    style={{ fontWeight: 700 }}
                  >
                    {tier.name}
                  </h3>
                </div>
                <div className="mb-8">
                  <span
                    className={`font-serif text-5xl ${
                      tier.enterprise ? "text-[#17294A]" : "text-[#17294A]"
                    }`}
                    style={{ fontWeight: 700 }}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={`font-serif ${
                      tier.enterprise
                        ? "text-[#17294A]/70"
                        : "text-[#44474e]"
                    }`}
                  >
                    {tier.period}
                  </span>
                </div>
                <ul className="space-y-4 mb-12 flex-grow">
                  {tier.features.map((f) => (
                    <li
                      key={f.text}
                      className={`flex items-start gap-3 ${
                        tier.enterprise
                          ? f.bold
                            ? "text-[#17294A]"
                            : "text-[#17294A]/80"
                          : f.bold
                          ? "text-[#17294A]"
                          : "text-[#44474e]"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-lg ${
                          tier.enterprise
                            ? "text-[#17294A]"
                            : "text-[#BE9B32]"
                        }`}
                        style={{
                          fontVariationSettings: f.bold
                            ? "'FILL' 1, 'wght' 300"
                            : "'FILL' 0, 'wght' 300",
                        }}
                      >
                        {f.icon}
                      </span>
                      <span
                        className={`font-serif ${f.bold ? "font-bold" : ""}`}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <LocalizedClientLink
                  href={getTierHref(tier.id)}
                  className={`font-sans w-full py-4 rounded-lg font-bold uppercase tracking-widest text-sm text-center block transition-colors ${tier.btnClass}`}
                >
                  Get Started
                </LocalizedClientLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-8 bg-[#f4f4f0]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BE9B32] block mb-2">
              Voices of Excellence
            </span>
            <h2
              className="font-serif text-4xl text-[#17294A]"
              style={{ fontWeight: 700 }}
            >
              Community Testimonials
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white p-8 rounded-xl shadow-sm border border-[#c5c6cf]/20 hover:shadow-md transition-shadow"
              >
                <div className="flex text-[#BE9B32] mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined"
                      style={{
                        fontVariationSettings: "'FILL' 1, 'wght' 300",
                      }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-serif italic text-xl text-[#17294A] mb-8 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#dbdad6] border border-[#BE9B32]/30 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-[#17294A]/40"
                      style={{
                        fontVariationSettings: "'FILL' 1, 'wght' 300",
                      }}
                    >
                      person
                    </span>
                  </div>
                  <div>
                    <p className="font-sans font-bold text-[#17294A] text-xs uppercase tracking-wider">
                      {t.name}
                    </p>
                    <p className="font-serif text-[#44474e] text-sm italic">
                      {t.business}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 px-8 bg-[#FAF9F5]">
        <div className="max-w-6xl mx-auto">
          <h2
            className="font-serif text-4xl text-center text-[#17294A] mb-16"
            style={{ fontWeight: 700 }}
          >
            Feature Comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-[#c5c6cf]/30 bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#e9e8e4]">
                  <th className="font-serif p-6 text-lg text-[#17294A] border-b border-[#c5c6cf]/30">
                    Feature
                  </th>
                  <th className="font-serif p-6 text-lg text-[#17294A] border-b border-[#c5c6cf]/30 text-center">
                    Local
                  </th>
                  <th className="font-serif p-6 text-lg text-[#17294A] border-b border-[#c5c6cf]/30 text-center bg-[#e3e2df]/50">
                    Tier 2
                  </th>
                  <th className="font-serif p-6 text-lg text-[#17294A] border-b border-[#c5c6cf]/30 text-center">
                    Tier 3
                  </th>
                </tr>
              </thead>
              <tbody className="font-serif text-[#44474e]">
                {comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <td className="p-6 border-b border-[#c5c6cf]/20 font-bold text-[#17294A]">
                      {row.feature}
                    </td>
                    <td className="p-6 border-b border-[#c5c6cf]/20 text-center">
                      {row.local}
                    </td>
                    <td className="p-6 border-b border-[#c5c6cf]/20 text-center bg-[#e3e2df]/50">
                      {row.tier2}
                    </td>
                    <td className="p-6 border-b border-[#c5c6cf]/20 text-center">
                      {row.tier3}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div className="max-w-4xl mx-auto py-12 px-8">
        <div className="h-[1px] bg-[#BE9B32] w-full opacity-50" />
      </div>

      {/* FAQs */}
      <section className="py-24 px-8 bg-[#FAF9F5]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BE9B32] block mb-2">
              Clarity in Mission
            </span>
            <h2
              className="font-serif text-4xl text-[#17294A]"
              style={{ fontWeight: 700 }}
            >
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((group) => (
              <div key={group.group} className="mb-8">
                <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-[#44474e] mb-6 pb-2 border-b border-[#c5c6cf]/30">
                  {group.group}
                </h3>
                <div className="space-y-2">
                  {group.items.map((faq) => (
                    <details
                      key={faq.q}
                      className="group bg-white border border-[#c5c6cf]/20 rounded-xl overflow-hidden transition-all duration-300 open:shadow-md"
                    >
                      <summary className="flex items-center justify-between p-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <span className="font-serif text-lg text-[#17294A]">
                          {faq.q}
                        </span>
                        <span className="material-symbols-outlined text-[#BE9B32] transition-transform duration-300 group-open:rotate-180">
                          expand_more
                        </span>
                      </summary>
                      <div className="font-serif px-6 pb-6 text-[#44474e] leading-relaxed">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <footer className="py-16 px-8 bg-[#17294A]">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="font-serif text-3xl lg:text-4xl text-[#FAF9F5] mb-4"
            style={{ fontWeight: 700 }}
          >
            Ready to Join?
          </h2>
          <p className="font-serif text-[#FAF9F5]/80 mb-8 text-lg">
            Plans start at just $99/year. Join 550+ Catholic-owned businesses
            already on the platform.
          </p>
          <LocalizedClientLink
            href="/sell/onboarding"
            className="font-sans inline-block bg-[#BE9B32] text-[#17294A] py-4 px-10 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#DECF8F] transition-colors shadow-lg shadow-[#BE9B32]/20"
          >
            Take the Quiz
          </LocalizedClientLink>
        </div>
      </footer>
    </div>
  )
}
