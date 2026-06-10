"use server"
import { Wishlist } from "@/types/wishlist"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"
import { revalidatePath } from "next/cache"

// GET /store/wishlist returns the current customer's saved products directly
// (`{ products, count, offset, limit }`) — NOT a wrapped wishlist object. We
// adapt it to the `{ wishlists: [{ id, products }] }` shape the existing UI
// (wishlist page + WishlistButton) already reads.
export const getUserWishlists = async () => {
  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  const res = await sdk.client.fetch<{
    products?: HttpTypes.StoreProduct[]
    count?: number
  }>(`/store/wishlist`, {
    cache: "no-cache",
    headers,
    method: "GET",
  })

  const products = res.products ?? []
  return {
    wishlists: [{ id: "", products }] as Wishlist[],
    count: res.count ?? products.length,
  }
}

// Lightweight helper for seeding the client wishlist context — just the saved
// product ids. Returns [] when signed out / on error.
export const getWishlistProductIds = async (): Promise<string[]> => {
  try {
    const { wishlists } = await getUserWishlists()
    return wishlists[0]?.products?.map((p) => p.id) ?? []
  } catch {
    return []
  }
}

export const addWishlistItem = async ({
  reference_id,
  reference,
}: {
  reference_id: string
  reference: "product"
}) => {
  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/wishlist`, {
    headers,
    method: "POST",
    body: JSON.stringify({
      reference,
      reference_id,
    }),
  }).then(() => {
    revalidatePath("/wishlist")
  })
}

// Mercur resolves the wishlist from the logged-in customer, so removal only
// needs the product id — `/store/wishlist/product/{product_id}`.
export const removeWishlistItem = async ({
  product_id,
}: {
  product_id: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/store/wishlist/product/${product_id}`,
    {
      headers,
      method: "DELETE",
    }
  ).then(() => {
    revalidatePath("/wishlist")
  })
}
