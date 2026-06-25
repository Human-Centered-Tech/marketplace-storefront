import type { Metadata } from "next"
import Image from "next/image"
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
    body: "Building the New Catholic Economy® means keeping our dollars circulating among businesses that share our values, parishes we care about, and families building a better future.",
  },
  {
    title: "Stewardship",
    body: "We take seriously our obligation to merchants, to buyers, and to the broader Church. A modest commission lets us keep the lights on and grow, without extracting from the people who make this marketplace real.",
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
            A Marketplace with a Mission
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
              every merchant has been verified, every business has a home, and
              every dollar you spend keeps the Catholic economy strong.
            </p>
            <p>
              We&rsquo;re building this together — with merchants who want to
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

      {/* Story */}
      <section className="py-16 lg:py-24 bg-[#faf9f5]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 text-center">
            Our Story
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#17294A] uppercase text-center mb-8">
            How We Got Here
          </h2>
          <div className="flex justify-center mb-10">
            <Image
              src="/images/founders/onori-family.jpg"
              alt="Matteo Onori and Brooke Joiner, founders of Catholic Owned"
              width={440}
              height={440}
              className="rounded-2xl shadow-lg w-full max-w-sm h-auto object-cover"
            />
          </div>
          <div className="space-y-5 text-[16px] leading-relaxed text-[#44474e]">
            <p>
              Matteo Onori &amp; Brooke Joiner are first and foremost Slaves of
              Jesus in Mary. They met in the slums of Calcutta in 2012, while
              serving the poorest of the poor with the Missionaries of Charity.
            </p>
            <p>
              With professional backgrounds in technology and business, they were
              called to start Catholic Owned&reg; and bring a vision of Building
              the New Catholic Economy&reg; to life.
            </p>
            <p>
              Matteo is from central Italy, while Brooke grew up in Colorado.
              Called separately to Calcutta in August 2012, they did not speak a
              common language at the time, but found each other when a group of
              seminarians introduced them. Interestingly, the American
              seminarians were studying at the PNAC in Rome, which meant they
              spoke enough Italian to cobble together an introduction.
            </p>
            <p>
              Matteo and Brooke were married the following year, and spent the
              first four years of their marriage in Matteo&rsquo;s native Le
              Marche, Italy.
            </p>
            <p>
              After moving to Colorado in 2017, a surprising opportunity arose:
              Matteo&rsquo;s former employer in Italy invited them to launch the
              group&rsquo;s U.S. office in Fort Lauderdale, FL. They said yes,
              moved across the country, and built the company from the ground up,
              growing it to seven figures in revenue.
            </p>
            <p>
              As the couple grew in devotion to the Immaculate Heart of Mary,
              things began to change. A chasm developed between the work they
              were doing and the people they ultimately wanted to become, and God
              asked them to do something about it.
            </p>
            <p>
              That&rsquo;s why in 2023, one month after their fourth baby was
              born, Matteo and Brooke walked into the office and gave their
              notice, quitting their jobs together. Leaving behind careers,
              worldly comfort and all material security, they went all in on
              Catholic Owned from that moment on.
            </p>
            <p>
              Devout Catholic spouses and parents to four homeschooled children,
              their story is marked by a persistent, radical obedience to the
              perfect will of the Father, no matter what He asks, and regardless
              of the personal cost.
            </p>
            <p>
              The couple, their family and the business are all consecrated to
              the Immaculate Heart of Mary. Their favorite prayers include the
              Rosary and the Divine Mercy chaplet, with favored devotions being
              the Nine First Fridays and Five First Saturdays devotions.
            </p>
            <p>
              Today, they have been married 12 years, share four children, and
              have devoted their life&rsquo;s work to building Catholic
              Owned&reg;.
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
            Shop with merchants who share your values, or list your business and
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
