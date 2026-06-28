"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import * as Sentry from "@sentry/nextjs"

/**
 * Reports a 404 to Sentry (warning level) with the path the user landed on, so
 * dead links / broken navigations surface during launch instead of being
 * silent. Renders nothing.
 */
export function NotFoundReporter() {
  const pathname = usePathname()
  useEffect(() => {
    Sentry.captureMessage(`404 Not Found: ${pathname}`, "warning")
  }, [pathname])
  return null
}
