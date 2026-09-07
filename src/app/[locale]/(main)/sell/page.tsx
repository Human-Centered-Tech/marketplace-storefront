import type { CSSProperties } from "react"
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
  title: "Catholic Business Owner? You belong here",
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

/**
 * Photo strips are cropped very differently at 375px than at 1440px, so each
 * image carries a phone focal point and a desktop one. Inline styles can't
 * carry a media query, so the two land in custom properties and the class
 * picks one per breakpoint.
 */
const STRIP_POSITION = "[object-position:var(--pos-sm)] md:[object-position:var(--pos-md)]"

function stripPosition(mobile?: string, desktop?: string): CSSProperties {
  const md = desktop || "center"
  return { "--pos-sm": mobile || md, "--pos-md": md } as CSSProperties
}
const serifH2 = "font-serif font-bold text-[#001435] uppercase tracking-wide"

export default function SellPage() {
  return (
    <main className="text-[#001435]">
      {/* ── Hero [1] ─────────────────────────────────────────────── */}
      <section className="relative">
        <div className="relative h-[56vw] min-h-[220px] max-h-[520px] overflow-hidden">
          <Image
            src="/images/sell/hero-workshop.jpg"
            fill
            alt="A carpenter at work in his workshop"
            className={`object-cover ${STRIP_POSITION}`}
            style={stripPosition("62% 40%", "center 40%")}
            priority
            quality={85}
            sizes="100vw"
          />
        </div>
        <div className="bg-[#EFEAE1] px-5 py-10 md:py-12 lg:py-16 text-center">
          <h1 className={`${serifH2} text-[26px] leading-tight sm:text-3xl md:text-5xl lg:text-6xl mb-3 md:mb-4`}>
            Catholic Business Owner?
          </h1>
          <p className="text-[#BE9B32] text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium">
            You belong here!
          </p>
        </div>
      </section>

      {/* ── Founding pillars [2] ────────────────────────────────── */}
      <section className="bg-white px-5 md:px-6 py-12 md:py-14 lg:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className={`${serifH2} text-[22px] sm:text-2xl md:text-3xl lg:text-4xl mb-5`}>
            Our Founding Pillars
          </h2>
          <p className="font-serif text-[15px] md:text-[17px] text-[#1b1c1a] leading-relaxed max-w-2xl mx-auto mb-10">
            Catholic Owned&reg; is a community of business owners who live their faith everyday.{" "}
            <br className="hidden md:block" />
            Every member affirms our Founding Pillars:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {FOUNDING_PILLARS.map((pillar) => (
              <li
                key={pillar.text}
                className="bg-[#0F2145] rounded-xl px-5 py-7 md:px-6 md:py-8 flex flex-col items-center gap-4 text-center shadow-sm"
              >
                <PillarIcon name={pillar.icon} />
                <p className="text-[#E9C55A] text-[13px] font-semibold leading-snug">{pillar.text}</p>
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
      <section className="bg-[#0F2145] px-5 md:px-6 py-12 md:py-14 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif font-bold text-white uppercase tracking-wide text-[22px] sm:text-2xl md:text-3xl text-center mb-8 md:mb-10">
            Who We Serve
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {AUDIENCES.map((a) => (
              <li key={a.key} className="bg-white rounded-lg p-6 flex flex-col sm:min-h-[260px]">
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
      <section className="bg-[#F7F5F0] px-5 md:px-6 py-12 md:py-14 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className={`${serifH2} text-[22px] sm:text-2xl md:text-3xl lg:text-4xl text-center mb-8 md:mb-10`}>Why Join Us</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_JOIN.map((w) => (
              <li
                key={w.text}
                className="bg-[#D8CC96] rounded-lg px-6 py-8 md:py-10 flex flex-col items-center text-center gap-5 md:gap-6 sm:min-h-[220px]"
              >
                <WhyIcon name={w.icon} />
                <p className="font-serif text-[15px] md:text-[16px] text-[#001435] leading-snug">{w.text}</p>
              </li>
            ))}
          </ul>
          <blockquote className="mt-8 md:mt-10 max-w-3xl mx-auto bg-[#FBF9F4] rounded-lg px-6 py-6 md:px-8 md:py-7 text-[#1b1c1a] italic text-[15px] md:text-[16px] leading-relaxed">
            &ldquo;{WHY_JOIN_TESTIMONIAL.quote}&rdquo;
            <footer className="not-italic mt-2 text-[14px]">~{WHY_JOIN_TESTIMONIAL.name}</footer>
          </blockquote>
        </div>
      </section>

      {/* ── FAQ [9] ──────────────────────────────────────────────── */}
      <section className="bg-white px-5 md:px-6 py-12 md:py-14 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className={`${serifH2} text-[22px] sm:text-2xl md:text-3xl lg:text-4xl text-center mb-8`}>
            Frequently Asked Questions
          </h2>
          {/*
            Brooke's FAQ treatment: a gold hairline between questions, the
            question in navy, a chevron on the right that turns down when the
            answer is open. Every item starts closed so the list reads as a
            clean index; open question for Brooke: should the first one start
            open as a hint that they expand?
          */}
          <div className="divide-y divide-[#BE9B32]/60 border-y border-[#BE9B32]/60">
            {SALES_FAQ.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none py-4 md:py-5 [&::-webkit-details-marker]:hidden">
                  <span className="font-semibold text-[#001435] text-[15px] md:text-[17px] leading-snug">
                    {item.q}
                  </span>
                  <ChevronRight className="w-5 h-5 shrink-0 text-[#BE9B32] transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <p className="font-serif text-[14px] md:text-[15px] text-[#1b1c1a] leading-relaxed pb-5 pr-9">
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
      {a.image?.lowRes ? (
        // The source is only ~1200px wide, so a cover crop at 1920 upscales
        // it 1.6x and it turns to mush. Keep the band short (≤1.25x upscale),
        // and past 1536px switch the photo to contain and let a blurred,
        // navy-tinted copy of itself fill the sides — a blur-up, not a
        // stock photo we don't own.
        <div className="relative h-[44vw] min-h-[170px] max-h-[250px] overflow-hidden bg-[#0F2145]">
          <Image
            src={a.image.src}
            fill
            alt=""
            aria-hidden="true"
            className="object-cover scale-110 blur-2xl opacity-70"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#0F2145]/40" aria-hidden="true" />
          <Image
            src={a.image.src}
            fill
            alt={a.image.alt}
            className={`object-cover 2xl:object-contain ${STRIP_POSITION}`}
            style={stripPosition(a.image.positionMobile, a.image.position)}
            sizes="100vw"
          />
        </div>
      ) : a.image ? (
        <div className="relative h-[44vw] min-h-[170px] max-h-[360px] overflow-hidden">
          <Image
            src={a.image.src}
            fill
            alt={a.image.alt}
            className={`object-cover ${STRIP_POSITION}`}
            style={stripPosition(a.image.positionMobile, a.image.position)}
            sizes="100vw"
          />
        </div>
      ) : (
        // Photo strip placeholder until the Canva exports land — a quiet band
        // rather than a stock photo that isn't ours.
        <div className="h-14 md:h-20 bg-gradient-to-r from-[#0F2145] via-[#17294A] to-[#0F2145]" />
      )}
      <div className="bg-white px-5 md:px-6 py-10 md:py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-serif text-[#BE9B32] uppercase tracking-[0.12em] md:tracking-[0.18em] text-[22px] sm:text-2xl md:text-3xl lg:text-[34px] mb-3">
            {a.heading}
          </h2>
          <p className="text-center font-serif italic text-[15px] md:text-[17px] text-[#001435] mb-8 md:mb-10">
            {a.tagline}
          </p>

          <h3 className={`${eyebrow} text-[13px] tracking-[0.2em] mb-2`}>Who is this for?</h3>
          <p className="font-serif text-[15px] md:text-[16px] text-[#1b1c1a] mb-8">{a.cardBlurb}</p>

          <h3 className={`${eyebrow} text-[13px] tracking-[0.2em] mb-3`}>What&rsquo;s included with your membership</h3>
          <ul className="flex flex-col md:flex-row md:flex-wrap gap-x-8 gap-y-2 mb-8 md:mb-10">
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
    <div className="bg-[#17294A] px-5 md:px-6 py-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <p className="font-serif text-white text-[16px] md:text-[18px] text-center">
          See what membership is right for you
        </p>
        <LocalizedClientLink
          href={QUIZ_HREF}
          className="inline-flex items-center justify-center w-full sm:w-auto px-7 py-3 text-[13px] md:text-[14px] font-serif font-bold uppercase tracking-[0.08em] bg-[#BE9B32] text-[#001435] hover:bg-[#d4af4c] rounded-sm transition-colors"
        >
          Take the Quiz
        </LocalizedClientLink>
      </div>
    </div>
  )
}

/* ── Icons (inline so the page has no icon-library dependency) ───── */
/*
 * Traced from Brooke's deck (catholicowned_sales_page.pptx.pdf): page 2's
 * pillar icons are thin gold line art on navy; page 3's who-we-serve icons
 * are solid gold glyphs with white cut lines; page 8's why-join icons are
 * navy outlines with a gold accent. Redrawn on a 24-unit grid rather than
 * embedding the deck's 600×392 bitmaps.
 */

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

const GOLD = "#8A6D1F"
const NAVY = "#17294A"

function PillarIcon({ name }: { name: (typeof FOUNDING_PILLARS)[number]["icon"] }) {
  const cls = "text-[#E9C55A] w-9 h-9"
  switch (name) {
    case "cross":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...line} aria-hidden="true">
          <path d="M12 3v18M8 8.5h8" />
        </svg>
      )
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...line} aria-hidden="true">
          <rect x="3.5" y="6" width="17" height="14.5" rx="2" />
          <path d="M3.5 10.5h17M8.5 3.5v4M15.5 3.5v4" />
        </svg>
      )
    case "rosary":
      // A beaded ring with the small cross hanging from it.
      return (
        <svg viewBox="0 0 24 24" className={cls} {...line} aria-hidden="true">
          <circle cx="12" cy="9" r="5.5" strokeWidth="1.9" strokeDasharray="0.1 2.1" />
          <path d="M12 14.5v6M9.75 17.5h4.5" />
        </svg>
      )
    case "scales":
      return (
        <svg viewBox="0 0 24 24" className={cls} {...line} aria-hidden="true">
          <path d="M12 3.5v16.5M8.5 20.5h7M4.5 6.5h15" />
          <path d="M4.5 6.5l-3 6.5M4.5 6.5l3 6.5M1.5 13a3 3 0 0 0 6 0" />
          <path d="M19.5 6.5l-3 6.5M19.5 6.5l3 6.5M16.5 13a3 3 0 0 0 6 0" />
        </svg>
      )
  }
}

function AudienceIcon({ name }: { name: Audience["key"] }) {
  const cls = "w-9 h-9"
  switch (name) {
    case "professionals":
      // Briefcase: solid body, handle tab, one white cut across the middle.
      return (
        <svg viewBox="0 0 24 24" className={cls} fill={GOLD} aria-hidden="true">
          <rect x="9" y="4" width="6" height="4.5" rx="0.8" />
          <rect x="2" y="7.5" width="20" height="13" rx="2" />
          <rect x="2" y="12.6" width="20" height="1.4" fill="#fff" />
        </svg>
      )
    case "local":
      // Storefront: wide awning over a body with two white column cuts.
      return (
        <svg viewBox="0 0 24 24" className={cls} fill={GOLD} aria-hidden="true">
          <rect x="2" y="3.5" width="20" height="4.5" rx="0.6" />
          <rect x="4" y="9.5" width="16" height="11" rx="0.6" />
          <rect x="7" y="9.5" width="1.4" height="11" fill="#fff" />
          <rect x="15.6" y="9.5" width="1.4" height="11" fill="#fff" />
        </svg>
      )
    case "merchant":
      // Open gift box: body split by a ribbon, lid flaps thrown open.
      return (
        <svg viewBox="0 0 24 24" className={cls} fill={GOLD} aria-hidden="true">
          <rect x="3" y="10.5" width="18" height="10.5" rx="0.6" />
          <rect x="11.3" y="10.5" width="1.4" height="10.5" fill="#fff" />
          <rect x="3" y="13.3" width="18" height="1.4" fill="#fff" />
          <path
            d="M12 10L3 4.5M12 10l9-5.5M12 10V3"
            fill="none"
            stroke={GOLD}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      )
    case "enterprise":
      // Office block: three rows of window slits and a door.
      return (
        <svg viewBox="0 0 24 24" className={cls} fill={GOLD} aria-hidden="true">
          <rect x="6" y="2.5" width="12" height="19" rx="0.6" />
          {[5.5, 9.5, 13.5].map((y) =>
            [8.3, 11.3, 14.3].map((x) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="1.4" height="2.2" fill="#fff" />
            ))
          )}
          <rect x="11" y="17.5" width="2" height="4" fill="#fff" />
        </svg>
      )
  }
}

