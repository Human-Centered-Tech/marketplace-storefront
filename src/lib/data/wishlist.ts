"use server"
import { Wishlist } from "@/types/wishlist"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"
import { revalidatePath } from "next/cache"

// Pull the backend's message off a failed wishlist response, falling back to
// something a shopper can act on. Not exported — a "use server" module may
// only export async functions, and this is an internal helper.
async function wishlistError(res: Response, fallback: string) {
  const body = await res.json().catch(() => null)
  return body?.message || fallback
}

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

  try {
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
  } catch {
    // The backend currently 500s for customers who have never added a
    // wishlist item (the wishlist row is created lazily on first add). Treat
    // any fetch failure as an empty wishlist so the page renders its empty
    // state instead of crashing the whole Server Components render.
    return {
      wishlists: [{ id: "", products: [] }] as Wishlist[],
      count: 0,
    }
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

  const res = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/wishlist`, {
    headers,
    method: "POST",
    body: JSON.stringify({
      reference,
      reference_id,
    }),
  })

  // fetch resolves on 4xx/5xx, so the old bare `.then()` meant the callers'
  // catch blocks were unreachable and the heart flipped to "saved" for
  // requests the backend had rejected. Throw so they can react.
  if (!res.ok) {
    throw new Error(await wishlistError(res, "Couldn't save to your wishlist."))
  }

  revalidatePath("/wishlist")
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

  const res = await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/store/wishlist/product/${product_id}`,
    {
      headers,
      method: "DELETE",
    }
  )

  if (!res.ok) {
    throw new Error(
      await wishlistError(res, "Couldn't remove this from your wishlist.")
    )
  }

  revalidatePath("/wishlist")
}
