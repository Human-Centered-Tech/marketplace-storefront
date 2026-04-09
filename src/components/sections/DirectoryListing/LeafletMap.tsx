"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type MarkerData = {
  id: string
  lat: number
  lon: number
  name: string
  category: string
  city: string
}

// Custom navy/gold marker icon
const createIcon = (selected: boolean) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width: ${selected ? "20px" : "14px"};
      height: ${selected ? "20px" : "14px"};
      background: ${selected ? "#BE9B32" : "#17294A"};
      border: 3px solid ${selected ? "#17294A" : "#BE9B32"};
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.2s;
    "></div>`,
    iconSize: [selected ? 20 : 14, selected ? 20 : 14],
    iconAnchor: [selected ? 10 : 7, selected ? 10 : 7],
  })

export default function LeafletMap({
  markers,
  selectedId,
  onSelectMarker,
}: {
  markers: MarkerData[]
  selectedId: string | null
  onSelectMarker: (id: string | null) => void
}) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "",
      maxZoom: 19,
    }).addTo(map)

    map.attributionControl.remove()

    // Default view: US
    map.setView([39.8, -98.5], 4)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Add/update markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    if (markers.length === 0) return

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lon], {
        icon: createIcon(m.id === selectedId),
      })
        .addTo(map)
        .bindTooltip(m.name, {
          direction: "top",
          offset: [0, -10],
          className: "leaflet-tooltip-custom",
        })
        .on("click", () => onSelectMarker(m.id))

      markersRef.current.set(m.id, marker)
    })

    // Fit bounds
    const group = L.featureGroup(Array.from(markersRef.current.values()))
    map.fitBounds(group.getBounds().pad(0.3))
  }, [markers, onSelectMarker])

  // Update selected marker icon
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.setIcon(createIcon(id === selectedId))
    })

    // Pan to selected
    if (selectedId) {
      const m = markers.find((m) => m.id === selectedId)
      if (m && mapRef.current) {
        mapRef.current.panTo([m.lat, m.lon], { animate: true })
      }
    }
  }, [selectedId, markers])

  return (
    <>
      <style>{`
        .leaflet-tooltip-custom {
          background: #17294A;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 4px 10px;
          font-family: var(--font-serif), serif;
          font-size: 13px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .leaflet-tooltip-custom::before {
          border-top-color: #17294A;
        }
      `}</style>
      <div ref={containerRef} className="w-full h-full" />
    </>
  )
}
