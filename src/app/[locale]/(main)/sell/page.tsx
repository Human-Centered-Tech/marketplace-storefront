import Image from "next/image"
import type { Metadata } from "next"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import {
  AUDIENCES,
  FOUNDING_PILLARS,
  SALES_FAQ,
  WHY_JOIN,
  WHY_JOIN_TESTIMONIAL,
  type Audience,
} from "@/lib/membership-tiers"

export const metadata: Metadata = {
  title: "Catholic Business Owner? You belong here | Catholic Owned®",
  description:
    "Catholic Owned® is a community of business owners who live their faith every day — business professionals, local shops, marketplace merchants, and enterprise businesses. See which membership is right for you.",
}

/**
 * The "For Businesses" sales page, rebuilt 4 Sep 2026 from Brooke's deck
 * (catholicowned_sales_page.pptx.pdf — one page per section). Previously this
 * page pitched only the marketplace; it now speaks to every audience the
 * directory serves. Copy lives in @/lib/membership-tiers so the quiz's
 * recommended-tier card shows the identical "What's included" list.
 *
 * Section order (deck page in brackets):
 *   hero [1] → founding pillars [2] → who we serve [3] → one section per
 *   audience with "Take the quiz" bar [4–7] → why join us [8] → FAQ [9].
 *   The site footer stands in for deck page 10 (Brooke's note).
 */

const QUIZ_HREF = "/sell/onboarding"

const eyebrow = "text-[#BE9B32] text-[12px] font-semibold uppercase tracking-[0.2em]"
const serifH2 = "font-serif font-bold text-[#001435] uppercase tracking-wide"

