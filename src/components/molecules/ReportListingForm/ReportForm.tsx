"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button, Textarea } from "@/components/atoms"
import { SelectField } from "../SelectField/SelectField"
import { cn } from "@/lib/utils"

/**
 * The one real report form (contracted MVP D11.2). Used by
 * ReportListingForm (products, trade posts) and ReportSellerForm (shops).
 *
 * It used to be a lie: `onSubmit` was `console.log('Form Data:', data)` and the
 * component flipped straight to "Thank you!" on `isSubmitted`, so a shopper who
 * reported a counterfeit got a confirmation and we got nothing. Now it POSTs to
 * /api/report-listing, which emails the support inbox, and it only shows the
 * thank-you panel after the server has confirmed delivery. A failure shows the
 * failure and keeps what they typed so they can retry.
 *
 * The reasons here MUST stay in sync with the REASONS allowlist in
 * src/app/api/report-listing/route.ts — the server rejects anything else.
 */
export const REPORT_REASONS = [
  "Trademark, Copyright or DMCA Violation",
  "Counterfeit or misrepresented item",
  "Prohibited or offensive content",
  "Scam, fraud or suspicious behavior",
  "Something else",
] as const

const reasonOptions = [
  { label: "", value: "", hidden: true },
  ...REPORT_REASONS.map((r) => ({ label: r, value: r })),
]

const formSchema = z.object({
  reason: z
    .string()
    .refine((v) => (REPORT_REASONS as readonly string[]).includes(v), {
      message: "Please select reason",
    }),
  comment: z.string().trim().min(5, "Please tell us a little more"),
  reporter_email: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), {
      message: "That doesn't look like an email address",
    }),
})

type FormData = z.infer<typeof formSchema>

export type ReportTarget = {
  /** Must be one of the keys the API route knows: product | seller | trade. */
  type: "product" | "seller" | "trade"
  id: string
  title: string
  /** Same-origin path to the public page, e.g. "/products/st-benedict-medal". */
  path: string
}

type Status = "idle" | "sending" | "sent" | "error"

export const ReportForm = ({
  target,
  onClose,
  submitLabel = "Report listing",
}: {
  target: ReportTarget
  onClose: () => void
  submitLabel?: string
}) => {
  const [status, setStatus] = useState<Status>("idle")
  const [sendError, setSendError] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: "", comment: "", reporter_email: "" },
  })

  const onSubmit = async (data: FormData) => {
    if (status === "sending") return
    setStatus("sending")
    setSendError("")
    try {
      const res = await fetch("/api/report-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: target.type,
          entity_id: target.id,
          entity_title: target.title,
          entity_path: target.path,
          reason: data.reason,
          comment: data.comment,
          reporter_email: data.reporter_email,
          // Honeypot — always empty for a real person.
          website: "",
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(
          payload?.message || "We couldn't send your report. Please try again."
        )
      }
      setStatus("sent")
    } catch (err) {
      setSendError(
        err instanceof Error
          ? err.message
          : "We couldn't send your report. Please try again."
      )
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center">
        <div className="px-4 pb-5">
          <h4 className="heading-lg uppercase">Thank you!</h4>
          <p className="max-w-[466px] mx-auto mt-4 text-lg text-secondary">
            Your report is with our team. We&apos;ll check it against our
            guidelines and take the necessary action to keep this a safe place to
            shop. Thank you for helping us maintain a trusted community.
          </p>
        </div>
        <div className="border-t px-4 pt-5">
          <Button className="w-full py-3 uppercase" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="px-4 pb-5">
        <p className="label-sm text-secondary mb-4">
          Reporting: <span className="text-primary">{target.title}</span>
        </p>

        <label className="label-sm">
          <p className={cn(errors?.reason && "text-negative")}>Reason</p>
          <SelectField
            options={reasonOptions}
            {...register("reason")}
            selectOption={(value) => {
              setValue("reason", value)
              clearErrors("reason")
            }}
            className={cn(errors?.reason && "border-negative")}
          />
          {errors?.reason && (
            <p className="label-sm text-negative">{errors.reason.message}</p>
          )}
        </label>

        <label className="label-sm">
          <p className={cn("mt-5", errors?.comment && "text-negative")}>
            Comment
          </p>
          <Textarea
            rows={5}
            {...register("comment")}
            className={cn(errors.comment && "border-negative")}
          />
          {errors?.comment && (
            <p className="label-sm text-negative">{errors.comment.message}</p>
          )}
        </label>

        <label className="label-sm">
          <p className={cn("mt-5", errors?.reporter_email && "text-negative")}>
            Your email (optional)
          </p>
          {/* A raw input, not the Input atom: that atom renders its own
              <label> wrapper, which would nest inside this one. */}
          <input
            type="email"
            autoComplete="email"
            placeholder="Only if you'd like us to follow up"
            {...register("reporter_email")}
            className={cn(
              "w-full px-[16px] py-[12px] border rounded-sm bg-component-secondary focus:border-primary focus:outline-none focus:ring-0",
              errors.reporter_email && "border-negative"
            )}
          />
          {errors?.reporter_email && (
            <p className="label-sm text-negative">
              {errors.reporter_email.message}
            </p>
          )}
        </label>

        {status === "error" && sendError && (
          <p role="alert" className="label-sm text-negative mt-4">
            {sendError}
          </p>
        )}
      </div>

      <div className="border-t px-4 pt-5">
        <Button
          type="submit"
          loading={status === "sending"}
          disabled={status === "sending"}
          className="w-full py-3 uppercase"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
