import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBarterListing } from "@/lib/data/barter"
import { BarterDetail } from "@/components/sections/Barter/BarterDetail"

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await getBarterListing(id)

  if (!listing) {
    return { title: "Not Found" }
  }

  return {
    title: listing.title,
    description:
      listing.description?.slice(0, 160) ||
      `${listing.title} - Community Marketplace listing`,
  }
}

export default async function BarterDetailPage({ params }: Props) {
  const { id } = await params
  const listing = await getBarterListing(id)

  if (!listing) {
    notFound()
  }

  return (
    <main>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 pb-20">
        <BarterDetail listing={listing} />
      </div>
    </main>
  )
}
