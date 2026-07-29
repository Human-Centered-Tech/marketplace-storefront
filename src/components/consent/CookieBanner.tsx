"use client"

import { Button } from "@/components/atoms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

import { useConsent } from "./ConsentProvider"

/**
 * Cookie-consent banner. Only rendered for visitors who look EEA/UK (see
 * `@/lib/consent`) and haven't answered yet, or for anyone who re-opens it from
 * the footer's "Cookie preferences" link.
 *
 * Non-blocking by design: it's a bar, not a modal, and dismissing it isn't
 * possible without choosing — no "X" that silently counts as consent.
 */
export function CookieBanner() {
  const { bannerVisible, accept, reject } = useConsent()

  if (!bannerVisible) {
    return null
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-sm border border-[#17294A]/10 bg-white p-5 shadow-[0_-2px_24px_rgba(23,41,74,0.18)] sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <p className="flex-1 text-[14px] leading-relaxed text-[#44474e]">
          We use analytics cookies to understand how the site is used so we can
          improve it. They&rsquo;re optional — everything except analytics works
          either way. Read our{" "}
          <LocalizedClientLink
            href="/privacy"
            className="font-medium text-[#17294A] underline underline-offset-2 hover:text-[#BE9B32]"
          >
            Privacy Policy
          </LocalizedClientLink>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <Button
            variant="tonal"
            onClick={reject}
            className="flex-1 sm:flex-none"
          >
            Reject
          </Button>
          <Button
            variant="filled"
            onClick={accept}
            className="flex-1 sm:flex-none"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
