"use client"

import { useState } from "react"
// Using inline types to avoid @medusajs/types dependency resolution issue
type StoreProduct = { id: string; title?: string; thumbnail?: string | null; handle?: string }
type StoreCustomer = { id: string } | null
import { GiftRegistry } from "@/types/registry"
import { addRegistryItem } from "@/lib/data/registry"
import { Button } from "@/components/atoms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const AddToRegistryButton = ({
  product,
  user,
  registries,
}: {
  product: StoreProduct
  user: StoreCustomer
  registries: GiftRegistry[]
}) => {
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  if (!user) return null

  const activeRegistries = registries.filter((r) => r.status === "active")

  const handleAdd = async (registryId: string) => {
    setAdding(true)
    try {
      await addRegistryItem(registryId, {
        product_id: product.handle || product.id,
        product_title: product.title || "Product",
        product_image: product.thumbnail || null,
        quantity_desired: 1,
      })
      const registry = activeRegistries.find((r) => r.id === registryId)
      setSuccess(registry?.title || "Registry")
      setTimeout(() => {
        setSuccess(null)
        setOpen(false)
      }, 1500)
    } catch {
      // silently fail
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="tonal"
        className="w-10 h-10 p-0 flex items-center justify-center"
        title="Add to Gift Registry"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="8" width="18" height="13" rx="2" />
          <path d="M12 8V21" />
          <path d="M19 8c0-2.8-2.2-5-5-5a5 5 0 0 0-2 .4" />
          <path d="M5 8c0-2.8 2.2-5 5-5a5 5 0 0 1 2 .4" />
          <path d="M3 12h18" />
        </svg>
      </Button>

      {/* Registry Picker Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="absolute inset-0 bg-[#001435]/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-navy-dark">
                  Add to Registry
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="text-secondary hover:text-navy-dark transition-colors text-xl leading-none"
                >
                  &times;
                </button>
              </div>
              <p className="text-xs text-secondary mt-1 line-clamp-1">
                {product.title}
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              {success ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3D7A4A"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="font-serif text-navy-dark">
                    Added to {success}
                  </p>
                </div>
              ) : activeRegistries.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-secondary mb-4">
                    You don&apos;t have any active registries yet.
                  </p>
                  <LocalizedClientLink
                    href="/user/registry/create"
                    className="bg-navy-dark text-white px-5 py-2.5 rounded-lg text-xs uppercase font-medium tracking-wider inline-block"
                  >
                    Create a Registry
                  </LocalizedClientLink>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeRegistries.map((registry) => (
                    <button
                      key={registry.id}
                      onClick={() => handleAdd(registry.id)}
                      disabled={adding}
                      className="w-full text-left p-4 rounded-lg border border-gray-100 hover:border-gold/50 hover:bg-gold/5 transition-all flex items-center justify-between group disabled:opacity-50"
                    >
                      <div>
                        <p className="font-serif text-navy-dark group-hover:text-gold-dark transition-colors">
                          {registry.title}
                        </p>
                        <p className="text-[10px] text-secondary uppercase tracking-wider mt-0.5">
                          {registry.sacrament_type} &bull;{" "}
                          {registry.items?.length || 0} items
                        </p>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-secondary group-hover:text-gold-dark transition-colors"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
