"use client"

import { Button } from "@/components/atoms"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { SellerProps } from "@/types/seller"
import { MessageIcon } from "@/icons"
import { startConversation } from "@/lib/data/messaging"

/**
 * "Message seller" entry point. Starts (or reuses) a conversation in the
 * first-party messaging module and sends the user to their inbox thread.
 * Replaces the former TalkJS modal. Props are kept stable so existing call
 * sites (product header, seller pages, order views) don't need changes.
 */
export const Chat = ({
  user,
  seller,
  buttonClassNames,
  icon,
  product,
}: {
  user: HttpTypes.StoreCustomer | null
  seller: SellerProps
  buttonClassNames?: string
  icon?: boolean
  product?: HttpTypes.StoreProduct
  subject?: string
  order_id?: string
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    if (!user?.id) {
      router.push("/user")
      return
    }
    if (!seller?.id) {
      setError("This seller is unavailable.")
      return
    }

    setLoading(true)
    setError(null)

    const res = await startConversation(
      product?.id
        ? {
            product_id: product.id,
            context_type: "product",
            context_id: product.id,
          }
        : {
            seller_id: seller.id,
            context_type: "storefront",
            context_id: seller.id,
          }
    )

    setLoading(false)

    if (res?.conversation?.id) {
      router.push(`/user/messages?conversation=${res.conversation.id}`)
    } else {
      setError("This seller can't receive messages yet.")
    }
  }

  return (
    <div className="inline-flex flex-col">
      <Button
        variant="tonal"
        onClick={handleClick}
        disabled={loading}
        className={buttonClassNames}
      >
        {icon ? (
          // Stroke follows the button's text color (currentColor) so the
          // envelope is visible in the default state too — not just on hover.
          // Without this the icon defaults to near-black and disappears into
          // the navy button until hover flips the background.
          <MessageIcon size={20} color="currentColor" />
        ) : loading ? (
          "Starting…"
        ) : (
          "Message seller"
        )}
      </Button>
      {error && (
        <span className="text-xs text-red-600 mt-1">{error}</span>
      )}
    </div>
  )
}
