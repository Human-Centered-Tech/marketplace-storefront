import type { Metadata } from "next"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const metadata: Metadata = {
  title: "About — Catholic Owned",
  description:
    "Catholic Owned is a marketplace and business directory built by and for the Catholic community, connecting faithful shoppers with authentically Catholic businesses.",
}

const VALUES = [
  {
    title: "Faithful Community",
    body: "Every business on Catholic Owned is verified Catholic-owned or Catholic-aligned. When you shop here, you're supporting your brothers and sisters in Christ — and they're serving you with values that match your own.",
  },
  {
    title: "Authentic Craft",
    body: "We celebrate the goodness of well-made things. Rosaries, sacred art, devotionals, practical household goods — all made by people who care about what they produce and who receives it.",
  },
  {
    title: "Economic Solidarity",
    body: "The New Catholic Economy™ means keeping our dollars circulating among businesses that share our values, parishes we care about, and families building a better future.",
  },
  {
    title: "Stewardship",
    body: "We take seriously our obligation to vendors, to buyers, and to the broader Church. A modest commission lets us keep the lights on and grow, without extracting from the people who make this marketplace real.",
  },
]

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-[#17294A] py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
            About Catholic Owned
          </p>
          <h1 className="font-serif text-4xl lg:text-6xl font-bold text-white uppercase mb-6 leading-tight">
            Building the New
            <br />
            <span className="italic">Catholic Economy</span>
            <span className="align-super text-2xl lg:text-3xl">®</span>
          </h1>
          <p className="font-serif text-lg lg:text-xl italic text-white/80 max-w-2xl mx-auto leading-relaxed">
            A marketplace and business directory built by and for the Catholic
            community — connecting faithful shoppers with the businesses that
            share their values.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 lg:py-24 bg-[#faf9f5]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 text-center">
            Our Mission
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#17294A] uppercase text-center mb-8">
            A Marketplace with a Soul
          </h2>
          <div className="space-y-5 text-[16px] leading-relaxed text-[#44474e]">
            <p>
              Catholic Owned exists because we believe commerce is never just
              commerce. Every purchase is a small vote for what kind of world
              you want to live in, for what kind of businesses you want to see
              flourish, and for what kind of stewardship you practice over the
              material goods God has entrusted to you.
            </p>
            <p>
              For too long, Catholic makers, shopkeepers, and service providers
              have been scattered across the internet with no way to find each
              other — and no way for faithful shoppers to find <em>them</em>.
              Catholic Owned is the gathering place. A single marketplace where
              every vendor has been verified, every business has a home, and
              every dollar you spend keeps the Catholic economy strong.
            </p>
            <p>
              We&rsquo;re building this together — with vendors who want to
              serve a community that shares their faith, with shoppers who want
              to live out their values at checkout, and with parishes who see
              in this platform a way to strengthen the bonds of their
              community.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">
              What We Stand For
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#17294A] uppercase">
              Four Commitments
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-[#faf9f5] rounded-xl p-8 border border-[#d6d0c4]/40"
              >
                <h3 className="font-serif text-xl font-bold text-[#17294A] mb-3">
                  {v.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-[#44474e]">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story — placeholder; client to supply */}
      <section className="py-16 lg:py-24 bg-[#faf9f5]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 text-center">
            Our Story
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#17294A] uppercase text-center mb-8">
            How We Got Here
          </h2>
          <div className="space-y-5 text-[16px] leading-relaxed text-[#44474e]">
            <p>
              Catholic Owned began with a simple observation: Catholic business
              owners were struggling to reach the very people who&rsquo;d most
              want to support them. Meanwhile, faithful shoppers had no
              reliable way to find vendors who shared their values.
            </p>
            <p>
              Today Catholic Owned brings together hundreds of verified
              Catholic businesses in one place — from sacred art and liturgical
              goods to everyday services and consumer products. Each vendor is
              part of a community; each purchase strengthens the whole.
            </p>
            <p className="italic text-[#17294A]">
              <strong>Note:</strong> Client to supply founder story and team
              photos in this section.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-[#17294A]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white uppercase mb-4">
            Join the Economy
          </h2>
          <p className="text-[#FAF9F5]/80 mb-10 text-[16px] leading-relaxed max-w-xl mx-auto">
            Shop with vendors who share your values, or list your business and
            reach thousands of faithful Catholic customers.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <LocalizedClientLink
              href="/categories"
              className="inline-flex items-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xs bg-[#BE9B32] text-[#17294A] hover:bg-[#d4af4c] transition-colors"
            >
              Shop the Marketplace
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/sell"
              className="inline-flex items-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xs bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 transition-colors"
            >
              Sell on Catholic Owned
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </main>
  )
}
