"use client"

import { NetworkingEvent } from "@/types/networking"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

// Pin the timezone so the formatted date/time is identical on the server and
// on the client. Without an explicit `timeZone`, the server (UTC) and the
// browser (local zone) format differently, producing a hydration mismatch
// (React #418) on every card. Events are scheduled in US Eastern.
const EVENT_TIME_ZONE = "America/New_York"

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr)
  return {
    monthDay: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: EVENT_TIME_ZONE,
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
      timeZone: EVENT_TIME_ZONE,
    }),
  }
}

export const NetworkingEventCard = ({
  event,
  now,
}: {
  event: NetworkingEvent
  now: number
}) => {
  const date = formatEventDate(event.event_date)
  // Server-derived count. The public payload DELETES the raw rsvps rows (they
  // carry attendee PII), so the old `event.rsvps?.filter(...)` was always 0 —
  // every card read "0/50 Joined" no matter how many people had signed up. The
  // detail page was fixed for this and the card was missed.
  const rsvpCount =
    event.confirmed_rsvp_count ??
    event.rsvps?.filter((r) => r.status === "confirmed").length ??
    0
  // Compare against the server-provided timestamp so "Past" renders the same
  // server-side and on hydration.
  const isPast = new Date(event.event_date).getTime() < now

  return (
    <LocalizedClientLink
      href={`/networking/${event.id}`}
      className="block bg-white rounded-xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gold/20 group"
    >
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-center">
        {/* Event image placeholder */}
        <div className="w-full md:w-64 h-48 rounded-lg overflow-hidden shrink-0 relative bg-gray-100">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-navy-dark/5">
              <span className="material-symbols-outlined text-5xl text-navy-dark/20">
                groups
              </span>
            </div>
          )}
          <div className="absolute top-4 left-4 bg-navy-dark px-3 py-1 rounded label-sm text-[10px] font-bold text-[#F2CD69] tracking-widest">
            {date.monthDay}
          </div>
          {isPast && (
            <div className="absolute top-4 right-4 bg-gray-600 px-3 py-1 rounded label-sm text-[10px] font-bold text-white tracking-widest">
              Past
            </div>
          )}
          {!isPast && event.has_rsvped && (
            <div className="absolute top-4 right-4 bg-green-700 px-3 py-1 rounded label-sm text-[10px] font-bold text-white tracking-widest">
              Going
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-grow space-y-3">
          <h3 className="font-serif text-xl lg:text-2xl font-bold text-navy-dark">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-secondary leading-relaxed line-clamp-2">
              {event.description}
            </p>
          )}
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2 label-sm text-[10px] text-secondary tracking-wider">
              <span className="material-symbols-outlined text-sm">groups</span>
              {rsvpCount}/{event.max_participants} Joined
            </div>
            <div className="flex items-center gap-2 label-sm text-[10px] text-secondary tracking-wider">
              <span className="material-symbols-outlined text-sm">
                schedule
              </span>
              {date.time}
            </div>
            <div className="flex items-center gap-2 label-sm text-[10px] text-secondary tracking-wider">
              <span className="material-symbols-outlined text-sm">timer</span>
              {event.duration_minutes} min
            </div>
          </div>
        </div>

        {/* RSVP button */}
        <div className="w-full md:w-auto shrink-0">
          <span
            className={`block w-full md:w-40 py-3 text-center label-sm text-[10px] font-bold tracking-widest rounded-xl transition-colors shadow-lg active:scale-95 ${
              isPast
                ? "bg-gray-200 text-secondary cursor-default"
                : event.has_rsvped
                  ? "bg-green-50 text-green-800 border border-green-200 cursor-default"
                  : "bg-navy-dark text-white hover:bg-navy"
            }`}
          >
            {isPast
              ? "Completed"
              : event.has_rsvped
                ? "You're Going"
                : "RSVP Now"}
          </span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
