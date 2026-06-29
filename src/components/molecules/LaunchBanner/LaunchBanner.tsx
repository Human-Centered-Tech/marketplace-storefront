"use client"

import { useEffect, useState } from "react"

// Bump the version suffix to re-show the banner to everyone after a change.
const DISMISS_KEY = "co-launch-banner-dismissed-v1"

/**
 * Site-wide launch announcement. Shown by default (server-rendered so there's
 * no layout shift for the common case), then hidden on mount if the visitor
 * has already dismissed it. Dismissal persists in localStorage.
 */
export function LaunchBanner() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") setDismissed(true)
    } catch {
      /* private mode / blocked storage — just keep showing it */
    }
  }, [])

  if (dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      role="region"
      aria-label="Site announcement"
      className="relative bg-gradient-to-r from-[#F2CD69] to-[#BE9B32] text-[#17294A]"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-2.5 pr-10 text-center text-[13px] leading-relaxed">
        <span className="font-semibold">
          Welcome to the new Catholic Owned
          <span className="text-[0.7em] align-top ml-[1px]">&reg;</span>.
        </span>{" "}
        <span className="text-[#17294A]/90">
          We&rsquo;re still making improvements as we make it easier to find,
          shop from, and support Catholic-owned businesses. If something looks
          off, please let us know at{" "}
          <a
            href="mailto:support@catholicowned.com"
            className="font-semibold underline underline-offset-2 hover:text-[#001435] transition-colors"
          >
            support@catholicowned.com
          </a>
          .
        </span>
      </div>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#17294A]/70 hover:text-[#17294A] transition-colors"
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
