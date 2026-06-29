import type { Metadata } from "next"
import { listNetworkingEvents } from "@/lib/data/networking"
import { NetworkingEventsView } from "@/components/sections/Networking/NetworkingEventsView"

export const metadata: Metadata = {
  title: "Events",
  description:
    "Building the New Catholic Economy®. Join virtual networking events for Catholic professionals.",
}

export default async function NetworkingPage() {
  const { events } = await listNetworkingEvents({ status: "published" })

  return (
    <main className="bg-[#FAF9F5]">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 px-4 text-center overflow-hidden bg-gradient-to-b from-white to-[#faf9f5]">
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="label-sm text-gold-dark tracking-[0.3em] mb-4 font-bold opacity-80">
            Building the New Catholic Economy®
          </p>
          <h1 className="display-md text-navy-dark mb-6 tracking-tight">
            Events
          </h1>
          <p className="font-serif text-xl italic text-secondary max-w-2xl mx-auto leading-relaxed">
            Connect with faithful entrepreneurs, skilled artisans, and principled
            professionals. Foster relationships rooted in tradition and excellence.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gold/30" />
      </section>

      {/* Events View (list/calendar + filters). Pass a single server
          timestamp so the client hydrates against the same "now" the server
          rendered with — otherwise upcoming/past + isPast computed from a
          fresh client `new Date()` diverge from the SSR markup (React #418). */}
      <NetworkingEventsView events={events} now={Date.now()} />

      {/* Decorative vertical accent */}
      <div className="flex justify-center py-16">
        <div className="h-24 w-px bg-gradient-to-b from-gold to-transparent" />
      </div>
    </main>
  )
}
