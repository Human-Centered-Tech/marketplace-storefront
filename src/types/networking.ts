export type NetworkingEvent = {
  id: string
  title: string
  description: string | null
  event_date: string
  duration_minutes: number
  zoom_meeting_id: string | null
  zoom_join_url: string | null
  max_participants: number
  status: "draft" | "published" | "in_progress" | "completed" | "cancelled"
  created_by: string | null
  metadata: Record<string, unknown> | null
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
