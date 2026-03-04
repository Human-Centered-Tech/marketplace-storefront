"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DirectoryListingForm } from "@/components/sections/DirectoryManagement/DirectoryListingForm"
import { DirectoryCategory } from "@/types/directory"

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
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const res = await fetch(`${backendUrl}/store/directory/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Failed to create listing")
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
