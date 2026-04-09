"use client"

import { useState } from "react"
import { NetworkingEvent } from "@/types/networking"
import { rsvpToEvent } from "@/lib/data/networking"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

function formatFullDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
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
  const fillPercent = Math.min(
    100,
    Math.round((rsvpCount / event.max_participants) * 100)
  )

  const handleRsvp = async () => {
    setRsvpLoading(true)
    setRsvpError("")
    const result = await rsvpToEvent(event.id)
    if (result.ok) {
      setRsvpSuccess(true)
    } else {
      setRsvpError(result.error || "Failed to RSVP")
    }
    setRsvpLoading(false)
  }

  return (
    <div className="pt-8 pb-20">
      {/* Hero Header */}
      <header className="relative overflow-hidden px-4 lg:px-24 py-16 lg:py-24 bg-[#FAF9F5]" style={{ backgroundImage: "none" }}>
        {/* Back link */}
        <div className="relative z-10 mb-8">
          <LocalizedClientLink
            href="/networking"
            className="label-sm text-[10px] text-gold-dark tracking-[0.3em] hover:text-navy-dark transition-colors"
          >
            &larr; Back to Events
          </LocalizedClientLink>
        </div>
        <div className="relative z-10 max-w-5xl">
          <span className="text-gold-dark label-sm text-[10px] tracking-[0.3em] mb-4 block font-bold">
            {isPast ? "Past Event" : "Upcoming Event"}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-navy-dark leading-tight mb-6">
            {event.title}
          </h1>
          {event.description && (
            <p className="font-serif italic text-xl text-secondary max-w-2xl leading-relaxed opacity-90">
              &ldquo;{event.description}&rdquo;
            </p>
          )}
        </div>
        {/* Decorative church silhouette — matches Stitch design */}
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 hidden lg:block opacity-[0.08] pointer-events-none">
          <span
            className="material-symbols-outlined text-[#BE9B32] select-none"
            style={{ fontSize: "32rem", fontVariationSettings: "'FILL' 1, 'wght' 200" }}
          >
            church
          </span>
        </div>
      </header>

      {/* Content Grid */}
      <div className="px-4 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        {/* Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-12">
          {/* Meta Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RSVP Status Card */}
            <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-gold flex items-start gap-6">
              <div className="bg-gold/10 p-3 rounded-full shrink-0">
                <span
                  className="material-symbols-outlined text-gold-dark"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {rsvpSuccess ? "check_circle" : isPast ? "history" : "event"}
                </span>
              </div>
              <div>
                <h3 className="font-serif text-lg text-navy-dark mb-1">
                  {rsvpSuccess
                    ? "You're confirmed!"
                    : isPast
                      ? "This event has concluded"
                      : `${spotsLeft} spots remaining`}
                </h3>
                <p className="text-sm text-secondary mb-4">
                  {rsvpSuccess
                    ? "Check your email for the calendar invite."
                    : isPast
                      ? "Thank you to all who attended."
                      : "Reserve your spot for this networking session."}
                </p>
                {!isPast && !rsvpSuccess && !isFull && (
                  <button
                    onClick={handleRsvp}
                    disabled={rsvpLoading}
                    className="text-gold-dark label-sm text-[10px] tracking-widest border-b border-gold/30 hover:border-gold transition-all disabled:opacity-50"
                  >
                    {rsvpLoading ? "Submitting..." : "RSVP Now"}
                  </button>
                )}
                {rsvpError && (
                  <p className="text-sm mt-2">
                    {rsvpError === "SIGN_IN_REQUIRED" ? (
                      <LocalizedClientLink
                        href="/user/login"
                        className="text-gold-dark underline hover:text-navy-dark transition-colors"
                      >
                        Sign in to RSVP for this event
                      </LocalizedClientLink>
                    ) : (
                      <span className="text-red-600">{rsvpError}</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Date & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="label-sm text-[10px] text-gold-dark tracking-widest block mb-2">
                  Date & Time
                </span>
                <p className="font-serif text-navy-dark">
                  {formatShortDate(event.event_date)}
                </p>
                <p className="text-sm text-secondary">
                  {formatTime(event.event_date)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="label-sm text-[10px] text-gold-dark tracking-widest block mb-2">
                  Duration
                </span>
                <p className="font-serif text-navy-dark">
                  {event.duration_minutes} Minutes
                </p>
                <p className="text-sm text-secondary">Virtual (Zoom)</p>
              </div>
            </div>
          </section>

          <hr className="border-gold/20" />

          {/* Event Methodology */}
          <section className="max-w-3xl">
            <h2 className="font-serif text-2xl text-navy-dark mb-8 tracking-wide">
              Event Format
            </h2>
            <div className="space-y-10">
              <div className="flex gap-6">
                <span className="text-gold font-serif text-4xl opacity-50 shrink-0">
                  01
                </span>
                <div>
                  <h4 className="font-serif text-lg text-navy-dark mb-2">
                    Opening Prayer
                  </h4>
                  <p className="text-secondary leading-relaxed">
                    We begin by centering our work in Christ. A brief reflection
                    on the dignity of labor and the Vocation of Business.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <span className="text-gold font-serif text-4xl opacity-50 shrink-0">
                  02
                </span>
                <div>
                  <h4 className="font-serif text-lg text-navy-dark mb-2">
                    Speed Networking Rounds
                  </h4>
                  <p className="text-secondary leading-relaxed">
                    Structured 1-on-1 breakout sessions. You&apos;ll be paired
                    with complementary businesses for focused conversation and
                    connection.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <span className="text-gold font-serif text-4xl opacity-50 shrink-0">
                  03
                </span>
                <div>
                  <h4 className="font-serif text-lg text-navy-dark mb-2">
                    Closing Reflection
                  </h4>
                  <p className="text-secondary leading-relaxed">
                    A final group gathering to share insights, prayer intentions,
                    and professional leads within the community.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Zoom Link (if available) */}
          {event.zoom_join_url && !isPast && (
            <>
              <hr className="border-gold/20" />
              <section className="bg-navy-dark p-10 rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="font-serif text-2xl text-[#F2CD69] mb-2">
                    Meeting Link
                  </h2>
                  <p className="text-white/70 text-sm mb-6">
                    Join via Zoom when the event begins.
                  </p>
                  <a
                    href={event.zoom_join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#F2CD69] text-navy-dark px-6 py-3 rounded-lg label-sm text-[10px] font-bold tracking-widest hover:brightness-105 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">
                      videocam
                    </span>
                    Join Zoom Meeting
                  </a>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-10">
          {/* Participants */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
            <h3 className="font-serif text-lg text-navy-dark mb-6">
              Participants
            </h3>
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="label-sm text-[10px] text-gold-dark tracking-widest">
                  Community Growth
                </span>
                <span className="text-sm font-serif text-navy-dark">
                  {rsvpCount}/{event.max_participants} Joined
                </span>
              </div>
              <div className="w-full h-1 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>

            {/* RSVP Button (sidebar) */}
            {!isPast && !rsvpSuccess && (
              <button
                onClick={handleRsvp}
                disabled={rsvpLoading || isFull}
                className={`w-full py-3 rounded-xl label-sm text-[10px] font-bold tracking-widest transition-all shadow-lg active:scale-95 ${
                  isFull
                    ? "bg-gray-300 text-secondary cursor-default"
                    : "bg-navy-dark text-white hover:bg-navy"
                }`}
              >
                {rsvpLoading
                  ? "Submitting..."
                  : isFull
                    ? "Event Full"
                    : "RSVP Now"}
              </button>
            )}
            {rsvpSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm text-green-800 font-medium">
                  You&apos;re confirmed!
                </p>
              </div>
            )}
            {rsvpError && (
              <p className="text-sm text-red-600 mt-3">{rsvpError}</p>
            )}
          </div>

          {/* Event Details Card */}
          <div className="p-8 border-l border-gold/30">
            <h3 className="font-serif text-lg text-navy-dark mb-6">
              Event Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gold-dark text-lg mt-0.5">
                  calendar_today
                </span>
                <div>
                  <p className="text-sm font-medium text-navy-dark">
                    {formatFullDate(event.event_date)}
                  </p>
                  <p className="text-xs text-secondary">
                    {formatTime(event.event_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gold-dark text-lg mt-0.5">
                  timer
                </span>
                <div>
                  <p className="text-sm font-medium text-navy-dark">
                    {event.duration_minutes} minutes
                  </p>
                  <p className="text-xs text-secondary">
                    Speed networking format
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gold-dark text-lg mt-0.5">
                  videocam
                </span>
                <div>
                  <p className="text-sm font-medium text-navy-dark">
                    Virtual (Zoom)
                  </p>
                  <p className="text-xs text-secondary">
                    Link provided after RSVP
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gold-dark text-lg mt-0.5">
                  groups
                </span>
                <div>
                  <p className="text-sm font-medium text-navy-dark">
                    {event.max_participants} max participants
                  </p>
                  <p className="text-xs text-secondary">
                    {spotsLeft > 0
                      ? `${spotsLeft} spots remaining`
                      : "Event is full"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
