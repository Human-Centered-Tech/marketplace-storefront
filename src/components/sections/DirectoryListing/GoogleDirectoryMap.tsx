"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AdvancedMarker,
  Map as GoogleMap,
  useMap,
} from "@vis.gl/react-google-maps"
import { MarkerClusterer } from "@googlemaps/markerclusterer"
import { GOOGLE_MAPS_MAP_ID } from "./GoogleMapsProvider"

export type MarkerData = {
  id: string
  lat: number
  lon: number
  name: string
  category: string
  city: string
  isFeatured?: boolean
  isVerified?: boolean
}

export type MapBbox = {
  north: number
  south: number
  east: number
  west: number
}

// Default view: continental US, matching the previous Leaflet default.
const DEFAULT_CENTER = { lat: 39.8, lng: -98.5 }
const DEFAULT_ZOOM = 4

// Traditional teardrop pin with a hover tooltip. The viewBox tip sits at the
// bottom-centre, which is where AdvancedMarker anchors content — so the point
// lands on the location. Colour reflects status:
//   • selected  → gold body (stands out regardless of status)
//   • featured  → dark-blue body, white accent
//   • verified  → white body, dark-blue accent
//   • otherwise → dark-blue body, gold accent (unclaimed default)
function MarkerPin({
  selected,
  featured,
  verified,
  name,
}: {
  selected: boolean
  featured?: boolean
  verified?: boolean
  name: string
}) {
  const w = selected ? 30 : 24
  const h = selected ? 45 : 36
  const NAVY = "#17294A"
  const WHITE = "#FFFFFF"
  const GOLD = "#BE9B32"
  let fill = NAVY
  let accent = GOLD
  if (selected) {
    fill = GOLD
    accent = NAVY
  } else if (featured) {
    fill = NAVY
    accent = WHITE
  } else if (verified) {
    fill = WHITE
    accent = NAVY
  }
  return (
    <div className="gm-marker">
      <svg
        width={w}
        height={h}
        viewBox="0 0 24 36"
        style={{
          display: "block",
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
          transition: "all 0.2s",
        }}
      >
        <path
          d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
          fill={fill}
          stroke={accent}
          strokeWidth="1.5"
        />
        <circle cx="12" cy="11.5" r="4.5" fill={accent} />
      </svg>
      <span className="gm-marker-tooltip">{name}</span>
    </div>
  )
}