export default function SellPage() {
  return (
    <main className="text-[#001435]">
      {/* ── Hero [1] ─────────────────────────────────────────────── */}
      <section className="relative">
        <div className="relative h-[46vw] min-h-[260px] max-h-[520px] overflow-hidden">
          <Image
            src="/images/hero/st-joseph-workshop.png"
            fill
            alt="St. Joseph at work in the carpenter's workshop"
            className="object-cover"
            style={{ objectPosition: "center 45%" }}
            priority
            quality={85}
            sizes="100vw"
          />
        </div>
        <div className="bg-[#EFEAE1] px-6 py-12 lg:py-16 text-center">
          <h1 className={`${serifH2} text-3xl md:text-5xl lg:text-6xl mb-4`}>
            Catholic Business Owner?
          </h1>
          <p className="text-[#BE9B32] text-2xl md:text-3xl lg:text-4xl font-medium">
            You belong here!
          </p>
        </div>
      </section>

      {/* ── Founding pillars [2] ────────────────────────────────── */}
      <section className="bg-white px-6 py-14 lg:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className={`${serifH2} text-2xl md:text-3xl lg:text-4xl mb-5`}>
            Our Founding Pillars
          </h2>
          <p className="font-serif text-[15px] md:text-[17px] text-[#1b1c1a] leading-relaxed max-w-2xl mx-auto mb-10">
            Catholic Owned&reg; is a community of business owners who live their faith everyday.
            <br className="hidden md:block" />
            Every member affirms our Founding Pillars:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {FOUNDING_PILLARS.map((pillar) => (
              <li
                key={pillar.text}
                className="bg-[#0F2145] rounded-xl px-6 py-8 flex flex-col items-center gap-4 text-center shadow-sm"
              >
                <PillarIcon name={pillar.icon} />
                <p className="text-[#F1D9A0] text-[13px] font-semibold leading-snug">{pillar.text}</p>
              </li>
            ))}
          </ul>
          <p className="font-serif italic text-[13px] md:text-[14px] text-[#44474e] mt-10">
            These pillars keep Catholic Owned&reg; a trusted resource for the faithful, and a powerful
            witness for Christ in the marketplace.
          </p>
        </div>
      </section>

      {/* ── Who we serve [3] ─────────────────────────────────────── */}
      <section className="bg-[#0F2145] px-6 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif font-bold text-white uppercase tracking-wide text-2xl md:text-3xl text-center mb-10">
            Who We Serve
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {AUDIENCES.map((a) => (
              <li key={a.key} className="bg-white rounded-lg p-6 flex flex-col min-h-[260px]">
                <AudienceIcon name={a.key} />
                <h3 className="font-semibold text-[#001435] text-[16px] mt-4 mb-4">{a.cardTitle}</h3>
                <p className="font-serif text-[13px] text-[#44474e] leading-relaxed flex-1">{a.cardBlurb}</p>
                <a
                  href={`#${a.key}`}
                  className="mt-6 self-center text-[13px] font-semibold text-[#BE9B32] underline underline-offset-4 hover:text-[#001435]"
                >
                  Learn more
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── One section per audience [4–7] ───────────────────────── */}
      {AUDIENCES.map((a) => (
        <AudienceSection key={a.key} audience={a} />
      ))}

      {/* ── Why join us [8] ──────────────────────────────────────── */}
      <section className="bg-[#F7F5F0] px-6 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className={`${serifH2} text-2xl md:text-3xl lg:text-4xl text-center mb-10`}>Why Join Us</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_JOIN.map((w) => (
              <li
                key={w.text}
                className="bg-[#D8CC96] rounded-lg px-6 py-10 flex flex-col items-center text-center gap-6 min-h-[220px]"
              >
                <WhyIcon name={w.icon} />
                <p className="font-serif text-[15px] md:text-[16px] text-[#001435] leading-snug">{w.text}</p>
              </li>
            ))}
          </ul>
          <blockquote className="mt-10 max-w-3xl mx-auto bg-[#FBF9F4] rounded-lg px-8 py-7 text-[#1b1c1a] italic text-[15px] md:text-[16px] leading-relaxed">
            &ldquo;{WHY_JOIN_TESTIMONIAL.quote}&rdquo;
            <footer className="not-italic mt-2 text-[14px]">~{WHY_JOIN_TESTIMONIAL.name}</footer>
          </blockquote>
        </div>
      </section>

      {/* ── FAQ [9] ──────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-14 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className={`${serifH2} text-2xl md:text-3xl lg:text-4xl text-center mb-8`}>
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-[#BE9B32]/40 border-y border-[#BE9B32]/40">
            {SALES_FAQ.map((item, i) => (
              <details key={item.q} className="group py-4" open={i === 0}>
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="font-semibold text-[#001435] text-[15px] md:text-[16px]">{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="text-[#001435] transition-transform group-open:rotate-90 shrink-0"
                  >
                    &rsaquo;
                  </span>
                </summary>
                <p className="font-serif text-[14px] md:text-[15px] text-[#1b1c1a] leading-relaxed mt-3 pr-8">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
          <p className="text-center text-[13px] text-[#44474e] mt-8">
            Full standards are in our{" "}
            <LocalizedClientLink href="/merchant-terms" className="underline underline-offset-4 text-[#001435]">
              Merchant Terms
            </LocalizedClientLink>
            .
          </p>
        </div>
      </section>

      {/* Closing quiz bar so the page never ends without the ask. */}
      <QuizBar />
    </main>
  )
}

/* ────────────────────────────────────────────────────────────────── */

