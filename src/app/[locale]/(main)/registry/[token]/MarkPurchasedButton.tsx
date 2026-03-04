"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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

  const handleClick = async () => {
    setLoading(true)
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const res = await fetch(`${backendUrl}/store/registry/share/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ item_id: itemId, quantity: 1 }),
      })

      if (!res.ok) {
        throw new Error("Failed to mark item as purchased")
      }

      router.refresh()
    } catch {
      alert("Could not mark item as purchased. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-primary text-white px-3 py-1.5 rounded-sm text-xs uppercase font-medium disabled:opacity-50"
    >
      {loading
        ? "..."
        : remaining === 1
          ? "Mark Purchased"
          : `Mark 1 Purchased`}
    </button>
  )
}
