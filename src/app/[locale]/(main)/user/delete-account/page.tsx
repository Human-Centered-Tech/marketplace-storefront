"use client"

import { useState } from "react"
import { deleteAccount } from "@/lib/data/customer"

export default function DeleteAccountPage() {
  const [submitting, setSubmitting] = useState(false)
  const [reasons, setReasons] = useState<{ code: string; message: string }[] | null>(null)
  const [done, setDone] = useState(false)

  const onDelete = async () => {
    if (
      !window.confirm(
        "Delete your account? This deactivates it now and permanently deletes your personal data after 30 days. This cannot be undone."
      )
    )
      return
    setSubmitting(true)
    setReasons(null)
    try {
      const res = await deleteAccount()
      if (res.blocked) {
        setReasons(res.reasons ?? [])
        return
      }
      if (res.success) setDone(true)
    } catch {
      setReasons([
        {
          code: "error",
          message:
            "We couldn’t delete your account. Please make sure you’re signed in and try again, or email support@catholicowned.com.",
        },
      ])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-[70vh] max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-primary mb-4">
        Delete your account
      </h1>

      {done ? (
        <div className="bg-[rgba(var(--neutral-50))] border border-[rgba(var(--neutral-100))] rounded-sm p-6">
          <p className="text-primary font-semibold mb-2">Your account is being deleted.</p>
          <p className="text-secondary text-[14px]">
            It has been deactivated and your personal data will be permanently
            removed after the 30-day grace period. We’re sorry to see you go.
          </p>
        </div>
      ) : (
        <>
          <p className="text-secondary mb-4">
            You can permanently delete your Catholic Owned account at any time.
            Here’s what happens when you do:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-secondary text-[14px] mb-6">
            <li>Your account is deactivated immediately and you’re signed out.</li>
            <li>Your personal data is permanently deleted after a 30-day grace period.</li>
            <li>Past orders are retained (anonymized) as required for legal and tax records.</li>
            <li>If you’re a merchant, your shop and listings are removed. Settle any pending payout balance first.</li>
          </ul>

          {reasons ? (
            <div className="bg-[rgba(var(--negative-50,255,240,240))] border border-[rgba(var(--negative-200,240,180,180))] rounded-sm p-4 mb-6">
              <p className="font-semibold text-negative mb-1">
                We can’t delete your account yet:
              </p>
              {reasons.map((r) => (
                <p key={r.code} className="text-[14px] text-negative">
                  • {r.message}
                </p>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            className="bg-negative text-white px-6 py-3 rounded-sm uppercase tracking-[0.1em] text-[13px] font-semibold disabled:opacity-60"
          >
            {submitting ? "Deleting…" : "Delete my account"}
          </button>
          <p className="text-[12px] text-secondary mt-3">
            You must be signed in to delete your account. Need help?
            Email support@catholicowned.com.
          </p>
        </>
      )}
    </main>
  )
}
