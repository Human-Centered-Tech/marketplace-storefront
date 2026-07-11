"use client"
import {
  FieldError,
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form"
import { Button } from "@/components/atoms"
import { zodResolver } from "@hookform/resolvers/zod"
import { LabeledInput } from "@/components/cells"
import { registerFormSchema, vendorRegisterFormSchema, RegisterFormData } from "./schema"
import { MARKETING_SOURCES } from "./marketing-sources"
import { signup, login, retrieveCustomer } from "@/lib/data/customer"
import { becomeVendor, becomeMerchant } from "@/lib/data/vendor"
import { recordClaimProgress } from "@/lib/data/directory-actions"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PasswordValidator } from "@/components/cells/PasswordValidator/PasswordValidator"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const RegisterForm = ({
  vendorFlow = false,
  recommendedTier,
  claimListingId,
  defaultBusinessName,
  pillarsAffirmed = false,
}: {
  vendorFlow?: boolean
  recommendedTier?: string
  // Set when arriving from the claim flow (?claim_listing=…). Threaded to
  // becomeVendor so it attaches that listing as the new seller's draft
  // (instead of auto-creating a fresh one).
  claimListingId?: string
  // Pre-fills the business name from the listing being claimed, so the
  // claimant doesn't retype it (and doesn't drift to a different name).
  defaultBusinessName?: string
  // True when the vendor reached here through the /sell/onboarding Founding
  // Pillars gate. Recorded on customer.metadata at signup.
  pillarsAffirmed?: boolean
}) => {
  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(vendorFlow ? vendorRegisterFormSchema : registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      businessName: defaultBusinessName ?? "",
      marketingSource: "",
      marketingSubsource: "",
      agreedToTos: false,
    },
  })

  return (
    <FormProvider {...methods}>
      <Form
        vendorFlow={vendorFlow}
        recommendedTier={recommendedTier}
        claimListingId={claimListingId}
        pillarsAffirmed={pillarsAffirmed}
        // Lock the business name when it's pre-filled from a claimed listing
        // so the seller name can't diverge from the listing being claimed.
        businessNameLocked={Boolean(claimListingId && defaultBusinessName)}
      />
    </FormProvider>
  )
}

