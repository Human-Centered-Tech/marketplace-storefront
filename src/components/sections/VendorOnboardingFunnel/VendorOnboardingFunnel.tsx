"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import {
  EmployeeRange,
  FunnelState,
  InvoiceRange,
  RecommendedTierKey,
  RevenueRange,
  ScreeningMethod,
  SizingAnswers,
  YearsRange,
} from "./types"
import {
  SCREENING_OPTIONS,
  getTierInfo,
  isPreApprovedScreening,
  recommendTier,
} from "./routing"

// Tier-aware "Book a call" Calendly links. Enterprise (Tier 3 / $2,999) books
// the enterprise call; every other tier books the general membership call;
// the financial dead-end books the Arimathea partner intro call.
const CALENDLY_MEMBERSHIP_URL =
  "https://calendly.com/business-catholicowned/catholic-owned-membership"
const CALENDLY_ENTERPRISE_URL =
  "https://calendly.com/business-catholicowned/catholic-owned-enterprise"
const ARIMATHEA_CALENDLY_URL =
  "https://calendly.com/daren-arimatheainvesting/catholic-owned-discussion"
const CALENDLY_BY_TIER: Partial<Record<RecommendedTierKey, string>> = {
  tier3: CALENDLY_ENTERPRISE_URL,
  // Tier 4 ($10k, top tier) books the enterprise call too — not the general
  // membership fallback.
  tier4: CALENDLY_ENTERPRISE_URL,
}
const calendlyForTier = (key: RecommendedTierKey): string =>
  CALENDLY_BY_TIER[key] ?? CALENDLY_MEMBERSHIP_URL

// Every funnel path starts at the Founding Pillars gate (initialState.step),
// and its "Agree and continue" button is disabled until all four pillars are
// affirmed — so reaching any register link below PROVES the vendor affirmed.
// We forward that affirmation to /user/register so the signup submit can
// persist it on customer.metadata (see RegisterForm + lib/data/customer
// signup()). Without this the affirmation was captured nowhere and sent
// nowhere — it died with the step's local state.
const PILLARS_AFFIRMED_PARAM = "&pillars_affirmed=1"

const YEARS_OPTIONS: YearsRange[] = ["0-3", "4-7", "8-10", "11+"]
const REVENUE_OPTIONS: RevenueRange[] = [
  "<$50,000",
  "$50,000-$100,000",
  ">$100,000",
  ">$250,000",
]
const EMPLOYEE_OPTIONS: EmployeeRange[] = ["1", "2-5", "6-10", "11-20", "21+"]
const INVOICE_OPTIONS: InvoiceRange[] = [
  "$0-$250",
  "$250-$500",
  "$500-$1,500",
  "$1,500-$3,000",
  "$3,000+",
]

const initialState: FunnelState = { step: "founding_pillars" }

