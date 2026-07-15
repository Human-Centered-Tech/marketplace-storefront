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
  // RSVP made in THIS session. Separate from `event.has_rsvped` (the server's
  // answer) because only a fresh RSVP should bump the attendee count — a
  // pre-existing one is already inside the server-derived number.
  const [justRsvped, setJustRsvped] = useState(false)
  const [rsvpError, setRsvpError] = useState("")
  const [showPhoneStep, setShowPhoneStep] = useState(false)
  const [phone, setPhone] = useState("")
  const [smsOptIn, setSmsOptIn] = useState(false)

  // The RSVP used to live in React state ALONE: reload the page and the button
  // said "RSVP Now" again, and clicking it returned the backend's "Already
  // RSVP'd to this event" 400 as a red error. The event payload now carries the
  // viewer's own RSVP state.
  const isGoing = (event.has_rsvped ?? false) || justRsvped

  // Only ask for a phone number when the backend says it doesn't have one.
  const needsPhone = event.has_phone_on_file === false

  // Prefer the server-derived confirmed count (the public payload no longer
  // ships raw rsvps). +1 optimistically once the viewer's own RSVP lands so
  // the "N joined" number reflects it without a refetch.
  const baseRsvpCount =
    event.confirmed_rsvp_count ??
    event.rsvps?.filter((r) => r.status === "confirmed").length ??
    0
  const rsvpCount = baseRsvpCount + (justRsvped ? 1 : 0)
  const spotsLeft = event.max_participants - rsvpCount
  const isPast = new Date(event.event_date) < new Date()
  const isFull = spotsLeft <= 0
  const fillPercent = Math.min(
    100,
    Math.round((rsvpCount / event.max_participants) * 100)
  )

  // Where the event happens. This page used to hardcode "Virtual (Zoom)" in
  // three places, so a genuinely in-person event was mislabeled — the mirror
  // image of the app's bug, which inferred "In Person" whenever a Zoom link
  // hadn't been pasted in yet. Both now read one field. Missing (older backend)
  // = virtual, which is what every event has been to date.
  const locationType = event.location_type ?? "virtual"
  const isVirtual = locationType === "virtual" || locationType === "hybrid"
  const locationLabel =
    locationType === "virtual"
      ? "Virtual (Zoom)"
      : locationType === "hybrid"
        ? event.location
          ? `${event.location} · or Zoom`
          : "In person or Zoom"
        : event.location || "In person"
  const locationIcon = isVirtual ? "videocam" : "location_on"

  // Admin-editable agenda saved to event.metadata.format. When present, it
  // replaces the default 3-step agenda below. Preserve the author's line
  // breaks with whitespace-pre-line.
  const customFormat =
    typeof event.metadata?.format === "string"
      ? event.metadata.format.trim()
      : ""

  const submitRsvp = async (reminder?: {
    phone?: string
    sms_opt_in?: boolean
  }) => {
    setRsvpLoading(true)
    setRsvpError("")
    const result = await rsvpToEvent(event.id, reminder)
    if (result.ok) {
      setJustRsvped(true)
      setShowPhoneStep(false)
      setPhone("")
    } else if (/already rsvp/i.test(result.error || "")) {
      // Already going (e.g. RSVP'd on the app). Reflect it instead of showing
      // a red error for something that isn't one.
      setJustRsvped(true)
      setShowPhoneStep(false)
    } else {
      setRsvpError(result.error || "Failed to RSVP")
    }
    setRsvpLoading(false)
  }

  // First click opens the reminder step when we have no number on file;
  // otherwise it RSVPs straight away.
  const handleRsvp = () => {
    if (needsPhone && !showPhoneStep) {
      setRsvpError("")
      setShowPhoneStep(true)
      return
    }
    void submitRsvp()
  }

  const handleRsvpWithPhone = () => {
    if (smsOptIn && !phone.trim()) {
      setRsvpError("Enter a mobile number, or untick the reminder box.")
      return
    }
    void submitRsvp({
      phone: phone.trim() || undefined,
      sms_opt_in: smsOptIn && Boolean(phone.trim()),
    })
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

      {/* Event graphic (admin-uploaded; omitted when none) */}
      {event.image_url && (
        <div className="px-4 lg:px-24 mt-8">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full max-h-[440px] object-cover rounded-2xl shadow-sm"
          />
        </div>
      )}

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
                  {isGoing ? "check_circle" : isPast ? "history" : "event"}
                </span>
              </div>
              <div>
                <h3 className="font-serif text-lg text-navy-dark mb-1">
                  {isGoing
                    ? "You're going"
                    : isPast
                      ? "This event has concluded"
                      : `${spotsLeft} spots remaining`}
                </h3>
                <p className="text-sm text-secondary mb-4">
                  {isGoing
                    ? "We've emailed you a calendar invite with the details."
                    : isPast
                      ? "Thank you to all who attended."
                      : "Reserve your spot for this event."}
                </p>
                {!isPast && !isGoing && !isFull && !showPhoneStep && (
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
                        href="/user"
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
                <p className="text-sm text-secondary">{locationLabel}</p>
              </div>
            </div>
          </section>

          <hr className="border-gold/20" />

          {/* Event Methodology */}
          <section className="max-w-3xl">
            <h2 className="font-serif text-2xl text-navy-dark mb-8 tracking-wide">
              Event Format
            </h2>
            {customFormat ? (
              <p className="text-secondary leading-relaxed whitespace-pre-line">
                {customFormat}
              </p>
            ) : (
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
                      We begin by centering our work in Christ. A brief
                      reflection on the dignity of labor and the Vocation of
                      Business.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <span className="text-gold font-serif text-4xl opacity-50 shrink-0">
                    02
                  </span>
                  <div>
                    <h4 className="font-serif text-lg text-navy-dark mb-2">
                      Connection Rounds
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
                      A final group gathering to share insights, prayer
                      intentions, and professional leads within the community.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Meeting link — registered attendees only. Someone who hasn't
              RSVP'd gets told how to get it rather than a dead panel. */}
          {isVirtual && !isPast && isGoing && (
            <>
              <hr className="border-gold/20" />
              <section className="bg-navy-dark p-10 rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="font-serif text-2xl text-[#F2CD69] mb-2">
                    Meeting Link
                  </h2>
                  {event.zoom_join_url ? (
                    <>
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
                    </>
                  ) : (
                    // The Zoom link is pasted in by hand in the admin, often
                    // after people have RSVP'd — say so instead of pretending
                    // there's nothing here.
                    <p className="text-white/70 text-sm">
                      You&apos;re registered. We&apos;ll email you the Zoom link
                      before the event begins.
                    </p>
                  )}
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
            {!isPast && !isGoing && !showPhoneStep && (
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

            {/* Reminder step. Only shown when we have NO number on file — a
                returning member is never asked twice. Skipping still RSVPs. */}
            {!isPast && !isGoing && showPhoneStep && (
              <div className="space-y-3">
                <label
                  htmlFor="rsvp-phone"
                  className="label-sm text-[10px] text-gold-dark tracking-widest block"
                >
                  Remind me about this event
                </label>
                <input
                  id="rsvp-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 rounded-lg border border-gold/30 bg-white text-navy-dark focus:outline-none focus:border-gold"
                />
                <label className="flex items-start gap-2 text-xs text-secondary leading-relaxed">
                  <input
                    type="checkbox"
                    checked={smsOptIn}
                    onChange={(e) => setSmsOptIn(e.target.checked)}
                    className="mt-0.5 shrink-0"
                  />
                  <span>
                    Text me reminders about this event. Msg &amp; data rates may
                    apply. Reply STOP to opt out.
                  </span>
                </label>
                <button
                  onClick={handleRsvpWithPhone}
                  disabled={rsvpLoading}
                  className="w-full py-3 rounded-xl label-sm text-[10px] font-bold tracking-widest bg-navy-dark text-white hover:bg-navy transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {rsvpLoading ? "Submitting..." : "Confirm RSVP"}
                </button>
                <button
                  onClick={() => void submitRsvp()}
                  disabled={rsvpLoading}
                  className="w-full text-secondary label-sm text-[10px] tracking-widest hover:text-navy-dark transition-colors disabled:opacity-50"
                >
                  No thanks &mdash; just RSVP
                </button>
              </div>
            )}

            {isGoing && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm text-green-800 font-medium">
                  You&apos;re going
                </p>
                <p className="text-xs text-green-700 mt-1">
                  A calendar invite is on its way to your inbox.
                </p>
              </div>
            )}
            {rsvpError && (
              <p className="text-sm mt-3">
                {rsvpError === "SIGN_IN_REQUIRED" ? (
                  <LocalizedClientLink
                    href="/user"
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
                    {isVirtual ? "Live virtual session" : "In-person session"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gold-dark text-lg mt-0.5">
                  {locationIcon}
                </span>
                <div>
                  <p className="text-sm font-medium text-navy-dark">
                    {locationLabel}
                  </p>
                  <p className="text-xs text-secondary">
                    {!isVirtual
                      ? "Join us in person"
                      : isGoing
                        ? event.zoom_join_url
                          ? "Link is on this page and in your invite"
                          : "Link emailed before the event"
                        : "Link provided after RSVP"}
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
