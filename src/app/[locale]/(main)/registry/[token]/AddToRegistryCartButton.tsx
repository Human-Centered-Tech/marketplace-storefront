"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addToCart } from "@/lib/data/cart"

// Lets a gift buyer add a registry item straight to their cart from the shared
// page — no account needed (the cart is created/looked up for guests too).
export const AddToRegistryCartButton = ({
  variantId,
  countryCode,
}: {
  variantId: string
  countryCode: string
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    setError(false)
    try {
      await addToCart({ variantId, quantity: 1, countryCode })
      setAdded(true)
      router.refresh()
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading || added}
        className="bg-gradient-to-r from-[#D4B043] to-[#9F8129] text-white px-4 py-2 rounded-sm text-xs uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {added ? "Added ✓" : loading ? "..." : "Add to Cart"}
      </button>
      {error && (
        <span className="text-xs text-red-600">Failed. Try again.</span>
      )}
    </div>
  )
}
