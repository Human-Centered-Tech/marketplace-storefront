import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getNetworkingEvent } from "@/lib/data/networking"
import { NetworkingEventDetail } from "@/components/sections/Networking/NetworkingEventDetail"

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const event = await getNetworkingEvent(id)

  if (!event) {
    return { title: "Not Found" }
  }

  return {
    title: event.title,
    description:
      event.description?.slice(0, 160) ||
      `${event.title} - Catholic professional networking event`,
  }
}

export default async function NetworkingEventPage({ params }: Props) {
  const { id } = await params
  const event = await getNetworkingEvent(id)

  if (!event) {
    notFound()
  }

  return (
    <main className="bg-[#FAF9F5]">
      <style>{`body { background-image: none !important; }`}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <NetworkingEventDetail event={event} />
    </main>
  )
}
