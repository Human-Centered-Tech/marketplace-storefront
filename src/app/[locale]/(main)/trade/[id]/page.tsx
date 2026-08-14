import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBarterListing } from "@/lib/data/barter"
import { retrieveCustomer } from "@/lib/data/customer"
import { BarterDetail } from "@/components/sections/Barter/BarterDetail"
import { TrackPageView } from "@/components/sections/Analytics/TrackPageView"
import { buildSocialMetadata } from "@/lib/helpers/seo"

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await getBarterListing(id)

  if (!listing) {
    return { title: "Not Found" }
  }

  const description =
    listing.description?.slice(0, 160) ||
    `${listing.title} - Community Marketplace listing`

  return {
    title: listing.title,
    description,
    ...buildSocialMetadata({
      title: listing.title,
      description,
      image: listing.images?.[0]?.url,
    }),
  }
}

export default async function BarterDetailPage({ params }: Props) {
  const { id } = await params
  const [listing, user] = await Promise.all([
    getBarterListing(id),
    retrieveCustomer(),
  ])

  if (!listing) {
    notFound()
  }

  return (
    <main>
      <TrackPageView entity_type="barter_listing" entity_id={listing.id} />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 pb-20">
        <BarterDetail listing={listing} currentUserId={user?.id ?? null} />
      </div>
    </main>
  )
}
