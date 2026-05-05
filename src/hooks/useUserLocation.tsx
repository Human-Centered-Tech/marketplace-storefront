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
  ts: number
}

const STORAGE_KEY = "user_location"
const COOKIE_KEY = "user_location"
const RADIUS_STORAGE_KEY = "user_search_radius_mi"
const DEFAULT_RADIUS_MI = 50
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

function writeStorage(loc: UserLocation | null) {
  if (typeof window === "undefined") return
  if (!loc) {
    localStorage.removeItem(STORAGE_KEY)
    document.cookie = `${COOKIE_KEY}=; Max-Age=0; Path=/; SameSite=Lax`
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
  // Mirror to cookie so server components (DirectoryPreview) can read it.
  const value = encodeURIComponent(`${loc.lat},${loc.lng}`)
  document.cookie = `${COOKIE_KEY}=${value}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`
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
    }
    setHydrated(true)
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
        (pos) => {
          const next: UserLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            source: "gps",
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
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return null
    const trimmed = zip.trim()
    if (!/^\d{5}(-\d{4})?$/.test(trimmed)) return null
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        trimmed
      )}.json?access_token=${token}&limit=1&country=us&types=postcode`
      const res = await fetch(url)
      if (!res.ok) return null
      const data = (await res.json()) as {
        features?: Array<{ center?: [number, number] }>
      }
      const center = data.features?.[0]?.center
      if (!center) return null
      const [lng, lat] = center
      const next: UserLocation = { lat, lng, source: "zip", ts: Date.now() }
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
