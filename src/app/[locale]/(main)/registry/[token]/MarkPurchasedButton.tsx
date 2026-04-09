"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { markItemPurchased } from "@/lib/data/registry"

export const MarkPurchasedButton = ({
  token,
  itemId,
  remaining,
}: {
  token: string
  itemId: string
  remaining: number
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    setError(false)
    try {
      await markItemPurchased(token, itemId, 1)
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
        disabled={loading}
        className="bg-navy-dark text-white px-3 py-1.5 rounded-sm text-xs uppercase font-medium disabled:opacity-50"
      >
        {loading
          ? "..."
          : remaining === 1
            ? "Mark Purchased"
            : `Mark 1 Purchased`}
      </button>
      {error && (
        <span className="text-xs text-red-600">Failed. Try again.</span>
      )}
    </div>
  )
}
