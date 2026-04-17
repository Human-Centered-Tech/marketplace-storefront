import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDirectoryListing } from "@/lib/data/directory"
import { DirectoryDetail } from "@/components/sections/DirectoryDetail/DirectoryDetail"
import { TrackPageView } from "@/components/sections/Analytics/TrackPageView"

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await getDirectoryListing(id)

  if (!listing) {
    return { title: "Not Found" }
  }

  return {
    title: listing.business_name,
    description:
      listing.description?.slice(0, 160) ||
      `${listing.business_name} - Catholic-owned business`,
  }
}

export default async function DirectoryDetailPage({ params }: Props) {
  const { id } = await params
  const listing = await getDirectoryListing(id)

  if (!listing) {
    notFound()
  }

  return (
    <main className="bg-[#FAF9F5]">
      <style>{`body { background-image: none !important; }`}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <TrackPageView entity_type="directory_listing" entity_id={listing.id} />
      <DirectoryDetail listing={listing} />
    </main>
  )
}
