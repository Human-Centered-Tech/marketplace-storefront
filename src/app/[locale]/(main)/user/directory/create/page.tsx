"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DirectoryListingForm } from "@/components/sections/DirectoryManagement/DirectoryListingForm"
import { DirectoryCategory } from "@/types/directory"
import { createDirectoryListing } from "@/lib/data/directory-actions"

export default function CreateDirectoryListingPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<DirectoryCategory[]>([])

  useEffect(() => {
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    fetch(`${backendUrl}/store/directory/categories`, {
      headers: {
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
    })
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {})
  }, [])

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await createDirectoryListing(data)
    if (!res.ok) {
      throw new Error(res.error || "Failed to create listing")
    }

    router.push("/user/directory")
    router.refresh()
  }

  return (
    <main className="container py-8">
      <h1 className="heading-xl uppercase mb-6">Create Directory Listing</h1>
      <div className="max-w-3xl">
        <DirectoryListingForm
          categories={categories}
          onSubmit={handleSubmit}
          submitLabel="Create Listing"
        />
      </div>
    </main>
  )
}
