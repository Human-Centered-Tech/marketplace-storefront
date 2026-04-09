"use client"

import { NetworkingEvent } from "@/types/networking"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr)
  return {
    monthDay: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }),
  }
}

export const NetworkingEventCard = ({
  event,
}: {
  event: NetworkingEvent
}) => {
  const date = formatEventDate(event.event_date)
  const rsvpCount =
    event.rsvps?.filter((r) => r.status === "confirmed").length ?? 0
  const isPast = new Date(event.event_date) < new Date()

  return (
    <LocalizedClientLink
      href={`/networking/${event.id}`}
      className="block bg-white rounded-xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gold/20 group"
    >
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-center">
        {/* Event image placeholder */}
        <div className="w-full md:w-64 h-48 rounded-lg overflow-hidden shrink-0 relative bg-gray-100">
          <div className="w-full h-full flex items-center justify-center bg-navy-dark/5">
            <span className="material-symbols-outlined text-5xl text-navy-dark/20">
              groups
            </span>
          </div>
          <div className="absolute top-4 left-4 bg-navy-dark px-3 py-1 rounded label-sm text-[10px] font-bold text-[#F2CD69] tracking-widest">
            {date.monthDay}
          </div>
          {isPast && (
            <div className="absolute top-4 right-4 bg-gray-600 px-3 py-1 rounded label-sm text-[10px] font-bold text-white tracking-widest">
              Past
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
                : "bg-navy-dark text-white hover:bg-navy"
            }`}
          >
            {isPast ? "Completed" : "RSVP Now"}
          </span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