// Inner component: has access to the map instance via useMap(). Owns marker
// clustering, viewport (idle) events, auto-fit, and select-pan.
function MapContents({
  markers,
  selectedId,
  onSelectMarker,
  onBoundsChanged,
  autoFit,
}: {
  markers: MarkerData[]
  selectedId: string | null
  onSelectMarker: (id: string | null) => void
  onBoundsChanged?: (bbox: MapBbox, zoom: number) => void
  autoFit: boolean
}) {
  const map = useMap()
  const clustererRef = useRef<MarkerClusterer | null>(null)
  const [markerEls, setMarkerEls] = useState<
    Record<string, google.maps.marker.AdvancedMarkerElement>
  >({})

  // Keep the latest callback without re-running the idle-listener effect.
  const onBoundsChangedRef = useRef(onBoundsChanged)
  useEffect(() => {
    onBoundsChangedRef.current = onBoundsChanged
  }, [onBoundsChanged])

  // "idle" fires after both user gestures AND programmatic moves (fitBounds,
  // panTo, initial view). We only want to surface the "Search this area" CTA on
  // user gestures, so flip this flag before each programmatic move to skip the
  // next idle.
  const suppressIdleRef = useRef(false)

  // Initialize the clusterer once the map exists.
  useEffect(() => {
    if (!map) return
    clustererRef.current = new MarkerClusterer({ map })
    return () => {
      clustererRef.current?.clearMarkers()
      clustererRef.current = null
    }
  }, [map])

  // Sync the clusterer's marker set whenever the rendered markers change.
  useEffect(() => {
    const clusterer = clustererRef.current
    if (!clusterer) return
    clusterer.clearMarkers()
    clusterer.addMarkers(Object.values(markerEls))
  }, [markerEls])

  // Surface viewport changes (user pan/zoom) for the "Search this area" CTA.
  useEffect(() => {
    if (!map) return
    const listener = map.addListener("idle", () => {
      if (suppressIdleRef.current) {
        suppressIdleRef.current = false
        return
      }
      const cb = onBoundsChangedRef.current
      if (!cb) return
      const b = map.getBounds()
      if (!b) return
      const ne = b.getNorthEast()
      const sw = b.getSouthWest()
      cb(
        { north: ne.lat(), south: sw.lat(), east: ne.lng(), west: sw.lng() },
        map.getZoom() ?? 0
      )
    })
    return () => listener.remove()
  }, [map])

  // Auto-fit to all markers (suppressed once a bbox search is active).
  useEffect(() => {
    if (!map || !autoFit || markers.length === 0) return
    const bounds = new google.maps.LatLngBounds()
    markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lon }))
    suppressIdleRef.current = true
    map.fitBounds(bounds, 60)
  }, [map, markers, autoFit])

  // Pan to the selected marker so it's visible (e.g. clicked from the list).
  useEffect(() => {
    if (!map || !selectedId) return
    const m = markers.find((x) => x.id === selectedId)
    if (!m) return
    suppressIdleRef.current = true
    map.panTo({ lat: m.lat, lng: m.lon })
  }, [map, selectedId, markers])

  // Collect/drop AdvancedMarker element refs for the clusterer. Guard against
  // redundant state updates to avoid render loops.
  const setMarkerRef = useCallback(
    (
      el: google.maps.marker.AdvancedMarkerElement | null,
      id: string
    ) => {
      setMarkerEls((prev) => {
        if ((el && prev[id]) || (!el && !prev[id])) return prev
        if (el) return { ...prev, [id]: el }
        const next = { ...prev }
        delete next[id]
        return next
      })
    },
    []
  )

  // Stable per-id ref callbacks. An inline `ref={el => setMarkerRef(el, id)}`
  // changes identity every render, so React (and @vis.gl's imperative handle)
  // re-invoke it each render — which re-runs setState and loops forever
  // (React error #185). One cached callback per id keeps the ref identity
  // stable, so it only fires on real mount/unmount.
  const refCbCache = useRef<
    Map<string, (el: google.maps.marker.AdvancedMarkerElement | null) => void>
  >(new Map())
  const markerRefCb = useCallback(
    (id: string) => {
      let cb = refCbCache.current.get(id)
      if (!cb) {
        cb = (el) => setMarkerRef(el, id)
        refCbCache.current.set(id, cb)
      }
      return cb
    },
    [setMarkerRef]
  )

  return (
    <>
      {markers.map((m) => (
        <AdvancedMarker
          key={m.id}
          position={{ lat: m.lat, lng: m.lon }}
          ref={markerRefCb(m.id)}
          onClick={() => onSelectMarker(m.id)}
          zIndex={m.id === selectedId ? 10 : 1}
        >
          <MarkerPin
            selected={m.id === selectedId}
            featured={m.isFeatured}
            verified={m.isVerified}
            name={m.name}
          />
        </AdvancedMarker>
      ))}
    </>
  )
}

export default function GoogleDirectoryMap({
  markers,
  selectedId,
  onSelectMarker,
  onBoundsChanged,
  autoFit = true,
}: {
  markers: MarkerData[]
  selectedId: string | null
  onSelectMarker: (id: string | null) => void
  onBoundsChanged?: (bbox: MapBbox, zoom: number) => void
  autoFit?: boolean
}) {
  return (
    <>
      <style>{`
        .gm-marker { position: relative; }
        .gm-marker-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #17294A;
          color: white;
          border-radius: 6px;
          padding: 4px 10px;
          font-family: var(--font-serif), serif;
          font-size: 13px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s;
        }
        .gm-marker-tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: #17294A;
        }
        .gm-marker:hover .gm-marker-tooltip { opacity: 1; }
      `}</style>
      <GoogleMap
        mapId={GOOGLE_MAPS_MAP_ID || undefined}
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        zoomControl={true}
        style={{ width: "100%", height: "100%" }}
      >
        <MapContents
          markers={markers}
          selectedId={selectedId}
          onSelectMarker={onSelectMarker}
          onBoundsChanged={onBoundsChanged}
          autoFit={autoFit}
        />
      </GoogleMap>
    </>
  )
}