function AudienceSection({ audience: a }: { audience: Audience }) {
  return (
    <section id={a.key} className="scroll-mt-24">
      {a.image ? (
        <div className="relative h-[36vw] min-h-[180px] max-h-[360px] overflow-hidden">
          <Image
            src={a.image.src}
            fill
            alt={a.image.alt}
            className="object-cover"
            style={{ objectPosition: a.image.position || "center" }}
            sizes="100vw"
          />
        </div>
      ) : (
        // Photo strip placeholder until the Canva exports land — a quiet band
        // rather than a stock photo that isn't ours.
        <div className="h-14 md:h-20 bg-gradient-to-r from-[#0F2145] via-[#17294A] to-[#0F2145]" />
      )}
      <div className="bg-white px-6 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-serif text-[#BE9B32] uppercase tracking-[0.18em] text-2xl md:text-3xl lg:text-[34px] mb-3">
            {a.heading}
          </h2>
          <p className="text-center font-serif italic text-[15px] md:text-[17px] text-[#001435] mb-10">
            {a.tagline}
          </p>

          <h3 className={`${eyebrow} text-[13px] tracking-[0.2em] mb-2`}>Who is this for?</h3>
          <p className="font-serif text-[15px] md:text-[16px] text-[#1b1c1a] mb-8">{a.cardBlurb}</p>

          <h3 className={`${eyebrow} text-[13px] tracking-[0.2em] mb-3`}>What&rsquo;s included with your membership</h3>
          <ul className="flex flex-wrap gap-x-8 gap-y-2 mb-10">
            {a.included.map((item) => (
              <li key={item} className="font-serif text-[14px] md:text-[15px] text-[#1b1c1a] flex items-start gap-2">
                <span aria-hidden="true" className="text-[#BE9B32] mt-[2px]">
                  &bull;
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div
            className={`grid gap-5 ${a.testimonials.length > 1 ? "md:grid-cols-2" : "max-w-3xl mx-auto"}`}
          >
            {a.testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="bg-[#FBF9F4] rounded-lg px-6 py-5 text-[13px] md:text-[14px] italic text-[#1b1c1a] leading-relaxed"
              >
                &ldquo;{t.quote}&rdquo;
                <footer className="not-italic mt-1">~{t.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
      <QuizBar />
    </section>
  )
}

function QuizBar() {
  return (
    <div className="bg-[#17294A] px-6 py-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <p className="font-serif text-white text-[16px] md:text-[18px]">See what membership is right for you</p>
        <LocalizedClientLink
          href={QUIZ_HREF}
          className="inline-flex items-center px-7 py-3 text-[13px] md:text-[14px] font-serif font-bold uppercase tracking-[0.08em] bg-[#BE9B32] text-[#001435] hover:bg-[#d4af4c] rounded-sm transition-colors"
        >
          Take the Quiz
        </LocalizedClientLink>
      </div>
    </div>
  )
}

/* ── Icons (inline so the page has no icon-library dependency) ───── */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

function PillarIcon({ name }: { name: (typeof FOUNDING_PILLARS)[number]["icon"] }) {
  const cls = "text-[#D9B855] w-8 h-8"
  switch (name) {
    case "cross":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...stroke} aria-hidden="true">
          <path d="M12 3v18M7 8h10" />
        </svg>
      )
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...stroke} aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      )
    case "rosary":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...stroke} aria-hidden="true">
          <circle cx="12" cy="9" r="6" strokeDasharray="2 2.2" />
          <path d="M12 15v3M10 20h4" />
        </svg>
      )
    case "scales":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...stroke} aria-hidden="true">
          <path d="M12 3v18M5 21h14M12 6l6 2M12 6L6 8" />
          <path d="M3 14l3-6 3 6a3 3 0 0 1-6 0zM15 14l3-6 3 6a3 3 0 0 1-6 0z" />
        </svg>
      )
  }
}

function AudienceIcon({ name }: { name: Audience["key"] }) {
  const cls = "text-[#BE9B32] w-7 h-7"
  switch (name) {
    case "professionals":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...stroke} aria-hidden="true">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
        </svg>
      )
    case "local":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...stroke} aria-hidden="true">
          <path d="M4 10V20h16V10M2 10l2-6h16l2 6a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM10 20v-6h4v6" />
        </svg>
      )
    case "merchant":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...stroke} aria-hidden="true">
          <path d="M3 8h18l-1 12H4L3 8zM8 8V6a4 4 0 0 1 8 0v2" />
        </svg>
      )
    case "enterprise":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...stroke} aria-hidden="true">
          <path d="M5 21V4h9v17M14 9h5v12M8 8h3M8 12h3M8 16h3M17 12h.01M17 16h.01" />
          <path d="M3 21h18" />
        </svg>
      )
  }
}

function WhyIcon({ name }: { name: (typeof WHY_JOIN)[number]["icon"] }) {
  const cls = "text-[#001435] w-10 h-10"
  switch (name) {
    case "search":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...stroke} aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5L21 21" />
        </svg>
      )
    case "badge":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...stroke} aria-hidden="true">
          <path d="M12 3l9 9-9 9-9-9 9-9z" />
          <path d="M12 8l4 4-4 4-4-4 4-4z" fill="#BE9B32" stroke="none" />
        </svg>
      )
    case "support":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...stroke} aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1.5" fill="#BE9B32" stroke="none" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
        </svg>
      )
    case "community":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...stroke} aria-hidden="true">
          <circle cx="7" cy="8" r="2.5" />
          <circle cx="17" cy="8" r="2.5" />
          <circle cx="12" cy="6" r="2.5" fill="#BE9B32" stroke="none" />
          <path d="M3 18a4 4 0 0 1 8 0M13 18a4 4 0 0 1 8 0M4 21h16" />
        </svg>
      )
  }
}
