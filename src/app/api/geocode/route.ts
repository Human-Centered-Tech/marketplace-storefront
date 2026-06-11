import { NextResponse } from "next/server"

// Server-side geocoding proxy. The browser-facing maps key
// (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) is HTTP-referrer-restricted, and Google's
// Geocoding REST web service REJECTS referrer-restricted keys ("API keys with
// referer restrictions cannot be used with this API"). So zip/address geocoding
// has to run server-side with a non-referrer key. GOOGLE_GEOCODING_API_KEY is a
// server-only env (no NEXT_PUBLIC_ prefix → never shipped to the browser).

const KEY = process.env.GOOGLE_GEOCODING_API_KEY || ""

type LatLng = { lat: number; lng: number; state?: string }

function extractState(
  components: Array<{ short_name?: string; types?: string[] }>
) {
  const country = components.find((x) => x.types?.includes("country"))?.short_name
  if (country && country !== "US") return undefined
  const c = components.find((x) => x.types?.includes("administrative_area_level_1"))
  return c?.short_name
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const zip = (searchParams.get("zip") || "").trim()
  const address = (searchParams.get("address") || "").trim()
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  // Validate to limit abuse of the shared key/quota.
  let query: string
  if (zip) {
    if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      return NextResponse.json({ error: "invalid zip" }, { status: 400 })
    }
    query = `components=postal_code:${encodeURIComponent(zip)}|country:US`
  } else if (address) {
    if (address.length > 200) {
      return NextResponse.json({ error: "address too long" }, { status: 400 })
    }
    query = `address=${encodeURIComponent(address)}&components=country:US`
  } else if (lat && lng) {
    // Reverse geocode (GPS coords -> state).
    const la = Number(lat)
    const lo = Number(lng)
    if (!Number.isFinite(la) || !Number.isFinite(lo)) {
      return NextResponse.json({ error: "invalid coords" }, { status: 400 })
    }
    query = `latlng=${la},${lo}`
  } else {
    return NextResponse.json({ error: "zip, address, or lat/lng required" }, { status: 400 })
  }

  if (!KEY) {
    return NextResponse.json({ error: "geocoding unavailable" }, { status: 503 })
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${query}&key=${KEY}`,
      { cache: "no-store" }
    )
    const data = (await res.json()) as {
      status?: string
      results?: Array<{
        geometry?: { location?: { lat?: number; lng?: number } }
        address_components?: Array<{ short_name?: string; types?: string[] }>
      }>
    }
    const hit = data.results?.[0]
    const lat = Number(hit?.geometry?.location?.lat)
    const lng = Number(hit?.geometry?.location?.lng)
    if (data.status !== "OK" || !hit || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }
    const result: LatLng = { lat, lng }
    const state = extractState(hit.address_components ?? [])
    if (state) result.state = state
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "geocoding failed" }, { status: 502 })
  }
}
