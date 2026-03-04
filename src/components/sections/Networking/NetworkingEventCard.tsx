"use client"

import { NetworkingEvent } from "@/types/networking"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const statusStyles: Record<string, string> = {
  published: "bg-green-100 text-green-800 border-green-300",
  in_progress: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-gray-100 text-gray-800 border-gray-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
}

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr)
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    month: date.toLocaleDateString("en-US", { month: "short" }),
    day: date.getDate(),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  }
}

export const NetworkingEventCard = ({
  event,
}: {
  event: NetworkingEvent
}) => {
  const date = formatEventDate(event.event_date)
  const rsvpCount = event.rsvps?.filter((r) => r.status === "confirmed").length ?? 0
  const spotsLeft = event.max_participants - rsvpCount
  const isPast = new Date(event.event_date) < new Date()

  return (
    <LocalizedClientLink
      href={`/networking/${event.id}`}
      className="block border rounded-sm hover:shadow-md transition-shadow"
    >
      <div className="flex">
        {/* Date column */}
        <div className="flex-shrink-0 w-20 bg-gray-50 flex flex-col items-center justify-center p-4 border-r">
          <span className="text-xs text-secondary uppercase">{date.month}</span>
          <span className="text-2xl font-semibold text-primary">{date.day}</span>
          <span className="text-xs text-secondary">{date.weekday}</span>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="heading-xs text-primary line-clamp-1">
              {event.title}
            </h3>
            {isPast && (
              <span
                className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${
                  statusStyles[event.status] || statusStyles.completed
                }`}
              >
                {event.status === "completed" ? "Completed" : "Past"}
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-secondary line-clamp-2 mb-3">
              {event.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-secondary">
            <span>{date.time}</span>
            <span>{event.duration_minutes} min</span>
            <span>
              {rsvpCount}/{event.max_participants} participants
              {!isPast && spotsLeft > 0 && (
                <span className="text-green-600 ml-1">
                  ({spotsLeft} spots left)
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
