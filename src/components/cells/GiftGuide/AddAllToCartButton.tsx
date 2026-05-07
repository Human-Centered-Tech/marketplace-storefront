"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { addManyToCart } from "@/lib/data/cart"
import { toast } from "@/lib/helpers/toast"

type Props = {
  variantIds: string[]
  totalProducts: number
}

export function AddAllToCartButton({ variantIds, totalProducts }: Props) {
  const params = useParams()
  const locale = (params?.locale as string) || "us"
  const [isAdding, setIsAdding] = useState(false)

  const purchasable = variantIds.length
  const skipped = totalProducts - purchasable

  if (purchasable === 0) return null

  const handleClick = async () => {
    if (isAdding) return
    setIsAdding(true)
    try {
      const result = await addManyToCart({
        items: variantIds.map((variantId) => ({ variantId, quantity: 1 })),
        countryCode: locale,
      })
      if (result.added > 0) {
        const skipNote = skipped > 0 ? ` (${skipped} unavailable, skipped)` : ""
        toast.success({
          title: `Added ${result.added} item${result.added === 1 ? "" : "s"} to your cart${skipNote}`,
        })
      } else {
        toast.error({ title: "Couldn't add any items to your cart" })
      }
    } catch {
      toast.error({ title: "Failed to add items to cart" })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isAdding}
      className="bg-[#17294A] hover:bg-[#0f1d36] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-[0.15em] transition-all"
    >
      {isAdding
        ? "Adding…"
        : `Add All ${purchasable} to Cart`}
    </button>
  )
}
