"use client"

import { useEffect } from "react"
import { trackPageView } from "@/lib/analytics"

/**
 * Client component that emits a page_view analytics event on mount.
 * Drop it inside any server-rendered page to get per-entity view counts
 * without rewriting the page as client-rendered.
 *
 *   <TrackPageView entity_type="directory_listing" entity_id={listing.id} />
 */
export function TrackPageView({
  entity_type,
  entity_id,
}: {
  entity_type: string
  entity_id: string
}) {
  useEffect(() => {
    trackPageView(entity_type, entity_id)
  }, [entity_type, entity_id])

  return null
}
