import type { RecommendedTierKey } from "@/components/sections/VendorOnboardingFunnel/types"

/**
 * The membership copy Brooke signed off in the 3 Sep 2026 sales-page deck
 * ("catholicowned_sales_page.pptx.pdf", one page per section). ONE source for
 * the /sell page and for the quiz's recommended-tier card, so "What's
 * included with your membership" reads identically in both places.
 *
 * Deck audience  →  funnel tier keys
 *   Business professionals (Featured)  →  tier2_startup / tier2_nonprofit / tier2_business
 *   Local shops and businesses (Local) →  local
 *   Marketplace merchants              →  merchant
 *   Enterprise businesses              →  tier3 / tier4
 */

export type AudienceKey = "professionals" | "local" | "merchant" | "enterprise"

export type Testimonial = { quote: string; name: string }

export type Audience = {
  key: AudienceKey
  /** Card title on "Who we serve". */
  cardTitle: string
  /** Card blurb on "Who we serve" — same sentence as "Who is this for?". */
  cardBlurb: string
  /** Section heading (rendered uppercase, gold). */
  heading: string
  /** Italic one-liner under the heading. */
  tagline: string
  included: string[]
  testimonials: Testimonial[]
  /** Optional photo strip above the section. Add once the Canva exports land. */
  image?: { src: string; alt: string; position?: string }
}

export const AUDIENCES: Audience[] = [
  {
    key: "professionals",
    cardTitle: "Business professionals",
    cardBlurb:
      "Service-based businesses and professionals growing through relationships, and a broader geographic reach.",
    heading: "For Business Professionals",
    tagline:
      "Catholic Owned helps you meet people who already share your values, before they even walk through the door.",
    included: [
      "Priority Placement in the Directory in All States You Serve",
      "Monthly Networking Opportunities",
      "Featured Member Badge",
    ],
    image: {
      src: "/images/sell/professionals.jpg",
      alt: "Business professionals shaking hands across a meeting table",
      position: "center 30%",
    },
    testimonials: [
      {
        quote:
          "I just created my listing!!!! It looks great. I just love what you do and how you are connecting people. And it's all so well done. Even the signup process was quick and easy. You have really built something special!",
        name: "Kate Sell, Mission Advantage Partners",
      },
      {
        quote:
          "The message was what really struck me because it wasn't a watered-down Catholic faith... that stuck out to me, and I thought, \"okay, these people are serious about being Catholic.\"",
        name: "Conoon Kim, Covenant",
      },
    ],
  },
  {
    key: "local",
    cardTitle: "Local shops and businesses",
    cardBlurb:
      "Restaurants, shops, local service providers, and other businesses looking to be discovered by Catholics in their area.",
    heading: "Local Shops and Businesses",
    tagline: "Catholic Owned helps Catholic families nearby find you when they're looking.",
    included: [
      "Full business listing in directory",
      "Local placement",
      "Local Member Badge",
      "Eligible for Local Boost",
    ],
    image: {
      src: "/images/sell/local-shops.jpg",
      alt: "A café owner greeting customers at the door of her shop",
    },
    testimonials: [
      {
        quote: "I'm so proud to be a part of a phenomenal group of Catholic businesses!",
        name: "Michelle, Common Thread Textiles",
      },
      {
        quote:
          "Thank you for referring John & Mary to me! We just closed their deal last week. Love Catholic Owned!",
        name: "C.L., mortgage broker in FL",
      },
    ],
  },
  {
    key: "merchant",
    cardTitle: "Marketplace merchants",
    cardBlurb:
      "Makers, brands, and retailers ready to sell and ship physical products through the Catholic Owned® Marketplace.",
    heading: "Marketplace Merchants",
    tagline:
      "Catholic Owned puts your shop in front of people who are already looking for businesses like yours.",
    included: [
      "Marketplace Storefront with unlimited product listings",
      "Directory Listing to support discovery",
      "Marketplace Merchant Badge",
      "Monthly Office Hours for support",
    ],
    image: {
      src: "/images/sell/merchants.jpg",
      alt: "A maker packaging handmade goods at a workbench",
    },
    testimonials: [
      {
        quote:
          "This amazing app has been so needed in the Catholic space! Thank you Catholic Owned for working so hard to create this!",
        name: "Elise, Mater Dei Shop",
      },
      {
        quote:
          "We're so impressed with the Catholic Owned team for their work on the new marketplace! Honored to be part of it!",
        name: "Hannah, Schneider Goods Co.",
      },
    ],
  },
  {
    key: "enterprise",
    cardTitle: "Enterprise businesses",
    cardBlurb:
      "Established businesses, service providers, and organizations seeking maximum visibility in targeted states.",
    heading: "Enterprise Businesses",
    tagline:
      "Catholic Owned gives your established business a home in a growing community of faithful customers and partners.",
    included: [
      "Everything in Featured",
      "Top-of-Directory placement in three states for 12 months",
      "Four email placements throughout the year to targeted list of choice",
    ],
    image: {
      src: "/images/sell/enterprise.jpg",
      alt: "A leadership team in conversation around a conference table",
      position: "center 35%",
    },
    testimonials: [
      {
        quote:
          "We have absolutely loved being part of Catholic Owned and regularly recommend it to our clients and contacts. After gaining two new clients through our Featured Membership, we decided to expand our presence and upgrade to Enterprise. We truly value the partnership and what Catholic Owned is building.",
        name: "Bob Sankey, NOVUS United Catholic Benefits",
      },
    ],
  },
]

