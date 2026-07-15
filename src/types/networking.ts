export type NetworkingEvent = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  event_date: string
  duration_minutes: number
  zoom_meeting_id: string | null
  zoom_join_url: string | null
  max_participants: number
  status: "draft" | "published" | "in_progress" | "completed" | "cancelled"
  created_by: string | null
  metadata: Record<string, unknown> | null
  event_type?: "general" | "featured"
  // Where the event actually happens. Optional so an older backend (or a cached
  // payload) doesn't break the page — absent means treat it as virtual, which
  // is what every event has been to date.
  location_type?: "virtual" | "in_person" | "hybrid"
  location?: string | null
  // Public confirmed-RSVP count derived server-side (the raw rsvps rows are
  // not returned to the storefront — they carry attendee PII).
  confirmed_rsvp_count?: number
  // Whether the CURRENT viewer has already RSVP'd. Server-derived; only
  // meaningful for an authenticated request.
  has_rsvped?: boolean
  // Whether we already have a phone number for the viewer — drives whether the
  // RSVP form asks for one. The number itself is never sent to the browser.
  has_phone_on_file?: boolean
  rsvps?: NetworkingRSVP[]
  created_at: string
  updated_at: string
}

export type NetworkingRSVP = {
  id: string
  event_id: string
  customer_id: string
  status: "confirmed" | "cancelled" | "attended" | "no_show"
  survey_responses: Record<string, unknown> | null
}

export type NetworkingSubscription = {
  id: string
  customer_id: string
  plan: "monthly" | "annual"
  status: "active" | "expired" | "cancelled" | "gifted"
  starts_at: string
  ends_at: string
}

export type NetworkingContactExchange = {
  id: string
  event_id: string
  requester_id: string
  recipient_id: string
  requester_consent: boolean
  recipient_consent: boolean
  status: "pending" | "mutual" | "declined" | "expired"
}
