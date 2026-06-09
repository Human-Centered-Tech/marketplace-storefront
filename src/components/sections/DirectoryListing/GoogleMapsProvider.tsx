"use client"

import { APIProvider } from "@vis.gl/react-google-maps"
import { ReactNode } from "react"

// Public browser key — referrer-restricted, limited to Maps JavaScript API +
// Geocoding API. Safe to expose; abuse is contained by those restrictions plus
// the Cloud billing budget.
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

// Map ID is required for Advanced Markers. Without it the map still renders but
// markers silently won't appear.
export const GOOGLE_MAPS_MAP_ID =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || ""

export const hasGoogleMaps = Boolean(GOOGLE_MAPS_API_KEY)

/**
 * Wraps a map subtree in the Google Maps JS API loader. `APIProvider` is
 * idempotent — multiple instances across the page share a single script load —
 * so each map surface can mount its own provider safely. When no key is
 * configured the `fallback` is rendered instead (so the rest of the page is
 * unaffected during local dev or before the env var is set).
 */
export function GoogleMapsProvider({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  if (!GOOGLE_MAPS_API_KEY) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "[maps] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set — map will not render."
      )
    }
    return <>{fallback}</>
  }
  return <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>{children}</APIProvider>
}
