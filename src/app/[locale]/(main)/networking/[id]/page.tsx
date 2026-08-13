import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getNetworkingEvent } from "@/lib/data/networking"
import { EVENT_GATED } from "@/lib/data/networking-gated"
import { NetworkingEventDetail } from "@/components/sections/Networking/NetworkingEventDetail"
import { buildSocialMetadata } from "@/lib/helpers/seo"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const event = await getNetworkingEvent(id)

  if (event === EVENT_GATED) {
    // Deliberately generic — reveal nothing about what's behind the gate.
    return { title: "Members-only event" }
  }

  if (!event) {
    return { title: "Not Found" }
  }

  const description =
    event.description?.slice(0, 160) ||
    `${event.title} - Catholic professional networking event`

  // Events have no dedicated image column; use an optional metadata image if
  // one was attached, otherwise the brand default kicks in.
  const eventImage =
    ((event.metadata as Record<string, unknown> | null)?.image_url as string) ||
    null

  return {
    title: event.title,
    description,
    ...buildSocialMetadata({ title: event.title, description, image: eventImage }),
  }
}

export default async function NetworkingEventPage({ params }: Props) {
  const { id, locale } = await params
  const event = await getNetworkingEvent(id)

  // Featured event, signed-out viewer: show a sign-in interstitial instead of
  // a 404. Invites go out by email, so the logged-out click is the NORMAL
  // first touch for exactly the people invited — a dead end here bounces the
  // whole campaign audience (Brooke, 8/11). No event details are shown or
  // available (the API withholds them); after login, /user's return_to hop
  // brings them straight back to this page, now eligible.
  if (event === EVENT_GATED) {
    const returnTo = encodeURIComponent(`/${locale}/networking/${id}`)
    return (
      <main className="bg-[#FAF9F5]">
        <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
          <div className="max-w-lg w-full text-center bg-white rounded-sm border border-[#e5e2d9] p-8 lg:p-10 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a8570] mb-3">
              Members-only event
            </p>
            <h1 className="font-serif text-3xl font-bold text-primary mb-3">
              Sign in to view this event
            </h1>
            <p className="text-[14px] text-secondary mb-8">
              This event is reserved for signed-in members. If you received an
              invitation, sign in with your member account to see the details
              and RSVP.
            </p>
            <LocalizedClientLink
              href={`/user?return_to=${returnTo}`}
              className="inline-block bg-primary text-white text-sm font-semibold uppercase tracking-wide rounded-full px-8 py-3.5"
            >
              Sign in
            </LocalizedClientLink>
          </div>
        </div>
      </main>
    )
  }

  if (!event) {
    notFound()
  }

  return (
    <main className="bg-[#FAF9F5]">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <NetworkingEventDetail event={event} />
    </main>
  )
}
