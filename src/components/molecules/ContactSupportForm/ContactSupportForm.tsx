"use client"

import { useState } from "react"

/**
 * "Contact Support" form (Brooke 3 Sep 2026, sales-page notes): name,
 * business name, business email, and the question — delivered to
 * support@catholicowned.com through the backend's transactional sender.
 *
 * Submits to our own route handler (/api/contact-support) so the publishable
 * key and backend URL stay server-side. Every outcome is reported inline:
 * sent, validation error, or delivery failure — a silent submit is the
 * pattern the July save-feedback audit exists to prevent.
 */
type Status = "idle" | "sending" | "sent" | "error"

export function ContactSupportForm({
  context,
  onSent,
  className = "",
}: {
  /** Free-text context appended to the email, e.g. "Recommended tier: Tier 2". */
  context?: string
  onSent?: () => void
  className?: string
}) {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === "sending") return
    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get("name") || "").trim(),
      business_name: String(data.get("business_name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      question: String(data.get("question") || "").trim(),
      // Honeypot: real people never see or fill this field.
      website: String(data.get("website") || ""),
      context: context || "",
    }
    if (!payload.name || !payload.business_name || !payload.email || !payload.question) {
      setError("Please fill in every field so we can get back to you.")
      setStatus("error")
      return
    }
    setStatus("sending")
    setError("")
    try {
      const res = await fetch("/api/contact-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(body?.message || "We couldn't send your message. Please try again.")
      }
      setStatus("sent")
      form.reset()
      onSent?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send your message. Please try again.")
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className={`rounded-xl border border-[#BE9B32]/40 bg-[#faf9f5] p-6 text-center ${className}`}
      >
        <p className="font-serif text-xl font-bold text-[#001435] mb-2">Message sent</p>
        <p className="text-[14px] text-[#44474e] leading-relaxed">
          Thank you — our support team will reply to your business email, usually within one
          business day.
        </p>
      </div>
    )
  }

  const field =
    "w-full rounded-lg border border-[#d8dce3] bg-white px-4 py-3 text-[15px] text-[#001435] placeholder:text-[#8a8f98] focus:outline-none focus:ring-2 focus:ring-[#BE9B32]"

  return (
    <form onSubmit={handleSubmit} noValidate className={`flex flex-col gap-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#001435]">
            Name
          </span>
          <input name="name" type="text" autoComplete="name" required className={field} placeholder="Your name" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#001435]">
            Business name
          </span>
          <input
            name="business_name"
            type="text"
            autoComplete="organization"
            required
            className={field}
            placeholder="Your business"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#001435]">
          Business email
        </span>
        <input name="email" type="email" autoComplete="email" required className={field} placeholder="you@yourbusiness.com" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#001435]">
          Your question
        </span>
        <textarea
          name="question"
          required
          rows={5}
          className={field}
          placeholder="How can we help?"
        />
      </label>
      {/* Honeypot — hidden from people, tempting to bots. */}
      <input
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      {status === "error" && error && (
        <p role="alert" className="text-[14px] text-[#9E2A2A]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl bg-[#BE9B32] text-[#001435] hover:bg-[#d4af4c] disabled:opacity-60 disabled:cursor-wait shadow-lg transition-colors"
      >
        {status === "sending" ? "Sending…" : "Send to support"}
      </button>
      <p className="text-[12px] text-[#8a8f98]">
        Goes straight to support@catholicowned.com. We reply to the business email you enter.
      </p>
    </form>
  )
}

/**
 * Button that opens the form in a lightweight dialog. Used on the quiz's
 * recommended-tier card ("[Get Started] [Contact Support]").
 */
export function ContactSupportButton({
  context,
  className = "",
  children = "Contact Support",
}: {
  context?: string
  className?: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#001435]/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-support-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 h-8 w-8 rounded-full text-[#44474e] hover:bg-[#faf9f5]"
            >
              ×
            </button>
            <h2 id="contact-support-title" className="font-serif text-2xl font-bold text-[#001435] mb-1">
              Contact Support
            </h2>
            <p className="text-[14px] text-[#44474e] mb-5">
              Tell us about your business and what you'd like to know.
            </p>
            <ContactSupportForm context={context} />
          </div>
        </div>
      )}
    </>
  )
}
