"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { NetworkingEvent } from "@/types/networking"
import { listNetworkingEvents } from "@/lib/data/networking"
import { NetworkingEventCard } from "./NetworkingEventCard"

type ViewMode = "list" | "calendar"
type TimeFilter = "upcoming" | "past"

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weeks: (number | null)[][] = []
  let week: (number | null)[] = Array(firstDay).fill(null)

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

export const NetworkingEventsView = ({
  events,
  now: nowMs,
}: {
  events: NetworkingEvent[]
  now: number
}) => {
  const [view, setView] = useState<ViewMode>("list")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming")
  const [eventList, setEventList] = useState(events)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [searching, setSearching] = useState(false)
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date(nowMs)
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  // Derived from the server-provided timestamp (not a fresh client clock) so
  // the upcoming/past filter and "today" highlight render identically on the
  // server and on hydration.
  const now = new Date(nowMs)

  // Debounce the free-text search before it hits the backend.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Send `q` to the backend so search covers title/description across the full
  // published dataset. First run is skipped so the server-rendered events
  // aren't immediately refetched on mount. The time filter + calendar below
  // continue to operate over whatever this returns.
  const isFirstRun = useRef(true)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    let cancelled = false
    setSearching(true)
    listNetworkingEvents({
      status: "published",
      ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
    })
      .then((res) => {
        if (!cancelled) setEventList(res.events || [])
      })
      .finally(() => {
        if (!cancelled) setSearching(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedSearch])

  const filteredEvents = useMemo(() => {
    return eventList.filter((e) => {
      const eventDate = new Date(e.event_date)
      return timeFilter === "upcoming" ? eventDate >= now : eventDate < now
    })
  }, [eventList, timeFilter])

  // Events keyed by day for calendar view
  const eventsByDay = useMemo(() => {
    const map = new Map<string, NetworkingEvent[]>()
    for (const e of eventList) {
      const d = new Date(e.event_date)
      if (d.getFullYear() === calMonth.year && d.getMonth() === calMonth.month) {
        const key = d.getDate().toString()
        const arr = map.get(key) || []
        arr.push(e)
        map.set(key, arr)
      }
    }
    return map
  }, [eventList, calMonth])

  const weeks = getMonthGrid(calMonth.year, calMonth.month)
  const monthLabel = new Date(calMonth.year, calMonth.month).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  )

  const prevMonth = () =>
    setCalMonth((m) =>
      m.month === 0
        ? { year: m.year - 1, month: 11 }
        : { ...m, month: m.month - 1 }
    )
  const nextMonth = () =>
    setCalMonth((m) =>
      m.month === 11
        ? { year: m.year + 1, month: 0 }
        : { ...m, month: m.month + 1 }
    )

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
      {/* Search */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-full focus:border-navy-dark focus:ring-0 font-serif text-lg outline-none shadow-sm transition-all"
          />
          {searching && (
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary text-xl animate-spin">
              progress_activity
            </span>
          )}
          {search && !searching && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-navy-dark text-xl"
            >
              close
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
        {/* View toggle */}
        <div className="bg-gray-100 p-1 rounded-full flex shadow-inner">
          <button
            onClick={() => setView("list")}
            className={`px-8 py-2 rounded-full label-sm text-[10px] font-bold tracking-widest transition-all ${
              view === "list"
                ? "bg-navy-dark text-white shadow-lg"
                : "text-secondary hover:text-navy-dark"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-8 py-2 rounded-full label-sm text-[10px] font-bold tracking-widest transition-all ${
              view === "calendar"
                ? "bg-navy-dark text-white shadow-lg"
                : "text-secondary hover:text-navy-dark"
            }`}
          >
            Calendar View
          </button>
        </div>

        {/* Time filter (list view only) */}
        {view === "list" && (
          <div className="flex items-center gap-4">
            <span className="label-sm text-[10px] text-secondary font-bold tracking-widest">
              Show:
            </span>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setTimeFilter("upcoming")}
                className={`px-4 py-2 label-sm text-[10px] font-bold transition-colors ${
                  timeFilter === "upcoming"
                    ? "bg-gray-100 text-navy-dark"
                    : "text-secondary hover:bg-gray-50"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setTimeFilter("past")}
                className={`px-4 py-2 label-sm text-[10px] font-bold transition-colors ${
                  timeFilter === "past"
                    ? "bg-gray-100 text-navy-dark"
                    : "text-secondary hover:bg-gray-50"
                }`}
              >
                Past Events
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List View */}
      {view === "list" && (
        <>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-secondary">
                  calendar_today
                </span>
              </div>
              <p className="font-serif text-xl text-navy-dark mb-2">
                {timeFilter === "upcoming"
                  ? "No upcoming events"
                  : "No past events"}
              </p>
              <p className="text-sm text-secondary">
                {timeFilter === "upcoming"
                  ? "Check back soon for new networking opportunities."
                  : "Past events will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map((event, i) => (
                <div key={event.id}>
                  <NetworkingEventCard event={event} now={nowMs} />
                  {i < filteredEvents.length - 1 && (
                    <div className="h-px w-full bg-gold/20 mt-6" />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Month header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button
              onClick={prevMonth}
              className="material-symbols-outlined text-secondary hover:text-navy-dark transition-colors"
            >
              chevron_left
            </button>
            <h3 className="font-serif text-lg md:text-xl font-semibold text-navy-dark">
              {monthLabel}
            </h3>
            <button
              onClick={nextMonth}
              className="material-symbols-outlined text-secondary hover:text-navy-dark transition-colors"
            >
              chevron_right
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="py-3 text-center label-sm text-[10px] font-bold text-secondary tracking-widest"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-gray-50 last:border-b-0">
              {week.map((day, di) => {
                const dayEvents = day ? eventsByDay.get(day.toString()) : null
                const isToday =
                  day === now.getDate() &&
                  calMonth.month === now.getMonth() &&
                  calMonth.year === now.getFullYear()

                return (
                  <div
                    key={di}
                    className={`min-h-[100px] p-2 border-r border-gray-50 last:border-r-0 ${
                      day ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    {day && (
                      <>
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${
                            isToday
                              ? "bg-navy-dark text-white"
                              : "text-primary"
                          }`}
                        >
                          {day}
                        </span>
                        {dayEvents?.map((ev) => (
                          <a
                            key={ev.id}
                            href={`/networking/${ev.id}`}
                            className="block mt-1 px-2 py-1 bg-navy-dark/10 hover:bg-navy-dark/20 rounded text-[10px] font-medium text-navy-dark truncate transition-colors"
                            title={ev.title}
                          >
                            {ev.title}
                          </a>
                        ))}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
