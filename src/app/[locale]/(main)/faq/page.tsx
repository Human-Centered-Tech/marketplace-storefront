import type { Metadata } from "next"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const metadata: Metadata = {
  title: "FAQ — Catholic Owned",
  description:
    "Answers to the most common questions about Catholic Owned — shopping, selling, directory listings, subscriptions, and more.",
}

type FAQ = { q: string; a: string | React.ReactNode }

const SECTIONS: { heading: string; items: FAQ[] }[] = [
  {
    heading: "Shopping",
    items: [
      {
        q: "Who sells on Catholic Owned?",
        a: "Every vendor on Catholic Owned is a verified Catholic-owned or Catholic-aligned business. We check each business before they go live, and display a Verified Business badge on every approved listing.",
      },
      {
        q: "Do I need an account to shop?",
        a: "No — you can browse the marketplace, directory, and community listings freely. You only need an account when you want to save a shop, place an order, create your own listing, or message another user.",
      },
      {
        q: "How do shipping and returns work?",
        a: "Shipping is set by each vendor and included in the prices you see at checkout — there's no separate shipping-method selection for most orders. Returns are handled on a per-vendor basis; you can find each shop's return policy on their storefront.",
      },
      {
        q: "How are payments processed?",
        a: "We use Stripe for all marketplace payments. Your card information never touches our servers — Stripe handles everything securely.",
      },
    ],
  },
  {
    heading: "Selling",
    items: [
      {
        q: "How do I list my business?",
        a: (
          <>
            Head to{" "}
            <LocalizedClientLink
              href="/sell"
              className="text-[#BE9B32] underline"
            >
              Sell on Catholic Owned
            </LocalizedClientLink>{" "}
            and create a vendor account. Choose a subscription plan, complete
            your business profile, and you'll be ready to list products within
            minutes. New listings are reviewed briefly by our team before going
            live.
          </>
        ),
      },
      {
        q: "What does it cost to sell?",
        a: "Every marketplace seller needs an active Business Directory listing. Plans start at $50/year (Verified tier) and scale up to Featured ($400/year) and Enterprise ($2,000/year). See the full comparison on our pricing page.",
      },
      {
        q: "Do you take a commission?",
        a: "Yes. A modest commission on each sale keeps the platform running and funds the work of verifying new vendors, improving the product, and bringing more shoppers in. You'll see the exact commission percentage during vendor onboarding.",
      },
      {
        q: "Can I sell services, not just products?",
        a: "Yes. Service businesses can list their services as products on their storefront. We also offer the Business Directory as a standalone option for service-only businesses that don't need a marketplace storefront.",
      },
    ],
  },
  {
    heading: "Directory & Subscriptions",
    items: [
      {
        q: "What's the Business Directory?",
        a: "The Directory is a searchable, map-enabled list of Catholic businesses — like a Catholic version of Yelp. Every marketplace seller is also in the Directory. Customers can browse by category, by city, or by parish affiliation.",
      },
      {
        q: "What are parish affiliations?",
        a: "Businesses can be affiliated with one or more parishes. Your Verified tier includes 1 parish, Featured includes up to 3, and Enterprise includes up to 10. Parish affiliations help shoppers find businesses connected to their own community.",
      },
      {
        q: "What happens if I cancel my subscription?",
        a: "Your existing products stay published. You won't be able to add new products until you reactivate. Your directory listing is hidden from search, and you'll lose access to premium features (analytics, featured placement).",
      },
    ],
  },
  {
    heading: "Account & Support",
    items: [
      {
        q: "Can I have both a shopping account and a vendor account?",
        a: "Yes — they're one account. Once you've signed up, you can become a vendor from your account settings. Use the same login to shop, sell, or manage your directory listing.",
      },
      {
        q: "How do I contact another user or vendor?",
        a: "Every product page and directory listing has a contact option that opens a conversation in our built-in messaging system. Your messages stay inside Catholic Owned — no email addresses are exposed.",
      },
      {
        q: "I have another question. Who do I contact?",
        a: "Reply to any email we've sent you, or reach out through the contact form on the bottom of the homepage. We try to respond within one business day.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <main className="bg-[#faf9f5] min-h-screen py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
            Common Questions
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#17294A] uppercase">
            Frequently Asked
            <br />
            Questions
          </h1>
        </div>

        <div className="space-y-16">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <h2 className="font-serif text-2xl font-bold text-[#17294A] uppercase mb-6 pb-2 border-b border-[#BE9B32]/40">
                {section.heading}
              </h2>
              <div className="divide-y divide-[#d6d0c4]/40">
                {section.items.map((item, i) => (
                  <details
                    key={i}
                    className="group py-5"
                  >
                    <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                      <h3 className="font-serif text-lg font-semibold text-[#17294A] pr-4">
                        {item.q}
                      </h3>
                      <span className="text-[#BE9B32] text-xl transition-transform group-open:rotate-45 shrink-0 mt-1">
                        +
                      </span>
                    </summary>
                    <div className="mt-3 text-[15px] leading-relaxed text-[#44474e]">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-12 border-t border-[#d6d0c4]/40 text-center">
          <p className="text-[15px] text-[#44474e] mb-4">
            Still have questions?
          </p>
          <LocalizedClientLink
            href="/about"
            className="text-[#BE9B32] font-semibold text-sm uppercase tracking-wider hover:text-[#17294A] transition-colors"
          >
            Learn more about Catholic Owned &rarr;
          </LocalizedClientLink>
        </div>
      </div>
    </main>
  )
}
