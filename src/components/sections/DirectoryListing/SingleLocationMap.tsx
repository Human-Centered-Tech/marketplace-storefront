"use client"

import { ReactNode, useEffect, useState } from "react"
import { AdvancedMarker, Map as GoogleMap } from "@vis.gl/react-google-maps"
import {
  GoogleMapsProvider,
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
} from "./GoogleMapsProvider"

type LatLng = { lat: number; lng: number }

/**
 * Single-pin Google map for detail pages. Prefers `coords` when supplied
 * (e.g. lat/lng already stored on a listing's address); otherwise geocodes the
 * `query` string client-side via the Geocoding API. Renders `fallback` when no
 * key is configured or no location can be resolved.
 */
export function SingleLocationMap({
  coords: coordsProp = null,
  query = null,
  zoom = 14,
  className = "",
  fallback = null,
}: {
  coords?: LatLng | null
  query?: string | null
  zoom?: number
  className?: string
  fallback?: ReactNode
}) {
  const hasProp =
    !!coordsProp &&
    Number.isFinite(coordsProp.lat) &&
    Number.isFinite(coordsProp.lng)

  const [geocoded, setGeocoded] = useState<LatLng | null>(null)

  useEffect(() => {
    if (hasProp || !query || !GOOGLE_MAPS_API_KEY) {
      setGeocoded(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            query
          )}&components=country:US&key=${GOOGLE_MAPS_API_KEY}`
        )
        if (!res.ok) return
        const data = (await res.json()) as {
          status?: string
          results?: Array<{
            geometry?: { location?: { lat?: number; lng?: number } }
          }>
        }
        if (cancelled || data.status !== "OK") return
        const loc = data.results?.[0]?.geometry?.location
        const lat = Number(loc?.lat)
        const lng = Number(loc?.lng)
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setGeocoded({ lat, lng })
        }
      } catch {
        // graceful no-op — fallback renders
      }
    })()
    return () => {
      cancelled = true
    }
  }, [hasProp, query])

  const coords = hasProp ? (coordsProp as LatLng) : geocoded

  if (!coords) return <>{fallback}</>

  return (
    <GoogleMapsProvider fallback={fallback}>
      <div className={className}>
        <GoogleMap
          mapId={GOOGLE_MAPS_MAP_ID || undefined}
          defaultCenter={coords}
          defaultZoom={zoom}
          gestureHandling="cooperative"
          disableDefaultUI={true}
          zoomControl={true}
          style={{ width: "100%", height: "100%" }}
        >
          <AdvancedMarker position={coords}>
            <div className="w-10 h-10 bg-navy-dark rounded-full flex items-center justify-center border-4 border-[#FAF9F5] shadow-xl">
              <span
                className="material-symbols-outlined text-[#F2CD69]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
            </div>
          </AdvancedMarker>
        </GoogleMap>
      </div>
    </GoogleMapsProvider>
  )
}