const Form = ({
  vendorFlow,
  recommendedTier,
  claimListingId,
  pillarsAffirmed = false,
  businessNameLocked = false,
}: {
  vendorFlow: boolean
  recommendedTier?: string
  claimListingId?: string
  pillarsAffirmed?: boolean
  businessNameLocked?: boolean
}) => {
  const router = useRouter()
  const [passwordError, setPasswordError] = useState({
    isValid: false,
    lower: false,
    upper: false,
    "8chars": false,
    symbolOrDigit: false,
  })
  const [error, setError] = useState()
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useFormContext()

  const submit = async (data: FieldValues) => {
    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)
    formData.append("first_name", data.firstName)
    formData.append("last_name", data.lastName)
    formData.append("phone", data.phone)
    if (recommendedTier) {
      formData.append("recommended_tier", recommendedTier)
    }
    // "How did you hear about us?" — stored on customer.metadata for the
    // Freshworks CRM sync. Optional; only sent when filled.
    if (data.marketingSource) {
      formData.append("marketing_source", data.marketingSource)
    }
    if (data.marketingSubsource) {
      formData.append("marketing_subsource", data.marketingSubsource)
    }
    // Founding Pillars affirmation from the /sell/onboarding gate — recorded
    // on customer.metadata by signup(). Sent as a string because FormData
    // values are strings.
    if (pillarsAffirmed) {
      formData.append("founding_pillars_affirmed", "true")
    }

    const res = passwordError.isValid && (await signup(formData))

    if (res && !res?.id) {
      // Bug #2: an EXISTING customer trying to register as a merchant gets
      // "Identity with email already exists" from sdk.auth.register and the
      // form dead-ends. For the merchant (vendorFlow) signup only, this is
      // NOT a dead end — they already have a customer account, so convert it
      // into a merchant instead of re-registering. The brand-new-email happy
      // path below is untouched.
      const alreadyExists = /already exists|identity with email/i.test(
        String(res)
      )
      if (vendorFlow && data.businessName && alreadyExists) {
        // 1) Log in as the existing customer with the password they just
        //    typed (sets the customer auth cookie; also sets the vendor
        //    cookie if they somehow already had a seller).
        await login(formData)

        // Confirm the password actually matched THIS account before we try
        // to convert it. If it didn't, login() left us unauthenticated (or
        // on a different session), so don't silently do nothing — tell them.
        const me = await retrieveCustomer()
        if (
          !me?.id ||
          (me.email || "").trim().toLowerCase() !==
            (data.email || "").trim().toLowerCase()
        ) {
          setError(
            "An account with this email already exists. If it's yours, the password didn't match — please sign in, then use “Become a Merchant.”" as any
          )
          return
        }

        // 2) Convert: create + link a seller for this customer (idempotent).
        const convertFormData = new FormData()
        convertFormData.append("name", data.businessName)
        convertFormData.append("email", data.email)
        convertFormData.append("password", data.password)
        // Funnel context: without the tier, become-merchant can't persist
        // recommended_tier, and resolveRecommendedTier defaults this convert
        // to the product/merchant dashboard even for service outcomes.
        if (recommendedTier)
          convertFormData.append("recommended_tier", recommendedTier)
        if (pillarsAffirmed)
          convertFormData.append("founding_pillars_affirmed", "true")
        if (claimListingId) {
          convertFormData.append("claim_listing", claimListingId)
          const intentId = sessionStorage.getItem(
            `claim_intent_${claimListingId}`
          )
          if (intentId) convertFormData.append("claim_intent_id", intentId)
        }

        const convertRes = await becomeMerchant(convertFormData)
        if (!convertRes.success) {
          setError(convertRes.error as any)
          return
        }

        // 3) Same handoff as a brand-new merchant — drop them into the
        //    vendor portal. (becomeMerchant already set the vendor cookie
        //    and attached/created their directory listing.)
        window.location.assign("/api/vendor-handoff")
        return
      }

      setError(res)
      return
    }

    let vendorReady = false
    if (res?.id && vendorFlow && data.businessName) {
      const vendorFormData = new FormData()
      vendorFormData.append("name", data.businessName)
      vendorFormData.append("email", data.email)
      vendorFormData.append("password", data.password)
      // Claim flow: tells becomeVendor to skip auto-creating a listing
      // (the claimed listing is attached to them on payment instead).
      if (claimListingId) {
        vendorFormData.append("claim_listing", claimListingId)
        const intentId = sessionStorage.getItem(
          `claim_intent_${claimListingId}`
        )
        if (intentId) vendorFormData.append("claim_intent_id", intentId)
      }

      const vendorRes = await becomeVendor(vendorFormData)
      if (!vendorRes.success) {
        setError(vendorRes.error as any)
        return
      }
      vendorReady = true
    }

    // Drop the new vendor straight into the vendor portal so they see the
    // draft-mode banner and the Go Live page — saves a "now what?" moment
    // on /user. Full-page navigation (not router.push) because the handoff
    // route returns an HTML doc that hops to the vendor app with a
    // fragment-encoded token. Non-vendor signups continue to /user.
    if (vendorReady) {
      window.location.assign("/api/vendor-handoff")
      return
    }
    if (res?.id) router.push("/user")
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-[rgba(var(--neutral-0))] rounded-sm border border-[rgba(var(--neutral-100))] p-8 lg:p-10 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-primary mb-2">
              Building the New
              <br />
              Catholic Economy®
            </h1>
            <p className="text-[14px] text-secondary">
              {vendorFlow
                ? "Create your account to start selling on Catholic Owned."
                : "Create your account to start shopping or selling with faithful Catholic businesses."}
            </p>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <LabeledInput
                className="md:w-1/2"
                label="First Name"
                placeholder="John"
                error={errors.firstName as FieldError}
                {...register("firstName")}
              />
              <LabeledInput
                className="md:w-1/2"
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName as FieldError}
                {...register("lastName")}
              />
            </div>
            <LabeledInput
              label="Email Address"
              placeholder="john@example.com"
              error={errors.email as FieldError}
              {...register("email")}
              // Claim-intent breadcrumb (7/9): capture the claimant's email as
              // soon as it's typed, so a drop-off AFTER this point leaves a
              // contactable "started" intent in admin (the Suzi failure mode
              // was a claim lost with no trace at all). Fire-and-forget.
              onBlur={(e) => {
                register("email").onBlur(e)
                if (!claimListingId) return
                const email = (e.target as HTMLInputElement).value
                if (!email || !email.includes("@")) return
                const key = `claim_intent_${claimListingId}`
                recordClaimProgress(claimListingId, {
                  intent_id: sessionStorage.getItem(key),
                  step: "register_email_entered",
                  email,
                })
                  .then((r) => {
                    if (r?.intent_id) sessionStorage.setItem(key, r.intent_id)
                  })
                  .catch(() => {})
              }}
            />
            {vendorFlow && (
              <div>
                <LabeledInput
                  label="Business Name"
                  placeholder="Your business or company name"
                  error={errors.businessName as FieldError}
                  // readOnly (not disabled) when claiming: keeps the value in
                  // the submitted form data — a disabled field submits as
                  // undefined in react-hook-form and would break becomeVendor.
                  readOnly={businessNameLocked}
                  className={businessNameLocked ? "opacity-70" : undefined}
                  {...register("businessName")}
                />
                {businessNameLocked && (
                  <p className="label-sm text-secondary mt-1">
                    From the listing you&apos;re claiming.
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-4">
              <LabeledInput
                className="md:w-1/2"
                label="Password"
                placeholder="••••••••"
                type="password"
                error={errors.password as FieldError}
                {...register("password")}
              />
              <LabeledInput
                className="md:w-1/2"
                label="Phone (optional)"
                placeholder="+1 (555) 000-0000"
                error={errors.phone as FieldError}
                {...register("phone")}
              />
            </div>
            <PasswordValidator
              password={watch("password")}
              setError={setPasswordError}
            />

            <div className="flex flex-col gap-1">
              <label
                htmlFor="marketing_source"
                className="label-sm text-secondary"
              >
                How did you hear about us? (optional)
              </label>
              <select
                id="marketing_source"
                className="border border-[rgba(var(--neutral-100))] rounded-sm px-3 py-2.5 bg-[rgba(var(--neutral-0))] text-[14px] text-primary"
                {...register("marketingSource")}
              >
                <option value="">Select an option…</option>
                {MARKETING_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              {watch("marketingSource") && (
                <LabeledInput
                  label="Where, specifically? (optional)"
                  placeholder="e.g. Instagram, a friend, EWTN…"
                  error={errors.marketingSubsource as FieldError}
                  {...register("marketingSubsource")}
                />
              )}
            </div>

            {error && <p className="label-md text-negative">{error}</p>}

            <div className="mt-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 accent-[rgba(var(--brand-800))]"
                  {...register("agreedToTos")}
                />
                <label htmlFor="terms" className="text-[13px] text-secondary">
                  Agree to the{" "}
                  <LocalizedClientLink
                    href={vendorFlow ? "/merchant-terms" : "/terms"}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-primary"
                  >
                    {vendorFlow ? "Merchant Terms of Service" : "Terms of Service"}
                  </LocalizedClientLink>{" "}
                  &amp; Faithful Catholic Standards of the community.
                </label>
              </div>
              {errors.agreedToTos && (
                <p className="label-md text-negative mt-1">
                  {errors.agreedToTos.message as string}
                </p>
              )}
            </div>

            <Button
              className="w-full bg-navy text-white hover:bg-navy-dark py-3.5 uppercase tracking-[0.1em] text-[13px] font-semibold mt-4"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {vendorFlow ? "Create Merchant Account ✝" : "Create Account ✝"}
            </Button>
          </form>

          <p className="text-center text-[14px] text-secondary mt-6">
            Already have an account?{" "}
            {/* Carry the full funnel context through sign-in (7/10): a bare
                /user link dropped claim_listing + tier + pillars — a
                logged-out claimant with an existing account lost their claim
                by signing in. return_to brings them back here, where the
                logged-in redirect forwards everything to the continue step. */}
            <Link
              href={`/user?return_to=${encodeURIComponent(
                typeof window !== "undefined"
                  ? `/user/register${window.location.search}`
                  : "/user/register"
              )}`}
              className="font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