export const VendorOnboardingFunnel = () => {
  const [state, setState] = useState<FunnelState>(initialState)

  // Claim flow: when the questionnaire is entered from "claim your listing"
  // (/sell/onboarding?claim_listing=…&return_to=…), carry those params onto
  // every register link so the claim context survives the quiz — the
  // register page pre-fills/skips-auto-create on claim_listing, and the
  // backend charges the recommended_tier the quiz assigns.
  const searchParams = useSearchParams()
  const claimListing = searchParams.get("claim_listing")
  const returnTo = searchParams.get("return_to")
  const claimSuffix = claimListing
    ? `&claim_listing=${encodeURIComponent(claimListing)}` +
      (returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : "")
    : ""

  const reset = () => setState(initialState)

  return (
    <main className="min-h-screen bg-[#faf9f5] py-16 px-6 lg:px-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <p className="text-[#BE9B32] text-[12px] font-semibold uppercase tracking-[0.2em]">
            Merchant Onboarding
          </p>
          {state.step !== "founding_pillars" &&
            state.step !== "service_area" && (
              <button
                onClick={reset}
                className="text-[13px] text-[#44474e] hover:text-[#001435] underline"
              >
                Start over
              </button>
            )}
        </div>

        {state.step === "founding_pillars" && (
          <FoundingPillarsStep
            onAgree={() =>
              setState({
                step: "service_area",
              })
            }
          />
        )}

        {state.step === "service_area" && (
          <ServiceAreaStep
            onSelect={(isLocalOnly) => {
              if (isLocalOnly) {
                setState({
                  step: "recommended_tier",
                  serviceAreaIsLocalOnly: true,
                  recommendedTier: "local",
                })
                return
              }
              setState({
                step: "product_or_service",
                serviceAreaIsLocalOnly: false,
              })
            }}
          />
        )}

        {state.step === "product_or_service" && (
          <ProductOrServiceStep
            onSelect={(choice) => {
              if (choice === "product") {
                setState({ step: "product_or_service", productOrService: "product" })
                // Product sellers skip the sizing quiz and go straight to
                // signup. The chart maps them to the Marketplace Merchant
                // Membership tier ($99/yr + 11%) — pass it through so the
                // recommended_tier persistence pipeline catches it the
                // same way service-provider tiers are captured.
                window.location.href =
                  "/user/register?vendor=true&recommended_tier=merchant" +
                  PILLARS_AFFIRMED_PARAM +
                  claimSuffix
                return
              }
              setState({
                step: "service_is_financial",
                productOrService: "service",
              })
            }}
          />
        )}

        {state.step === "service_is_financial" && (
          <IsFinancialStep
            onSelect={(isFinancial) => {
              setState({
                ...state,
                step: isFinancial ? "financial_screening" : "service_for_profit",
                isFinancial,
              })
            }}
          />
        )}

        {state.step === "financial_screening" && (
          <ScreeningStep
            onSelect={(method) => {
              const preApproved = isPreApprovedScreening(method)
              if (preApproved) {
                // Pre-approved financial orgs are shown the $699 tier
                // (tier2_business) card — buy now or book a call — instead of
                // going straight to register with no price (which also left
                // recommended_tier blank, so they defaulted to the "product"
                // business type). Decided 6/26 with Brooke.
                setState({
                  ...state,
                  step: "recommended_tier",
                  screeningMethod: method,
                  recommendedTier: "tier2_business",
                })
                return
              }
              setState({
                ...state,
                step: "financial_book_call",
                screeningMethod: method,
              })
            }}
          />
        )}

        {state.step === "financial_preapproved" && (
          <PreApprovedStep claimSuffix={claimSuffix} />
        )}

        {state.step === "financial_book_call" && <BookCallStep />}

        {state.step === "service_for_profit" && (
          <ForProfitStep
            onSelect={(isNonProfit) => {
              setState({
                ...state,
                step: "sizing_quiz",
                isNonProfit,
                sizing: { isNonProfit },
              })
            }}
          />
        )}

        {state.step === "sizing_quiz" && state.sizing && (
          <SizingQuizStep
            answers={state.sizing}
            onSubmit={(answers) => {
              const tier = recommendTier(answers)
              setState({
                ...state,
                step: "recommended_tier",
                sizing: answers,
                recommendedTier: tier,
              })
            }}
          />
        )}

        {state.step === "recommended_tier" && state.recommendedTier && (
          <RecommendedTierStep
            tierKey={state.recommendedTier}
            claimSuffix={claimSuffix}
          />
        )}
      </div>
    </main>
  )
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-2xl border border-[#001435]/10 shadow-sm p-8 lg:p-12 ${className}`}
  >
    {children}
  </div>
)

const StepHeading: React.FC<{
  eyebrow?: string
  title: string
  subtitle?: string
}> = ({ eyebrow, title, subtitle }) => (
  <div className="mb-8">
    {eyebrow && (
      <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">
        {eyebrow}
      </p>
    )}
    <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#001435] mb-3">
      {title}
    </h2>
    {subtitle && (
      <p className="text-[15px] text-[#44474e] leading-relaxed">{subtitle}</p>
    )}
  </div>
)

const ChoiceButton: React.FC<{
  onClick: () => void
  primary?: boolean
  children: React.ReactNode
}> = ({ onClick, primary, children }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
      primary
        ? "border-[#BE9B32] bg-[#BE9B32]/5 hover:bg-[#BE9B32]/10"
        : "border-[#001435]/15 hover:border-[#BE9B32] hover:bg-[#faf9f5]"
    }`}
  >
    {children}
  </button>
)

// The four Founding Pillars, in display order. Each is an individual
// affirmation the vendor must tick — the icon + copy are unchanged from the
// /sell marketing card so the gate reads as a continuation of that page.
const FOUNDING_PILLARS: { icon: React.ReactNode; text: React.ReactNode }[] = [
  {
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#BE9B32"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-4"
      >
        <path d="M10 3h4v6h6v4h-6v8h-4v-8H4V9h6V3z" />
      </svg>
    ),
    text: (
      <>Faithful to the Magisterium &amp; in Full Communion with Rome</>
    ),
  },
  {
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#BE9B32"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-4"
      >
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <path
          d="M12 17.5l-2.5-2.5a1.7 1.7 0 010-2.4 1.7 1.7 0 012.5 0l0 0a1.7 1.7 0 012.5 0 1.7 1.7 0 010 2.4z"
          fill="#BE9B32"
        />
      </svg>
    ),
    text: (
      <>
        Regularly practicing, sincere Catholic in good standing (Mass on
        Sundays + Holydays, regular confession)
      </>
    ),
  },
  {
    icon: (
      // Praying-hands icon from Phosphor Icons (MIT)
      <svg
        width="32"
        height="32"
        viewBox="0 0 256 256"
        fill="#BE9B32"
        className="mb-4"
      >
        <path d="M235.32,180l-36.24-36.25L162.62,23.46A21.76,21.76,0,0,0,128,12.93,21.76,21.76,0,0,0,93.38,23.46L56.92,143.76,20.68,180a16,16,0,0,0,0,22.62l32.69,32.69a16,16,0,0,0,22.63,0L124.28,187a40.68,40.68,0,0,0,3.72-4.29,40.68,40.68,0,0,0,3.72,4.29L180,235.32a16,16,0,0,0,22.63,0l32.69-32.69A16,16,0,0,0,235.32,180ZM64.68,224,32,191.32l12.69-12.69,32.69,32.69ZM120,158.75a23.85,23.85,0,0,1-7,17L88.68,200,56,167.32l13.65-13.66a8,8,0,0,0,2-3.34l37-122.22A5.78,5.78,0,0,1,120,29.78Zm23,17a23.85,23.85,0,0,1-7-17v-129a5.78,5.78,0,0,1,11.31-1.68l37,122.22a8,8,0,0,0,2,3.34l14.49,14.49-33.4,32ZM191.32,224l-12.56-12.57,33.39-32L224,191.32Z" />
      </svg>
    ),
    text: <>Prays the Rosary or practices other sincere daily devotion(s)</>,
  },
  {
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#BE9B32"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-4"
      >
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="5" y1="6" x2="19" y2="6" />
        <path d="M5 6l-3 7c0 2 1.5 3 3 3s3-1 3-3l-3-7z" />
        <path d="M19 6l-3 7c0 2 1.5 3 3 3s3-1 3-3l-3-7z" />
        <line x1="9" y1="21" x2="15" y2="21" />
      </svg>
    ),
    text: (
      <>
        Operates business in accordance with the principles of the Catholic
        faith
      </>
    ),
  },
]

// One navy pillar tile = one checkable affirmation. The whole tile is a
// <label> so clicking anywhere toggles its checkbox; the gold check badge in
// the corner makes the selected/affirmed state obvious.
const PillarTile: React.FC<{
  checked: boolean
  onToggle: () => void
  icon: React.ReactNode
  children: React.ReactNode
}> = ({ checked, onToggle, icon, children }) => (
  <label
    className={`relative bg-[#001435] rounded-xl p-6 pt-9 flex flex-col items-center text-center cursor-pointer transition-all ${
      checked ? "ring-2 ring-[#BE9B32]" : "ring-0 hover:ring-1 hover:ring-[#BE9B32]/50"
    }`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      className="sr-only"
    />
    <span
      aria-hidden="true"
      className={`absolute top-3 right-3 w-6 h-6 rounded-md border flex items-center justify-center text-[14px] font-bold transition-colors ${
        checked
          ? "bg-[#BE9B32] border-[#BE9B32] text-[#001435]"
          : "bg-transparent border-white/40 text-transparent"
      }`}
    >
      ✓
    </span>
    {icon}
    <p className="text-[14px] text-white leading-relaxed">{children}</p>
  </label>
)

// Pre-funnel gate. Vendors must affirm EACH of the four pillars (tick all
// four checkboxes) before "Agree and continue" enables and any onboarding
// question fires. The selections are captured in state here and the
// affirmation is forwarded to the register submit via PILLARS_AFFIRMED_PARAM,
// where signup() persists it on customer.metadata. Intentionally not numbered
// ("Step 0 of 5") — it's an eligibility affirmation, not a product question.
const FoundingPillarsStep: React.FC<{ onAgree: () => void }> = ({
  onAgree,
}) => {
  const [checked, setChecked] = useState<boolean[]>(
    FOUNDING_PILLARS.map(() => false)
  )
  const allChecked = checked.every(Boolean)
  const toggle = (i: number) =>
    setChecked((prev) => prev.map((c, idx) => (idx === i ? !c : c)))

  return (
    <div className="bg-[#faf9f5] rounded-2xl border border-[#BE9B32]/40 shadow-sm p-8 lg:p-12">
      <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#001435] text-center mb-6">
        Our Founding Pillars
      </h2>
      <p className="text-[15px] lg:text-base text-[#001435] font-medium mb-3">
        Every Featured &amp; Verified business must align with our signature
        Founding Pillars:
      </p>
      <p className="text-[13px] text-[#44474e] mb-8">
        Check each pillar to affirm that you and your business meet it.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {FOUNDING_PILLARS.map((pillar, i) => (
          <PillarTile
            key={i}
            checked={checked[i]}
            onToggle={() => toggle(i)}
            icon={pillar.icon}
          >
            {pillar.text}
          </PillarTile>
        ))}
      </div>

      <p className="text-[13px] text-[#44474e] leading-relaxed text-center italic mb-8">
        These pillars ensure that Catholic Owned&reg; remains a trusted
        resource for the faithful—and a powerful witness for Christ in the
        marketplace.
      </p>

      <button
        onClick={() => allChecked && onAgree()}
        disabled={!allChecked}
        className="w-full bg-[#BE9B32] text-[#001435] font-semibold py-3 rounded-xl hover:bg-[#DECF8F] shadow-lg shadow-[#BE9B32]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#BE9B32]"
      >
        {allChecked ? "Agree and continue" : "Affirm all four pillars to continue"}
      </button>
    </div>
  )
}

const ServiceAreaStep: React.FC<{
  onSelect: (isLocalOnly: boolean) => void
}> = ({ onSelect }) => (
  <Card>
    <StepHeading
      eyebrow="Step 1 of 5"
      title="How far does your business reach?"
      subtitle="Is your service area local only, or are you able to serve clients beyond your local area?"
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChoiceButton onClick={() => onSelect(true)}>
        <p className="font-serif text-lg font-bold text-[#001435] mb-1">
          Local only
        </p>
        <p className="text-[14px] text-[#44474e]">
          We serve customers in our local area only.
        </p>
      </ChoiceButton>
      <ChoiceButton onClick={() => onSelect(false)}>
        <p className="font-serif text-lg font-bold text-[#001435] mb-1">
          Beyond local
        </p>
        <p className="text-[14px] text-[#44474e]">
          We can serve customers anywhere in the country (or world).
        </p>
      </ChoiceButton>
    </div>
  </Card>
)

const ProductOrServiceStep: React.FC<{
  onSelect: (choice: "product" | "service") => void
}> = ({ onSelect }) => (
  <Card>
    <StepHeading
      eyebrow="Step 2 of 5"
      title="Do you sell a product or a service?"
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChoiceButton onClick={() => onSelect("product")}>
        <p className="font-serif text-lg font-bold text-[#001435] mb-1">
          Products
        </p>
        <p className="text-[14px] text-[#44474e]">
          Put your products in front of Catholics who are actively choosing where
          to spend.
        </p>
      </ChoiceButton>
      <ChoiceButton onClick={() => onSelect("service")}>
        <p className="font-serif text-lg font-bold text-[#001435] mb-1">
          Services
        </p>
        <p className="text-[14px] text-[#44474e]">
          List your service business — financial, professional, trades, and
          more.
        </p>
      </ChoiceButton>
    </div>
  </Card>
)

const IsFinancialStep: React.FC<{
  onSelect: (isFinancial: boolean) => void
}> = ({ onSelect }) => (
  <Card>
    <StepHeading
      eyebrow="Step 3 of 5"
      title="Are you a Bank/Credit Union, Financial Advisor, Life Insurance agent, or Investment Professional?"
      subtitle="Catholic Owned users rely on us to vet financial professionals who help them invest in line with their values."
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChoiceButton onClick={() => onSelect(true)}>
        <p className="font-serif text-lg font-bold text-[#001435]">Yes</p>
        <p className="text-[14px] text-[#44474e] mt-1">
          Financial services
        </p>
      </ChoiceButton>
      <ChoiceButton onClick={() => onSelect(false)}>
        <p className="font-serif text-lg font-bold text-[#001435]">No</p>
        <p className="text-[14px] text-[#44474e] mt-1">
          Other service business
        </p>
      </ChoiceButton>
    </div>
  </Card>
)

const ScreeningStep: React.FC<{
  onSelect: (method: ScreeningMethod) => void
}> = ({ onSelect }) => {
  const [value, setValue] = useState<ScreeningMethod | "">("")
  return (
    <Card>
      <StepHeading
        eyebrow="Step 4 of 5 — Financial Services"
        title="Which screening process or organization do you use?"
        subtitle="Select the option that best represents how you screen investments. If your method is already approved, you can skip the line."
      />
      <select
        value={value}
        onChange={(e) => setValue(e.target.value as ScreeningMethod)}
        className="w-full p-4 rounded-xl border-2 border-[#001435]/15 bg-white text-[15px] text-[#001435] mb-6 focus:border-[#BE9B32] focus:outline-none"
      >
        <option value="" disabled>
          Select a screening method…
        </option>
        {SCREENING_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        disabled={!value}
        onClick={() => value && onSelect(value as ScreeningMethod)}
        className="w-full py-4 rounded-xl bg-[#001435] text-white font-semibold text-[13px] uppercase tracking-[0.1em] hover:bg-[#17294a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </Card>
  )
}

const PreApprovedStep: React.FC<{ claimSuffix?: string }> = ({
  claimSuffix = "",
}) => (
  <Card>
    <StepHeading
      eyebrow="You're pre-approved"
      title="Skip the line"
      subtitle="Since you're already using pre-approved screening methods aligned with the USCCB, you can proceed with creating your listing right away."
    />
    <LocalizedClientLink
      href={`/user/register?vendor=true${PILLARS_AFFIRMED_PARAM}${claimSuffix}`}
      className="inline-flex items-center px-10 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl bg-[#BE9B32] text-[#001435] hover:bg-[#d4af4c] shadow-lg transition-colors"
    >
      Create your listing
    </LocalizedClientLink>
  </Card>
)

const BookCallStep: React.FC = () => (
  <Card>
    <StepHeading
      eyebrow="One more step"
      title="Schedule a quick intro call"
      subtitle="Your next step is a simple introductory call with our partners at Arimathea to ensure a good fit. After your call, we'll reach out directly with next steps."
    />
    <a
      href={ARIMATHEA_CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center px-10 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl bg-[#BE9B32] text-[#001435] hover:bg-[#d4af4c] shadow-lg transition-colors"
    >
      Book a call with Arimathea
    </a>
    <p className="mt-6 text-[13px] text-[#44474e] italic">
      Thank you so much for your interest and for being part of Catholic Owned.
    </p>
  </Card>
)

const ForProfitStep: React.FC<{
  onSelect: (isNonProfit: boolean) => void
}> = ({ onSelect }) => (
  <Card>
    <StepHeading
      eyebrow="Step 4 of 5"
      title="Are you a for-profit or non-profit?"
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChoiceButton onClick={() => onSelect(false)}>
        <p className="font-serif text-lg font-bold text-[#001435]">For-profit</p>
      </ChoiceButton>
      <ChoiceButton onClick={() => onSelect(true)}>
        <p className="font-serif text-lg font-bold text-[#001435]">Non-profit</p>
      </ChoiceButton>
    </div>
  </Card>
)

const SizingQuizStep: React.FC<{
  answers: SizingAnswers
  onSubmit: (answers: SizingAnswers) => void
}> = ({ answers, onSubmit }) => {
  const [local, setLocal] = useState<SizingAnswers>(answers)
  const isComplete =
    local.years && local.revenueOrBudget && local.employees && local.avgInvoice

  const yearsLabel = local.isNonProfit ? "Years operating" : "Years in business"
  const revenueLabel = local.isNonProfit ? "Annual budget" : "Annual revenue"

  return (
    <Card>
      <StepHeading
        eyebrow="Step 5 of 5"
        title="Tell us a bit about your business"
        subtitle="A few quick details help us recommend the right tier for you."
      />
      <div className="space-y-6">
        <RadioRow
          label={yearsLabel}
          options={YEARS_OPTIONS}
          value={local.years}
          onChange={(v) => setLocal({ ...local, years: v as YearsRange })}
        />
        <RadioRow
          label={revenueLabel}
          options={REVENUE_OPTIONS}
          value={local.revenueOrBudget}
          onChange={(v) =>
            setLocal({ ...local, revenueOrBudget: v as RevenueRange })
          }
        />
        <RadioRow
          label="Number of employees"
          options={EMPLOYEE_OPTIONS}
          value={local.employees}
          onChange={(v) =>
            setLocal({ ...local, employees: v as EmployeeRange })
          }
        />
        <RadioRow
          label="Average invoice or sale amount"
          options={INVOICE_OPTIONS}
          value={local.avgInvoice}
          onChange={(v) =>
            setLocal({ ...local, avgInvoice: v as InvoiceRange })
          }
        />
      </div>
      <button
        disabled={!isComplete}
        onClick={() => isComplete && onSubmit(local)}
        className="mt-8 w-full py-4 rounded-xl bg-[#001435] text-white font-semibold text-[13px] uppercase tracking-[0.1em] hover:bg-[#17294a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        See my recommended tier
      </button>
    </Card>
  )
}

const RadioRow: React.FC<{
  label: string
  options: readonly string[]
  value?: string
  onChange: (v: string) => void
}> = ({ label, options, value, onChange }) => (
  <fieldset>
    <legend className="text-[13px] font-semibold text-[#001435] mb-2">
      {label}
    </legend>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className={`px-4 py-2 rounded-full border cursor-pointer text-[13px] transition-colors ${
            value === opt
              ? "border-[#BE9B32] bg-[#BE9B32]/10 text-[#001435] font-semibold"
              : "border-[#001435]/15 text-[#44474e] hover:border-[#BE9B32]/50"
          }`}
        >
          <input
            type="radio"
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="sr-only"
          />
          {opt}
        </label>
      ))}
    </div>
  </fieldset>
)

const RecommendedTierStep: React.FC<{
  tierKey: import("./types").RecommendedTierKey
  claimSuffix?: string
}> = ({ tierKey, claimSuffix = "" }) => {
  const tier = getTierInfo(tierKey)
  const upsell = tier.upsellTier ? getTierInfo(tier.upsellTier) : undefined

  // Send service sellers through the same draft-mode signup as product
  // sellers. The price shown here is informational ("you'll pay this
  // when you go live") — actual payment is collected at the /go-live
  // step in the vendor portal, after they've set up their store.
  const signupHref = `/user/register?vendor=true&recommended_tier=${tier.key}${PILLARS_AFFIRMED_PARAM}${claimSuffix}`

  return (
    <Card>
      <StepHeading
        eyebrow="Recommended tier"
        title={tier.name}
        subtitle="Based on your answers, here's the plan that fits your business best."
      />
      <div className="bg-[#faf9f5] rounded-xl p-8 mb-6 border border-[#BE9B32]/30">
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-serif text-5xl font-bold text-[#001435]">
            {tier.price}
          </span>
          <span className="text-[#44474e]">{tier.period}</span>
        </div>
        <p className="text-[13px] text-[#44474e] leading-relaxed mb-2">
          You won't be charged until you publish your listing and go live —
          take your time setting things up first.
        </p>
        {tier.localBoostUpsell && (
          <p className="text-[13px] text-[#44474e] leading-relaxed mb-2">
            <span className="font-semibold text-[#001435]">Local Boost</span>{" "}
            available — $150/month for 30K local Catholic impressions.
          </p>
        )}
        {upsell && (
          <p className="text-[13px] text-[#44474e] leading-relaxed">
            <span className="font-semibold text-[#001435]">{upsell.name}</span>{" "}
            ({upsell.price}) is also available — we can discuss it on the call.
          </p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <LocalizedClientLink
          href={signupHref}
          className="flex-1 inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl bg-[#BE9B32] text-[#001435] hover:bg-[#d4af4c] shadow-lg transition-colors"
        >
          Create my merchant account
        </LocalizedClientLink>
        {tier.bookCallOption && (
          <a
            href={calendlyForTier(tierKey)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl bg-white border-2 border-[#001435] text-[#001435] hover:bg-[#001435] hover:text-white transition-colors"
          >
            Book a call instead
          </a>
        )}
      </div>
    </Card>
  )
}
