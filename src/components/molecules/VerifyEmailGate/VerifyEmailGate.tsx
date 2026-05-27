"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Full-content gate shown in place of the account dashboard when the
 * customer's email is not yet verified (and their account is past the
 * grandfather cutoff). Resend posts to /api/resend-verification, the same
 * route the soft banner uses.
 */
export function VerifyEmailGate({ email }: { email?: string | null }) {
  const router = useRouter()
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle")

  // The gate lives in a server layout, so once the user verifies (often in a
  // different tab/device via the email link) we re-run the server render when
  // they return to this tab — router.refresh() re-evaluates the gate and drops
  // them into the dashboard, no manual reload or re-login needed.
  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        router.refresh()
      }
    }
    document.addEventListener("visibilitychange", refreshIfVisible)
    window.addEventListener("focus", refreshIfVisible)
    return () => {
      document.removeEventListener("visibilitychange", refreshIfVisible)
      window.removeEventListener("focus", refreshIfVisible)
    }
  }, [router])

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
    <main className="max-w-2xl mx-auto px-4 py-16 lg:py-24">
      <div className="bg-[rgba(var(--neutral-0))] border border-[rgba(var(--neutral-100))] rounded-sm p-8 lg:p-12 text-center">
        <p className="label-sm text-secondary tracking-[0.15em] mb-2">
          One more step
        </p>
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-primary mb-4">
          Verify your email to continue
        </h1>
        <p className="text-[15px] text-secondary mb-2">
          We sent a verification link
          {email ? (
            <>
              {" "}
              to <span className="text-primary font-semibold">{email}</span>
            </>
          ) : null}
          . Please open it to unlock your account dashboard.
        </p>
        <p className="text-[13px] text-secondary mb-8">
          Already verified? Refresh this page.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onResend}
            disabled={status === "sending" || status === "sent"}
            className="bg-navy text-white px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] rounded-sm disabled:opacity-50 hover:bg-navy-dark transition-colors"
          >
            {status === "sending"
              ? "Sending..."
              : status === "sent"
                ? "Email sent ✓"
                : status === "error"
                  ? "Try again"
                  : "Resend verification email"}
          </button>
        </div>

        {status === "error" && (
          <p className="text-[13px] text-red-600 mt-4">
            Couldn&apos;t send right now — please try again in a moment.
          </p>
        )}
      </div>
    </main>
  )
}