const AUDIENCE_BY_TIER: Record<RecommendedTierKey, AudienceKey> = {
  local: "local",
  merchant: "merchant",
  tier2_startup: "professionals",
  tier2_nonprofit: "professionals",
  tier2_business: "professionals",
  tier3: "enterprise",
  tier4: "enterprise",
}

export function audienceForTier(key: RecommendedTierKey): Audience {
  const audienceKey = AUDIENCE_BY_TIER[key]
  return AUDIENCES.find((a) => a.key === audienceKey) ?? AUDIENCES[0]
}

/** "What's included with your membership" for a quiz-recommended tier. */
export function includedForTier(key: RecommendedTierKey): string[] {
  return audienceForTier(key).included
}

export const FOUNDING_PILLARS: { icon: "cross" | "calendar" | "rosary" | "scales"; text: string }[] = [
  { icon: "cross", text: "Faithful to the Magisterium & in Full Communion with Rome" },
  {
    icon: "calendar",
    text: "Regularly practicing, sincere Catholic in good standing (Mass on Sundays + Holydays, regular confession)",
  },
  { icon: "rosary", text: "Prays the Rosary or practices other sincere daily devotion(s)" },
  { icon: "scales", text: "Operates business in accordance with the principles of the Catholic faith" },
]

export const WHY_JOIN: { icon: "search" | "badge" | "support" | "community"; text: string }[] = [
  { icon: "search", text: "Get discovered by a values-aligned community" },
  { icon: "badge", text: "Build instant trust with a Catholic Owned badge" },
  { icon: "support", text: "Simple setup & reliable customer support from fellow Catholics" },
  {
    icon: "community",
    text: "Be part of a fast-growing community of Catholics aligning their purchases with their values nationwide",
  },
]

export const WHY_JOIN_TESTIMONIAL: Testimonial = {
  quote:
    "It's finally here: a marketplace built by Catholics, for Catholics. ✨ It's about time we had a central home to discover and support the amazing Catholic small businesses that keep our culture and faith vibrant. Skip the big-box retailers and shop with purpose.",
  name: "Blonde Pom, Instagram follower",
}

export const SALES_FAQ: { q: string; a: string }[] = [
  {
    q: "What kinds of businesses can join Catholic Owned®?",
    a: "We welcome qualifying Catholic businesses across a wide range of industries, including local businesses, professional services, and product-based businesses.",
  },
  {
    q: "Which membership is right for my business?",
    a: "Take the quiz, we match you to a membership, you create your profile, and begin enjoying the perks of membership right away.",
  },
  {
    q: "Can I join if my products or services aren't explicitly Catholic?",
    a: "Yes. Your business does not need to sell Catholic-specific products or services. Many of our members provide everyday products and professional services.",
  },
  {
    q: "Do you guarantee leads or customers?",
    a: "No. Catholic Owned® provides visibility, networking opportunities, and ways to build meaningful relationships, but we do not guarantee leads, clients, sales, or specific results.",
  },
  {
    q: "How does the vetting process work?",
    a: "Businesses complete our qualification process and affirm that they meet Catholic Owned®'s standards before receiving membership benefits and badges.",
  },
  {
    q: "Are there businesses you don't accept?",
    a: "Yes. Certain business models and categories are excluded or require additional qualification. You can review our full standards and Terms & Conditions for details.",
  },
]
