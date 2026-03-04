"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DirectoryListingForm } from "@/components/sections/DirectoryManagement/DirectoryListingForm"
import { DirectoryCategory, DirectoryListing } from "@/types/directory"

export default function EditDirectoryListingPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<DirectoryCategory[]>([])
  const [listing, setListing] = useState<DirectoryListing | null>(null)
  const [loading, setLoading] = useState(true)

  const backendUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      : "http://localhost:9000"

  useEffect(() => {
    const headers: Record<string, string> = {
      "x-publishable-api-key":
        process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
    }

    Promise.all([
      fetch(`${backendUrl}/store/directory/categories`, { headers }).then((r) =>
        r.json()
      ),
      fetch(`${backendUrl}/store/directory/listings?limit=1`, {
        headers,
        credentials: "include",
      }).then((r) => r.json()),
    ])
      .then(([catData, listingData]) => {
        setCategories(catData.categories || [])
        if (listingData.listings?.length) {
          setListing(listingData.listings[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [backendUrl])

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!listing) return

    const res = await fetch(
      `${backendUrl}/store/directory/listings/${listing.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    )

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Failed to update listing")
    }

    router.push("/user/directory")
    router.refresh()
  }

  if (loading) {
    return (
      <main className="container py-8">
        <p className="text-secondary">Loading...</p>
      </main>
    )
  }

  if (!listing) {
    return (
      <main className="container py-8">
        <p className="text-secondary">No listing found. Create one first.</p>
      </main>
    )
  }

  const addr = listing.address as any
  const social = listing.social_links as any

  return (
    <main className="container py-8">
      <h1 className="heading-xl uppercase mb-6">Edit Directory Listing</h1>
      <div className="max-w-3xl">
        <DirectoryListingForm
          initialData={{
            business_name: listing.business_name,
            slug: listing.slug,
            description: listing.description || "",
            category_id: listing.category_id || "",
            contact_email: listing.contact_email || "",
            contact_phone: listing.contact_phone || "",
            website_url: listing.website_url || "",
            street: addr?.street || "",
            city: addr?.city || "",
            state: addr?.state || "",
            zip: addr?.zip || "",
            facebook: social?.facebook || "",
            instagram: social?.instagram || "",
            twitter: social?.twitter || "",
            linkedin: social?.linkedin || "",
          }}
          categories={categories}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </main>
  )
}
