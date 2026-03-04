import type { Metadata } from "next"
import { listNetworkingEvents } from "@/lib/data/networking"
import { NetworkingEventCard } from "@/components/sections/Networking/NetworkingEventCard"

export const metadata: Metadata = {
  title: "Speed Networking Events",
  description:
    "Join virtual speed networking events for Catholic professionals. Connect with fellow entrepreneurs and business owners in your community.",
}

export default async function NetworkingPage() {
  const { events } = await listNetworkingEvents({ status: "published" })

  return (
    <main className="container px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="heading-lg text-primary mb-2">
          Speed Networking Events
        </h1>
        <p className="text-secondary">
          Connect with Catholic professionals through virtual speed networking
          sessions. Meet fellow entrepreneurs, share ideas, and grow your
          network within the faith community.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-secondary">
          <p className="text-lg mb-2">No upcoming events</p>
          <p className="text-sm">
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
    </main>
  )
}
