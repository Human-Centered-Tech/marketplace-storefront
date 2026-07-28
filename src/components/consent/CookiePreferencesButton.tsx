"use client"

import { useConsent } from "./ConsentProvider"

/**
 * Footer entry point for re-opening the consent banner.
 *
 * GDPR requires withdrawing consent to be as easy as giving it, so this is
 * shown to everyone once detection has run — including visitors who were never
 * prompted, since a US visitor may still want to opt out of analytics.
 */
export function CookiePreferencesButton({
  className,
}: {
  className?: string
}) {
  const { ready, openPreferences } = useConsent()

  if (!ready) {
    return null
  }

  return (
    <button type="button" onClick={openPreferences} className={className}>
      Cookie preferences
    </button>
  )
}
