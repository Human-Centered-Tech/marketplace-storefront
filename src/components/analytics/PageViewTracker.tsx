"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Sends a GA4 `page_view` on every App Router client-side navigation.
 *
 * The initial gtag config uses send_page_view:false, so this effect (which also
 * runs on first mount) is the single source of page_view events — covering both
 * the first load and subsequent SPA route changes that gtag.js can't see.
 */
export function PageViewTracker({ gaId }: { gaId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window.gtag !== "function") {
      return
    }

    const query = searchParams?.toString()
    const url = query ? `${pathname}?${query}` : pathname

    window.gtag("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
      send_to: gaId,
    })
  }, [pathname, searchParams, gaId])

  return null
}
