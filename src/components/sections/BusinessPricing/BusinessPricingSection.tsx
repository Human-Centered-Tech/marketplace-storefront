"use client"

import { useState } from "react"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const tiers = [
  {
    id: "verified",
    name: "Verified",
    price: "$50",
    period: "/year",
    parishes: "1 parish affiliation",
    highlight: false,
    features: [
      "Directory listing with verification badge",
      "Sell products in the marketplace",
      "Standard search placement",
      "1 parish affiliation",
      "Business profile page",
    ],
  },
  {
    id: "featured",
    name: "Featured",
    price: "$400",
    period: "/year",
    altPrice: "$50/month",
    parishes: "3 parish affiliations",
    highlight: true,
    features: [
      "Everything in Verified, plus:",
      "Featured placement in search results",
      "3 parish affiliations",
      "Priority search ranking",
      "Analytics dashboard",
      "Networking event access",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$2,000",
    period: "/year",
    parishes: "10 parish affiliations",
    highlight: false,
    features: [
      "Everything in Featured, plus:",
      "Top search priority",
      "10 parish affiliations",
      "Full analytics suite",
      "Dedicated support",
      "Custom partnership badges",
    ],
  },
]

const faqs = [
  {
    q: "Do I need a directory listing to sell in the marketplace?",
    a: "Yes — all marketplace sellers require at minimum a Verified listing ($50/year). This ensures every seller in our marketplace is a verified Catholic-owned business.",
  },
  {
    q: "Can I upgrade my plan later?",
    a: "Absolutely. You can upgrade from Verified to Featured or Enterprise at any time. You'll be credited for the remaining time on your current plan.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, debit cards, and bank payments through our secure payment processor, Stripe.",
  },
  {
    q: "What's the transaction fee on marketplace sales?",
    a: "Catholic Owned charges an 8% commission on marketplace sales, plus standard payment processing fees (~3%), for a total of approximately 11%.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "You can cancel anytime from your account settings. Your listing will remain active until the end of your current billing period.",
  },
  {
    q: "I only want a directory listing, not a storefront. Which plan do I need?",
    a: "Any plan works! The Verified tier is the most affordable option for a directory-only listing. You can always add a storefront later.",
  },
]

type BusinessPricingSectionProps = {
  isLoggedIn: boolean
}

export const BusinessPricingSection = ({
  isLoggedIn,
}: BusinessPricingSectionProps) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const getStartedHref = isLoggedIn
    ? "/user/directory/create"
    : "/user/register"

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#17294A] text-[#FAF9F5] py-16 px-4 lg:px-8">
        <div className="container max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#F2CD69] mb-4 font-medium">
            For Businesses
          </p>
          <h1
            className="text-4xl lg:text-5xl font-semibold mb-4"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Sell on Catholic Owned
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto mb-2">
            Join a trusted marketplace of verified Catholic-owned businesses.
            Reach thousands of Catholic consumers looking to support businesses
            that share their values.
          </p>
          <p className="text-sm opacity-60">
            Building the New Catholic Economy®
          </p>
        </div>
      </section>

      {/* Marketplace requirement banner */}
      <div className="bg-[#FFF8E1] border-b border-[#FFE082] py-3 px-4 text-center">
        <p className="text-sm text-[#5D4037]">
          <strong>All marketplace sellers</strong> require a Verified listing
          ($50/year) to sell on Catholic Owned.
        </p>
      </div>

      {/* Pricing cards */}
      <section className="container max-w-5xl mx-auto py-16 px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-xl border p-6 flex flex-col ${
                tier.highlight
                  ? "border-[#F2CD69] border-2 shadow-lg relative"
                  : "border-gray-200"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F2CD69] text-[#17294A] text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              <h3
                className="text-xl font-semibold text-[#17294A] mb-1"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                {tier.name}
              </h3>
              <p className="text-sm text-[#616161] mb-4">{tier.parishes}</p>
              <div className="mb-6">
                <span
                  className="text-3xl font-bold text-[#17294A]"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  {tier.price}
                </span>
                <span className="text-[#616161] text-sm">{tier.period}</span>
                {tier.altPrice && (
                  <p className="text-xs text-[#616161] mt-1">
                    or {tier.altPrice}
                  </p>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-[#14140F]"
                  >
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#3D7A4A]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <LocalizedClientLink
                href={getStartedHref}
                className={`block text-center py-3 px-6 rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors ${
                  tier.highlight
                    ? "bg-[#F2CD69] text-[#17294A] hover:bg-[#DECF8F]"
                    : "bg-[#17294A] text-[#FAF9F5] hover:bg-[#1e3560]"
                }`}
              >
                Get Started
              </LocalizedClientLink>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#FAF9F5] py-16 px-4 lg:px-8">
        <div className="container max-w-4xl mx-auto">
          <h2
            className="text-2xl font-semibold text-[#17294A] text-center mb-12"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Choose Your Plan",
                desc: "Pick the tier that fits your business — Verified, Featured, or Enterprise.",
              },
              {
                step: "2",
                title: "Set Up Your Shop",
                desc: "Add your products, customize your storefront, and create your directory listing.",
              },
              {
                step: "3",
                title: "Start Selling",
                desc: "Reach Catholic consumers and grow your business within a trusted community.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#F2CD69] text-[#17294A] font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3
                  className="text-lg font-semibold text-[#17294A] mb-2"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-[#616161]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container max-w-3xl mx-auto py-16 px-4 lg:px-8">
        <h2
          className="text-2xl font-semibold text-[#17294A] text-center mb-8"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-[#17294A]">
                  {faq.q}
                </span>
                <svg
                  className={`w-4 h-4 text-[#616161] transition-transform flex-shrink-0 ml-4 ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-[#616161]">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#17294A] text-[#FAF9F5] py-16 px-4 lg:px-8">
        <div className="container max-w-2xl mx-auto text-center">
          <h2
            className="text-2xl lg:text-3xl font-semibold mb-4"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Ready to Join?
          </h2>
          <p className="opacity-80 mb-6">
            Plans start at just $50/year. Join 550+ Catholic-owned businesses
            already on the platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <LocalizedClientLink
              href={getStartedHref}
              className="inline-block bg-[#F2CD69] text-[#17294A] py-3 px-8 rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#DECF8F] transition-colors"
            >
              Get Started
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </div>
  )
}
