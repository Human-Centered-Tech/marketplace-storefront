"use client"

import { useCallback, useEffect, useState } from "react"

export type LocationStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "unavailable"

export type UserLocation = {
  lat: number
  lng: number
  source: "gps" | "zip"
  // 2-letter US state code resolved from the coords. Optional — older
  // cached entries (pre-reverse-geocode) won't have it. Used to drive
  // the premium-state enterprise banner on /us/directory.
  state?: string
  ts: number
}

const STORAGE_KEY = "user_location"
const COOKIE_KEY = "user_location"
const RADIUS_STORAGE_KEY = "user_search_radius_mi"
const DEFAULT_RADIUS_MI = 100
// Server components read this cookie to ssr location-aware results.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function readRadiusMi(): number {
  if (typeof window === "undefined") return DEFAULT_RADIUS_MI
  const raw = localStorage.getItem(RADIUS_STORAGE_KEY)
  const n = raw ? parseInt(raw, 10) : NaN
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_RADIUS_MI
}

export function writeRadiusMi(mi: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(RADIUS_STORAGE_KEY, String(mi))
}

// Best-effort reverse geocode → 2-letter US state code. Nominatim
// returns ISO3166-2 like "US-CO" — we strip the prefix. Failures
// resolve to undefined so callers can store coords without a state.
async function reverseStateCode(
  lat: number,
  lng: number
): Promise<string | undefined> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=5`
    const res = await fetch(url)
    if (!res.ok) return undefined
    const data = (await res.json()) as {
      address?: { ["ISO3166-2-lvl4"]?: string; country_code?: string }
    }
    if (data.address?.country_code !== "us") return undefined
    const iso = data.address?.["ISO3166-2-lvl4"]
    if (!iso) return undefined
    const code = iso.split("-").pop()
    return code && code.length === 2 ? code.toUpperCase() : undefined
  } catch {
    return undefined
  }
}

function readStorage(): UserLocation | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserLocation
    if (
      !Number.isFinite(parsed.lat) ||
      !Number.isFinite(parsed.lng) ||
      !parsed.source
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

// Multiple components mount their own useUserLocation instance
// (LocationPrompt + DirectorySearch). When one writes a new location,
// the others need to find out — same-document writes don't fire the
// `storage` event, so we use a custom event for in-tab broadcast.
const LOCATION_EVENT = "user-location-changed"

function writeStorage(loc: UserLocation | null) {
  if (typeof window === "undefined") return
  if (!loc) {
    localStorage.removeItem(STORAGE_KEY)
    document.cookie = `${COOKIE_KEY}=; Max-Age=0; Path=/; SameSite=Lax`
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
    // Mirror to cookie so server components (DirectoryPreview) can read it.
    const value = encodeURIComponent(`${loc.lat},${loc.lng}`)
    document.cookie = `${COOKIE_KEY}=${value}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`
  }
  window.dispatchEvent(new CustomEvent(LOCATION_EVENT, { detail: loc }))
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [status, setStatus] = useState<LocationStatus>("idle")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const cached = readStorage()
    if (cached) {
      setLocation(cached)
      setStatus("granted")
      // Backfill state for older cached entries written before reverse-
      // geocode existed. Without this, premium-state banners never fire
      // for users with pre-existing localStorage locations.
      if (!cached.state) {
        reverseStateCode(cached.lat, cached.lng).then((state) => {
          if (!state) return
          writeStorage({ ...cached, state })
        })
      }
    }
    setHydrated(true)

    const onChange = (e: Event) => {
      const next = (e as CustomEvent<UserLocation | null>).detail
      setLocation(next)
      setStatus(next ? "granted" : "idle")
    }
    window.addEventListener(LOCATION_EVENT, onChange)
    return () => window.removeEventListener(LOCATION_EVENT, onChange)
  }, [])

  const request = useCallback((): Promise<UserLocation | null> => {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setStatus("unavailable")
        resolve(null)
        return
      }
      setStatus("prompting")
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          const state = await reverseStateCode(lat, lng)
          const next: UserLocation = {
            lat,
            lng,
            source: "gps",
            ...(state ? { state } : {}),
            ts: Date.now(),
          }
          writeStorage(next)
          setLocation(next)
          setStatus("granted")
          resolve(next)
        },
        (err) => {
          setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable")
          resolve(null)
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
      )
    })
  }, [])

  const setFromZip = useCallback(async (zip: string): Promise<UserLocation | null> => {
    const trimmed = zip.trim()
    if (!/^\d{5}(-\d{4})?$/.test(trimmed)) return null
    try {
      const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
        trimmed
      )}&countrycodes=us&format=json&addressdetails=1&limit=1`
      const res = await fetch(url)
      if (!res.ok) return null
      const data = (await res.json()) as Array<{
        lat?: string
        lon?: string
        address?: { ["ISO3166-2-lvl4"]?: string }
      }>
      const hit = data?.[0]
      if (!hit) return null
      const lat = parseFloat(hit.lat || "")
      const lng = parseFloat(hit.lon || "")
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
      const isoState = hit.address?.["ISO3166-2-lvl4"]?.split("-").pop()
      const state =
        isoState && isoState.length === 2 ? isoState.toUpperCase() : undefined
      const next: UserLocation = {
        lat,
        lng,
        source: "zip",
        ...(state ? { state } : {}),
        ts: Date.now(),
      }
      writeStorage(next)
      setLocation(next)
      setStatus("granted")
      return next
    } catch {
      return null
    }
  }, [])

  const clear = useCallback(() => {
    writeStorage(null)
    setLocation(null)
    setStatus("idle")
  }, [])

  return { location, status, hydrated, request, setFromZip, clear }
}
