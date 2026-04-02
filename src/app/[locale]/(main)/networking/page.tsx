import type { Metadata } from "next"
import { listNetworkingEvents } from "@/lib/data/networking"
import { NetworkingEventCard } from "@/components/sections/Networking/NetworkingEventCard"

export const metadata: Metadata = {
  title: "Speed Networking",
  description:
    "Building the Mystical Body in Business. Join virtual speed networking events for Catholic professionals.",
}

export default async function NetworkingPage() {
  const { events } = await listNetworkingEvents({ status: "published" })

  return (
    <main>
      {/* Hero banner */}
      <div className="bg-navy-dark py-12 lg:py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="label-sm text-white/50 tracking-[0.15em] mb-3">
            Building the Mystical Body in Business
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4">
            Speed Networking
          </h1>
          <p className="text-[16px] text-white/70">
            Connect with faithful entrepreneurs, skilled artisans, and principled
            professionals. Foster relationships rooted in tradition and excellence.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgba(var(--neutral-100))] flex items-center justify-center">
              <span className="font-serif text-2xl text-secondary">📅</span>
            </div>
            <p className="font-serif text-xl text-primary mb-2">
              No upcoming events
            </p>
            <p className="text-[14px] text-secondary">
              Check back soon for new networking opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <NetworkingEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
