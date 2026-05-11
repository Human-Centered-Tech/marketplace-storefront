"use client"

import { useState } from "react"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import {
  EmployeeRange,
  FunnelState,
  InvoiceRange,
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

const ARIMATHEA_CALENDLY_URL =
  "https://calendly.com/daren-arimatheainvesting/catholic-owned-discussion"

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

const initialState: FunnelState = { step: "service_area" }

export const VendorOnboardingFunnel = () => {
  const [state, setState] = useState<FunnelState>(initialState)

  const reset = () => setState(initialState)

  return (
    <main className="min-h-screen bg-[#faf9f5] py-16 px-6 lg:px-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <p className="text-[#BE9B32] text-[12px] font-semibold uppercase tracking-[0.2em]">
            Vendor Onboarding
          </p>
          {state.step !== "service_area" && (
            <button
              onClick={reset}
              className="text-[13px] text-[#44474e] hover:text-[#001435] underline"
            >
              Start over
            </button>
          )}
        </div>

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
                window.location.href = "/user/register?vendor=true"
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
              setState({
                ...state,
                step: preApproved
                  ? "financial_preapproved"
                  : "financial_book_call",
                screeningMethod: method,
              })
            }}
          />
        )}

        {state.step === "financial_preapproved" && (
          <PreApprovedStep />
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
          <RecommendedTierStep tierKey={state.recommendedTier} />
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

const PreApprovedStep: React.FC = () => (
  <Card>
    <StepHeading
      eyebrow="You're pre-approved"
      title="Skip the line"
      subtitle="Since you're already using pre-approved screening methods aligned with the USCCB, you can proceed with creating your listing right away."
    />
    <LocalizedClientLink
      href="/user/register?vendor=true"
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
}> = ({ tierKey }) => {
  const tier = getTierInfo(tierKey)
  const upsell = tier.upsellTier ? getTierInfo(tier.upsellTier) : undefined

  const checkoutHref = `/user/register?vendor=true&recommended_tier=${tier.key}&return_to=${encodeURIComponent(
    `/user/directory/checkout?tier=${tier.key}`
  )}`

  return (
    <Card>
      <StepHeading
        eyebrow="Recommended tier"
        title={tier.name}
        subtitle="Based on your answers, here's the plan that fits your business best."
      />
      <div className="bg-[#faf9f5] rounded-xl p-8 mb-6 border border-[#BE9B32]/30">
        <div className="flex items-baseline gap-2 mb-4">
          <span
            className="font-serif text-5xl font-bold text-[#001435]"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            {tier.price}
          </span>
          <span className="text-[#44474e]">{tier.period}</span>
        </div>
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
          href={checkoutHref}
          className="flex-1 inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl bg-[#BE9B32] text-[#001435] hover:bg-[#d4af4c] shadow-lg transition-colors"
        >
          Continue to checkout
        </LocalizedClientLink>
        {tier.bookCallOption && (
          <a
            href={ARIMATHEA_CALENDLY_URL}
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
