import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { listNetworkingEvents } from "@/lib/data/networking"
import { NetworkingEvent } from "@/types/networking"

const fallbackEvents = [
  {
    id: "fallback-1",
    month: "Oct",
    day: "24",
    name: "Catholic Business Mixer",
    location: "St. Jude Hall, Phoenix",
    locationIcon: "pin" as const,
    cta: "Register Now",
    color: "navy" as const,
  },
  {
    id: "fallback-2",
    month: "Nov",
    day: "12",
    name: "Eucharistic Economy Seminar",
    location: "Virtual Workshop",
    locationIcon: "video" as const,
    cta: "Join Stream",
    color: "gold" as const,
  },
]

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr)
  return {
    month: date.toLocaleString("en-US", { month: "short" }),
    day: date.getDate().toString(),
  }
}

function EventCard({
  month,
  day,
  name,
  location,
  locationIcon,
  cta,
  color,
  href,
}: {
  month: string
  day: string
  name: string
  location: string
  locationIcon: "pin" | "video"
  cta: string
  color: "navy" | "gold"
  href: string
}) {
  return (
    <div className="flex bg-white rounded-xl shadow-sm border border-[#c5c6cf]/10 overflow-hidden hover:shadow-md transition-all">
      <div
        className="w-32 flex flex-col items-center justify-center shrink-0"
        style={{
          backgroundColor: color === "navy" ? "#001435" : "#BE9B32",
        }}
      >
        <span
          className={`font-sans text-[11px] tracking-[0.15em] uppercase ${
            color === "navy" ? "text-white/70" : "text-[#001435]/60"
          }`}
        >
          {month}
        </span>
        <span
          className={`font-serif text-4xl font-bold ${
            color === "navy" ? "text-white" : "text-[#001435]"
          }`}
        >
          {day}
        </span>
      </div>
      <div className="p-8 space-y-3">
        <h3 className="font-serif text-xl font-bold text-[#001435]">{name}</h3>
        <p className="text-sm text-[#75777f] flex items-center gap-2">
          {locationIcon === "video" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#755b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#755b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          )}
          {location}
        </p>
        <LocalizedClientLink
          href={href}
          className="inline-block font-sans text-[11px] font-bold text-[#001435] tracking-[0.15em] uppercase border-b border-[#BE9B32]/50 pb-1 hover:border-[#BE9B32] transition-all"
        >
          {cta}
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export async function UpcomingEvents() {
  const { events } = await listNetworkingEvents({
    status: "published",
    limit: 4,
  })

  const hasData = events.length > 0

  return (
    <section className="py-16 lg:py-24 w-full bg-[#faf9f5] px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-[#755b00] font-bold">
              Get Involved
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#001435]">
              Upcoming Networking Events
            </h2>
          </div>
          <LocalizedClientLink
            href="/networking"
            className="bg-[#001435] text-white px-8 py-3 rounded-xl font-sans text-[11px] tracking-[0.15em] uppercase font-bold hover:bg-[#17294a] transition-all inline-block text-center"
          >
            See Full Calendar
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {hasData
            ? events.map((event: NetworkingEvent, i: number) => {
                const { month, day } = formatEventDate(event.event_date)
                const isVirtual = !!event.zoom_join_url
                return (
                  <EventCard
                    key={event.id}
                    month={month}
                    day={day}
                    name={event.title}
                    location={
                      isVirtual
                        ? "Virtual Workshop"
                        : (event.metadata as any)?.location || "TBA"
                    }
                    locationIcon={isVirtual ? "video" : "pin"}
                    cta={isVirtual ? "Join Stream" : "Register Now"}
                    color={i % 2 === 0 ? "navy" : "gold"}
                    href={`/networking/${event.id}`}
                  />
                )
              })
            : fallbackEvents.map((event) => (
                <EventCard
                  key={event.id}
                  month={event.month}
                  day={event.day}
                  name={event.name}
                  location={event.location}
                  locationIcon={event.locationIcon}
                  cta={event.cta}
                  color={event.color}
                  href="/networking"
                />
              ))}
        </div>
      </div>
    </section>
  )
}
