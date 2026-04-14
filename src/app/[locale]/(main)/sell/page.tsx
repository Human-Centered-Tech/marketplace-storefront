import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sell on Catholic Owned",
  description:
    "Join the Catholic Owned marketplace. Reach thousands of faithful Catholic shoppers and grow your business within the Catholic economy.",
}

const STEPS = [
  {
    number: "01",
    title: "Create Your Account",
    description:
      "Sign up in minutes with your email. Your account works for both shopping and selling.",
  },
  {
    number: "02",
    title: "Set Up Your Store",
    description:
      "Add your business name, branding, and shipping details through our guided onboarding.",
  },
  {
    number: "03",
    title: "List Your Products",
    description:
      "Upload your products with photos, descriptions, and pricing. Go live when you're ready.",
  },
]

const BENEFITS = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Faithful Community",
    description:
      "Connect with thousands of Catholic shoppers who want to support businesses that share their values.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: "Simple Fulfillment",
    description:
      "Manage orders, shipping, and inventory from one clean vendor dashboard. We handle the marketplace, you handle your craft.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Transparent Pricing",
    description:
      "No hidden fees or complicated commission structures. Know exactly what you earn on every sale.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Values-Aligned",
    description:
      "Every vendor is part of a marketplace built on Catholic principles. Your business belongs here.",
  },
]

const TESTIMONIALS = [
  {
    quote:
      "Catholic Owned gave us a home where our customers understand and appreciate what we make. Sales grew 3x in our first year.",
    name: "Maria & Joseph",
    business: "Sacred Heart Candle Co.",
  },
  {
    quote:
      "The onboarding was incredibly simple. We were listing products within an hour of signing up.",
    name: "Fr. Michael",
    business: "Monastery Goods",
  },
]

export default function SellPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[500px] lg:min-h-[70vh]">
        <Image
          src="/images/hero/st-joseph-workshop.png"
          fill
          alt="St. Joseph in the carpenter's workshop"
          className="object-cover"
          style={{ objectPosition: "center 48%" }}
          priority
          quality={85}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#001435]/80 via-[#001435]/50 to-transparent" />

        <div className="absolute inset-0 z-10 flex items-center">
          <div className="px-6 lg:px-16 max-w-3xl">
            <p className="text-[#BE9B32] text-[13px] font-semibold uppercase tracking-[0.2em] mb-4">
              For Catholic Businesses
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold text-white uppercase leading-[1.05] drop-shadow-lg mb-6">
              Sell on
              <br />
              <span className="italic">Catholic Owned</span>
            </h1>
            <p className="font-serif text-base lg:text-lg italic text-white/75 mb-10 max-w-xl drop-shadow leading-relaxed">
              Join a marketplace built by and for the Catholic community.
              Reach faithful shoppers who want to support businesses like yours.
            </p>
            <div className="flex flex-wrap gap-4">
              <LocalizedClientLink
                href="/user/register?vendor=true"
                className="inline-flex items-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xs bg-[#BE9B32] text-[#001435] hover:bg-[#d4af4c] shadow-lg transition-colors"
              >
                Start Selling
              </LocalizedClientLink>
              <a
                href="#how-it-works"
                className="inline-flex items-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xs bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24 bg-[#faf9f5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="text-center mb-14">
            <p className="text-[#BE9B32] text-[12px] font-semibold uppercase tracking-[0.2em] mb-3">
              Why Catholic Owned
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#001435] uppercase">
              Built for Catholic Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-[#BE9B32] mb-5">{benefit.icon}</div>
                <h3 className="font-serif text-lg font-bold text-[#001435] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-[14px] text-[#44474e] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-white scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-16">
          <div className="text-center mb-14">
            <p className="text-[#BE9B32] text-[12px] font-semibold uppercase tracking-[0.2em] mb-3">
              Getting Started
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#001435] uppercase">
              Three Simple Steps
            </h2>
          </div>

          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className="flex gap-8 items-start py-10 border-b border-[#001435]/10 last:border-0"
              >
                <span className="font-serif text-5xl lg:text-6xl font-bold text-[#BE9B32]/20 shrink-0 leading-none">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-serif text-xl lg:text-2xl font-bold text-[#001435] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[15px] text-[#44474e] leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-[#001435]">
        <div className="max-w-5xl mx-auto px-6 lg:px-16">
          <div className="text-center mb-14">
            <p className="text-[#BE9B32] text-[12px] font-semibold uppercase tracking-[0.2em] mb-3">
              From Our Vendors
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white uppercase">
              Trusted by Catholic Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-[#BE9B32]/40 mb-4"
                >
                  <path
                    d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"
                    fill="currentColor"
                  />
                  <path
                    d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"
                    fill="currentColor"
                  />
                </svg>
                <p className="font-serif text-[16px] italic text-white/80 leading-relaxed mb-6">
                  {t.quote}
                </p>
                <div>
                  <p className="text-[14px] font-semibold text-white">
                    {t.name}
                  </p>
                  <p className="text-[13px] text-[#BE9B32]">{t.business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-[#faf9f5]">
        <div className="max-w-3xl mx-auto px-6 lg:px-16 text-center">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#001435] uppercase mb-4">
            Ready to Join the
            <br />
            Catholic Economy?
          </h2>
          <p className="text-[15px] text-[#44474e] leading-relaxed mb-8 max-w-lg mx-auto">
            Set up your store in minutes. No upfront costs, no complicated
            contracts. Just a community that wants to support your business.
          </p>
          <LocalizedClientLink
            href="/user/register?vendor=true"
            className="inline-flex items-center px-10 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xs bg-[#001435] text-white hover:bg-[#17294a] shadow-lg transition-colors"
          >
            Create Your Vendor Account
          </LocalizedClientLink>
        </div>
      </section>
    </main>
  )
}
