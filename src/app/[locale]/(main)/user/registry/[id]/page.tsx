"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { GiftRegistry } from "@/types/registry"
import {
  getRegistry,
  updateRegistry,
  addRegistryItem,
  deleteRegistryItem,
  deleteRegistry,
} from "@/lib/data/registry"
import { RegistryItemRow } from "@/components/sections/Registry/RegistryItemRow"
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog/ConfirmDialog"
import { ShareRegistryButton } from "@/components/sections/Registry/ShareRegistryButton"

const SACRAMENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "baptism", label: "Baptism" },
  { value: "first_communion", label: "First Communion" },
  { value: "confirmation", label: "Confirmation" },
  { value: "ordination", label: "Ordination" },
  { value: "other", label: "Other" },
]

export default function RegistryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const locale = params.locale as string

  const [registry, setRegistry] = useState<GiftRegistry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [addingItem, setAddingItem] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fetchRegistry = useCallback(async () => {
    try {
      const data = await getRegistry(id)
      setRegistry(data)
    } catch {
      setError("Could not load registry")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRegistry()
  }, [fetchRegistry])

  const handleUpdateRegistry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      title: form.get("title") as string,
      description: (form.get("description") as string) || null,
      sacrament_type: form.get("sacrament_type") as string,
      event_date: (form.get("event_date") as string) || null,
    }

    try {
      const updated = await updateRegistry(id, body)
      setRegistry(updated)
      setEditing(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed")
    }
  }

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      product_title: form.get("product_title") as string,
      product_image: (form.get("product_image") as string) || null,
      quantity_desired: parseInt(form.get("quantity_desired") as string) || 1,
      note: (form.get("note") as string) || null,
    }

    try {
      await addRegistryItem(id, body)
      setAddingItem(false)
      fetchRegistry()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add item")
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteRegistryItem(id, itemId)
      fetchRegistry()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete item")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteRegistry(id)
      router.push(`/${locale}/user/registry`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete registry")
      setConfirmDelete(false)
    }
  }

  const handleStatusChange = async (
    status: "active" | "closed" | "archived"
  ) => {
    try {
      const updated = await updateRegistry(id, { status })
      setRegistry(updated)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Status update failed")
    }
  }

  if (loading) {
    return (
      <main className="container py-8">
        <p className="text-secondary">Loading registry...</p>
      </main>
    )
  }

  if (!registry) {
    return (
      <main className="container py-8">
        <p className="text-secondary">Registry not found.</p>
      </main>
    )
  }

  return (
    <main className="container py-8">
      <button
        onClick={() => router.push(`/${locale}/user/registry`)}
        className="text-sm text-secondary underline mb-4 inline-block"
      >
        &larr; Back to My Registries
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline text-sm"
          >
            dismiss
          </button>
        </div>
      )}

      {/* Registry Info */}
      {editing ? (
        <form onSubmit={handleUpdateRegistry} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-navy-dark mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              defaultValue={registry.title}
              required
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-dark mb-1">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={registry.description || ""}
              rows={3}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-dark mb-1">
              Sacrament Type
            </label>
            <select
              name="sacrament_type"
              defaultValue={registry.sacrament_type}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            >
              {SACRAMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-dark mb-1">
              Event Date
            </label>
            <input
              type="date"
              name="event_date"
              defaultValue={registry.event_date?.slice(0, 10) || ""}
              className="w-full border rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-navy-dark text-white px-4 py-2 rounded-sm text-sm uppercase font-medium"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="border border-navy-dark text-navy-dark px-4 py-2 rounded-sm text-sm uppercase font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="border rounded-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="heading-xl text-navy-dark">{registry.title}</h1>
              <p className="text-sm text-secondary mt-1">
                {SACRAMENT_TYPES.find(
                  (t) => t.value === registry.sacrament_type
                )?.label || registry.sacrament_type}
                {registry.event_date &&
                  ` | ${new Date(registry.event_date).toLocaleDateString()}`}
              </p>
              <p className="text-sm text-secondary">
                Status:{" "}
                <span
                  className={
                    registry.status === "active"
                      ? "text-green-700"
                      : registry.status === "closed"
                        ? "text-gray-700"
                        : "text-yellow-700"
                  }
                >
                  {registry.status}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="bg-navy-dark text-white px-4 py-2 rounded-sm text-sm uppercase font-medium"
              >
                Edit
              </button>
              {registry.status === "active" && (
                <button
                  onClick={() => handleStatusChange("closed")}
                  className="border border-navy-dark text-navy-dark px-4 py-2 rounded-sm text-sm uppercase font-medium"
                >
                  Close
                </button>
              )}
              {registry.status === "closed" && (
                <>
                  <button
                    onClick={() => handleStatusChange("active")}
                    className="border border-green-600 text-green-700 px-4 py-2 rounded-sm text-sm uppercase font-medium"
                  >
                    Reopen
                  </button>
                  <button
                    onClick={() => handleStatusChange("archived")}
                    className="border border-yellow-600 text-yellow-700 px-4 py-2 rounded-sm text-sm uppercase font-medium"
                  >
                    Archive
                  </button>
                </>
              )}
              <button
                onClick={() => setConfirmDelete(true)}
                className="border border-red-600 text-red-600 px-4 py-2 rounded-sm text-sm uppercase font-medium hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
          {registry.description && (
            <p className="text-secondary mt-4 text-sm">
              {registry.description}
            </p>
          )}
        </div>
      )}

      {/* Share Link */}
      <div className="mb-6">
        <h2 className="heading-sm text-navy-dark mb-2">Share This Registry</h2>
        <ShareRegistryButton token={registry.sharing_token} />
      </div>

      {/* Items */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-sm text-navy-dark">
            Items ({registry.items?.length || 0})
          </h2>
          {registry.status === "active" && (
            <button
              onClick={() => setAddingItem(!addingItem)}
              className="bg-navy-dark text-white px-4 py-2 rounded-sm text-sm uppercase font-medium"
            >
              {addingItem ? "Cancel" : "Add Item"}
            </button>
          )}
        </div>

        {addingItem && (
          <form
            onSubmit={handleAddItem}
            className="border rounded-sm p-4 mb-4 space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-1">
                Product Title *
              </label>
              <input
                type="text"
                name="product_title"
                required
                placeholder="e.g., Rosary Set"
                className="w-full border rounded-sm px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-1">
                Product Image URL
              </label>
              <input
                type="url"
                name="product_image"
                placeholder="https://..."
                className="w-full border rounded-sm px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-dark mb-1">
                  Quantity Desired *
                </label>
                <input
                  type="number"
                  name="quantity_desired"
                  min={1}
                  defaultValue={1}
                  required
                  className="w-full border rounded-sm px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-dark mb-1">
                  Note
                </label>
                <input
                  type="text"
                  name="note"
                  placeholder="Optional note..."
                  className="w-full border rounded-sm px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-navy-dark text-white px-4 py-2 rounded-sm text-sm uppercase font-medium"
            >
              Add Item
            </button>
          </form>
        )}

        {registry.items?.length > 0 ? (
          <div className="space-y-3">
            {registry.items.map((item) => (
              <RegistryItemRow
                key={item.id}
                item={item}
                isOwner
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary border rounded-sm p-4 text-center">
            No items yet. Add items to your registry so guests know what to
            gift.
          </p>
        )}
      </div>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete Registry"
        message="Are you sure you want to delete this registry? All items will be removed and shared links will stop working. This cannot be undone."
        confirmLabel="Delete Registry"
        cancelLabel="Keep It"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </main>
  )
}
