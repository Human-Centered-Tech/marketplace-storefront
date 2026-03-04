import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDirectoryListing } from "@/lib/data/directory"
import { DirectoryDetail } from "@/components/sections/DirectoryDetail/DirectoryDetail"

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
    <main className="container px-4 lg:px-8 py-8">
      <DirectoryDetail listing={listing} />
    </main>
  )
}
