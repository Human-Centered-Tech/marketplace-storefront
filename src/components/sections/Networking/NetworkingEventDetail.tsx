"use client"

import { useState } from "react"
import { NetworkingEvent } from "@/types/networking"

function formatFullDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatEndTime(dateStr: string, durationMinutes: number) {
  const date = new Date(dateStr)
  date.setMinutes(date.getMinutes() + durationMinutes)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export const NetworkingEventDetail = ({
  event,
}: {
  event: NetworkingEvent
}) => {
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [rsvpSuccess, setRsvpSuccess] = useState(false)
  const [rsvpError, setRsvpError] = useState("")

  const rsvpCount =
    event.rsvps?.filter((r) => r.status === "confirmed").length ?? 0
  const spotsLeft = event.max_participants - rsvpCount
  const isPast = new Date(event.event_date) < new Date()
  const isFull = spotsLeft <= 0

  const handleRsvp = async () => {
    setRsvpLoading(true)
    setRsvpError("")
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const res = await fetch(
        `${backendUrl}/store/networking/events/${event.id}/rsvp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
          credentials: "include",
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Failed to RSVP")
      }
      setRsvpSuccess(true)
    } catch (err: unknown) {
      setRsvpError(
        err instanceof Error ? err.message : "Failed to RSVP. Please try again."
      )
    } finally {
      setRsvpLoading(false)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <h1 className="heading-lg text-primary mb-2">{event.title}</h1>

          <div className="flex items-center gap-3 mb-6 text-sm text-secondary">
            <span>{formatFullDate(event.event_date)}</span>
            <span className="text-gray-300">|</span>
            <span>
              {formatTime(event.event_date)} -{" "}
              {formatEndTime(event.event_date, event.duration_minutes)}
            </span>
            <span className="text-gray-300">|</span>
            <span>{event.duration_minutes} minutes</span>
          </div>

          {event.description && (
            <div className="mb-6">
              <h2 className="heading-sm text-primary mb-2">About This Event</h2>
              <p className="text-secondary whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {event.zoom_join_url && !isPast && (
            <div className="mb-6">
              <h2 className="heading-sm text-primary mb-2">Meeting Link</h2>
              <p className="text-sm text-secondary">
                The Zoom link will be available after you RSVP.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* RSVP Card */}
          <div className="border rounded-sm p-4">
            <h2 className="heading-sm text-primary mb-3">RSVP</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Participants</span>
                <span className="text-primary">
                  {rsvpCount} / {event.max_participants}
                </span>
              </div>

              {!isPast && spotsLeft > 0 && (
                <p className="text-sm text-green-600">
                  {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} remaining
                </p>
              )}

              {isPast ? (
                <p className="text-sm text-secondary">
                  This event has already taken place.
                </p>
              ) : rsvpSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-sm p-3">
                  <p className="text-sm text-green-800">
                    You have successfully RSVP&apos;d to this event.
                  </p>
                </div>
              ) : isFull ? (
                <p className="text-sm text-red-600">
                  This event is full.
                </p>
              ) : (
                <button
                  onClick={handleRsvp}
                  disabled={rsvpLoading}
                  className="w-full bg-primary text-white py-2 px-4 rounded-sm text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {rsvpLoading ? "Submitting..." : "RSVP Now"}
                </button>
              )}

              {rsvpError && (
                <p className="text-sm text-red-600">{rsvpError}</p>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="border rounded-sm p-4">
            <h2 className="heading-sm text-primary mb-3">Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Date</span>
                <span className="text-primary">
                  {formatFullDate(event.event_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Time</span>
                <span className="text-primary">
                  {formatTime(event.event_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Duration</span>
                <span className="text-primary">
                  {event.duration_minutes} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Format</span>
                <span className="text-primary">Virtual (Zoom)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
