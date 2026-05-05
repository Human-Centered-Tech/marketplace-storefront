"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet.markercluster"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

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
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)

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

    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      // Fan out clusters that won't separate by zoom (e.g. listings sharing
      // identical city-centroid coords).
      spiderfyDistanceMultiplier: 1.5,
      maxClusterRadius: 40,
    })
    map.addLayer(cluster)

    mapRef.current = map
    clusterRef.current = cluster

    return () => {
      map.remove()
      mapRef.current = null
      clusterRef.current = null
    }
  }, [])

  // Add/update markers
  useEffect(() => {
    const map = mapRef.current
    const cluster = clusterRef.current
    if (!map || !cluster) return

    cluster.clearLayers()
    markersRef.current.clear()

    if (markers.length === 0) return

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lon], {
        icon: createIcon(m.id === selectedId),
      })
        .bindTooltip(m.name, {
          direction: "top",
          offset: [0, -10],
          className: "leaflet-tooltip-custom",
        })
        .on("click", () => onSelectMarker(m.id))

      cluster.addLayer(marker)
      markersRef.current.set(m.id, marker)
    })

    const bounds = cluster.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.3))
    }
  }, [markers, onSelectMarker])

  // Update selected marker icon
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.setIcon(createIcon(id === selectedId))
    })

    // Pan to selected; spiderfy its cluster so the marker is visible.
    if (selectedId) {
      const m = markers.find((m) => m.id === selectedId)
      const marker = markersRef.current.get(selectedId)
      const cluster = clusterRef.current
      if (m && mapRef.current) {
        mapRef.current.panTo([m.lat, m.lon], { animate: true })
        if (marker && cluster) {
          cluster.zoomToShowLayer(marker, () => {
            // no-op; needed so the layer becomes visible inside its cluster
          })
        }
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
