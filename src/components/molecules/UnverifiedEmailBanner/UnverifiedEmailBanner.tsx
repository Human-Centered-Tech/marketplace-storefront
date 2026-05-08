"use client"

import { useState } from "react"

/**
 * Persistent banner shown on the user dashboard when email_verified is
 * not yet set. Includes a "Resend" button that POSTs to the backend's
 * send-verification-email route via a server action.
 */
export function UnverifiedEmailBanner({
  email,
  flash,
}: {
  email: string
  flash?: "success" | "error" | null
}) {
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle")

  if (flash === "success") {
    return (
      <div className="bg-[rgba(140,180,120,0.15)] border border-[rgba(140,180,120,0.5)] text-[rgba(60,90,40,1)] px-4 py-3 rounded-sm mb-6 text-[14px]">
        Email verified — thanks!
      </div>
    )
  }

  const onResend = async () => {
    setStatus("sending")
    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) throw new Error()
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="bg-[rgba(190,155,50,0.1)] border border-[rgba(190,155,50,0.5)] text-primary px-4 py-3 rounded-sm mb-6 text-[14px] flex items-center justify-between gap-4 flex-wrap">
      <div>
        {flash === "error"
          ? `That verification link didn't work — it may have expired. `
          : `Please verify your email (${email}) to unlock seller features. `}
        <span className="text-secondary">Check your inbox for the link.</span>
      </div>
      <button
        type="button"
        onClick={onResend}
        disabled={status === "sending" || status === "sent"}
        className="bg-navy text-white px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] rounded-sm disabled:opacity-50 hover:bg-navy-dark transition-colors"
      >
        {status === "sending"
          ? "Sending..."
          : status === "sent"
            ? "Email sent ✓"
            : status === "error"
              ? "Try again"
              : "Resend email"}
      </button>
    </div>
  )
}
