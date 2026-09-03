"use client"

import { Button } from "@/components/atoms"
import { HeartFilledIcon, HeartIcon } from "@/icons"
import { addWishlistItem, removeWishlistItem } from "@/lib/data/wishlist"
import { track } from "@/lib/analytics"
import { toast } from "@/lib/helpers/toast"
import { Wishlist } from "@/types/wishlist"
import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"

export const WishlistButton = ({
  productId,
  wishlist,
  user,
}: {
  productId: string
  wishlist?: Wishlist[]
  user?: HttpTypes.StoreCustomer | null
}) => {
  const [isWishlistAdding, setIsWishlistAdding] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(
    wishlist?.[0]?.products?.some((item) => item.id === productId)
  )

  useEffect(() => {
    setIsWishlisted(
      wishlist?.[0]?.products?.some((item) => item.id === productId)
    )
  }, [wishlist, productId])

  if (!user) {
    return null
  }

  const handleAddToWishlist = async () => {
    try {
      setIsWishlistAdding(true)
      await addWishlistItem({
        reference_id: productId,
        reference: "product",
      })
      // Conversion signal — feeds the product_view → favorite → cart_add →
      // purchase funnel in admin/vendor analytics. Add only; the event
      // vocabulary has no un-favorite counterpart. Fire-and-forget.
      track({
        event_type: "favorite",
        entity_type: "product",
        entity_id: productId,
      })
    } catch (error) {
      console.error(error)
      toast.error({
        title: "Couldn't save to your wishlist",
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setIsWishlistAdding(false)
    }
  }

  const handleRemoveFromWishlist = async () => {
    try {
      setIsWishlistAdding(true)

      await removeWishlistItem({
        product_id: productId,
      })
    } catch (error) {
      console.error(error)
      toast.error({
        title: "Couldn't remove this from your wishlist",
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setIsWishlistAdding(false)
    }
  }
  return (
    <Button
      onClick={
        isWishlisted
          ? () => handleRemoveFromWishlist()
          : () => handleAddToWishlist()
      }
      variant="tonal"
      className="w-10 h-10 p-0 flex items-center justify-center"
      loading={isWishlistAdding}
      disabled={isWishlistAdding}
    >
      {isWishlisted ? (
        <HeartFilledIcon size={20} color="#DB2777" />
      ) : (
        <HeartIcon size={20} color="#DB2777" />
      )}
    </Button>
  )
}
