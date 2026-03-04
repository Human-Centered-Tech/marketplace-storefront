"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

const SACRAMENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "baptism", label: "Baptism" },
  { value: "first_communion", label: "First Communion" },
  { value: "confirmation", label: "Confirmation" },
  { value: "ordination", label: "Ordination" },
  { value: "other", label: "Other" },
]

export default function CreateRegistryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const data = {
      title: form.get("title") as string,
      description: (form.get("description") as string) || null,
      sacrament_type: form.get("sacrament_type") as string,
      event_date: (form.get("event_date") as string) || null,
    }

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const res = await fetch(`${backendUrl}/store/registry`, {
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
        throw new Error(err.message || "Failed to create registry")
      }

      const { registry } = await res.json()
      router.push(`/user/registry/${registry.id}`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container py-8">
      <h1 className="heading-xl uppercase mb-6">Create Gift Registry</h1>
      <div className="max-w-3xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-primary mb-1"
            >
              Registry Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="e.g., John & Mary's Wedding Registry"
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-primary mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Tell guests about your celebration..."
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="sacrament_type"
              className="block text-sm font-medium text-primary mb-1"
            >
              Sacrament Type *
            </label>
            <select
              id="sacrament_type"
              name="sacrament_type"
              required
              className="w-full border rounded-sm px-3 py-2 text-sm"
            >
              <option value="">Select a type...</option>
              {SACRAMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="event_date"
              className="block text-sm font-medium text-primary mb-1"
            >
              Event Date
            </label>
            <input
              type="date"
              id="event_date"
              name="event_date"
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-6 py-2 rounded-sm text-sm uppercase font-medium disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Registry"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="border border-primary text-primary px-6 py-2 rounded-sm text-sm uppercase font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
