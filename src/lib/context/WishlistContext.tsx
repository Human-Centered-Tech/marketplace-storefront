"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react"

import { addWishlistItem, removeWishlistItem } from "@/lib/data/wishlist"
import { track } from "@/lib/analytics"
import { toast } from "@/lib/helpers/toast"

type WishlistContextValue = {
  isLoggedIn: boolean
  isFavorited: (productId: string) => boolean
  toggle: (productId: string) => Promise<void>
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

/**
 * Client-side favorites state for listing cards. Seeded from the server
 * (`initialProductIds`, fetched in the (main) layout where the auth cookie is
 * readable). Toggling updates optimistically and calls the wishlist server
 * actions. Hidden entirely when signed out — matching the detail WishlistButton.
 */
export function WishlistProvider({
  initialProductIds,
  isLoggedIn,
  children,
}: {
  initialProductIds: string[]
  isLoggedIn: boolean
  children: ReactNode
}) {
  const [ids, setIds] = useState<Set<string>>(
    () => new Set(initialProductIds)
  )

  const isFavorited = useCallback(
    (productId: string) => ids.has(productId),
    [ids]
  )

  const toggle = useCallback(
    async (productId: string) => {
      if (!isLoggedIn) return
      const wasFav = ids.has(productId)
      setIds((prev) => {
        const next = new Set(prev)
        if (wasFav) next.delete(productId)
        else next.add(productId)
        return next
      })
      try {
        if (wasFav) {
          await removeWishlistItem({ product_id: productId })
        } else {
          await addWishlistItem({ reference_id: productId, reference: "product" })
          // Conversion signal — feeds the product_view → favorite → cart_add →
          // purchase funnel in admin/vendor analytics. Add only; the event
          // vocabulary has no un-favorite counterpart. Fire-and-forget.
          track({
            event_type: "favorite",
            entity_type: "product",
            entity_id: productId,
          })
        }
      } catch (error) {
        // Revert on failure. This path was unreachable until the wishlist
        // actions started throwing on a non-2xx — the heart stayed flipped
        // for saves the backend had rejected.
        setIds((prev) => {
          const next = new Set(prev)
          if (wasFav) next.add(productId)
          else next.delete(productId)
          return next
        })
        console.error(error)
        toast.error({
          title: wasFav
            ? "Couldn't remove this from your wishlist"
            : "Couldn't save to your wishlist",
          description:
            error instanceof Error ? error.message : "Please try again.",
        })
      }
    },
    [ids, isLoggedIn]
  )

  return (
    <WishlistContext.Provider value={{ isLoggedIn, isFavorited, toggle }}>
      {children}
    </WishlistContext.Provider>
  )
}

// Returns null when no provider is mounted, so callers can render nothing.
export function useWishlist() {
  return useContext(WishlistContext)
}