function WhyIcon({ name }: { name: (typeof WHY_JOIN)[number]["icon"] }) {
  const cls = "w-12 h-12"
  const navy = { ...line, stroke: NAVY, strokeWidth: 1.8 }
  const gold = { ...line, stroke: GOLD, strokeWidth: 2 }
  switch (name) {
    case "search":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <circle cx="10" cy="10" r="6.5" {...navy} />
          <path d="M15 15l6 6" {...gold} />
        </svg>
      )
    case "badge":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <path d="M12 2.5l9.5 9.5-9.5 9.5L2.5 12z" {...navy} />
          <path d="M8.5 12.5l2.6 2.6L17 9.5" {...gold} />
        </svg>
      )
    case "support":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <circle cx="12" cy="12" r="4.8" {...navy} />
          <circle cx="12" cy="12" r="1.7" fill={GOLD} />
          <path
            d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"
            {...gold}
          />
        </svg>
      )
    case "community":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden="true">
          <circle cx="12" cy="6.5" r="2.7" {...navy} />
          <circle cx="6" cy="10.5" r="2.2" {...navy} />
          <circle cx="18" cy="10.5" r="2.2" {...navy} />
          <path d="M8 16.5h8" {...gold} />
          <path d="M4.5 20h15" {...navy} />
        </svg>
      )
  }
}
