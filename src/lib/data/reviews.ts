"use server"
import { revalidatePath } from "next/cache"
import { fetchQuery } from "../config"
import { getAuthHeaders } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export type Review = {
  id: string
  seller: {
    id: string
    name: string
    photo: string
  }
  reference: string
  customer_note: string
  rating: number
  updated_at: string
}

export type Order = HttpTypes.StoreOrder & {
  seller: { id: string; name: string; reviews?: any[] }
  reviews: any[]
}

const getReviews = async () => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const res = await fetchQuery("/store/reviews", {
    headers,
    method: "GET",
    query: { fields: "*seller,+customer.id,+order_id" },
  })

  return res
}

const createReview = async (review: any) => {
  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  const response = await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/store/reviews`,
    {
      headers,
      method: "POST",
      body: JSON.stringify(review),
    }
  ).then((res) => {
    revalidatePath("/user/reviews")
    revalidatePath("/user/reviews/written")
    return res
  })

  return response.json()
}

/**
 * Directory-listing reviews (7/28). Unlike seller/product reviews these carry no
 * order_id — there's no purchase to verify against a listing. Being signed in is
 * the whole eligibility rule (Brooke), which the backend enforces; the auth
 * header below is what carries it.
 */
const createListingReview = async (
  listingId: string,
  body: { rating: number; customer_note: string | null }
) => {
  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  const response = await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/store/directory/listings/${listingId}/reviews`,
    { headers, method: "POST", body: JSON.stringify(body) }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    // Surface the server's message — the useful cases here are 401 (session
    // expired mid-write) and 409 (already reviewed this business), both of which
    // need to reach the user rather than a generic failure.
    return { error: data?.message || "Could not save your review." }
  }

  revalidatePath(`/directory/${listingId}`)
  return data
}

/**
 * Edit / delete an existing review of ANY kind. Both hit the shared
 * /store/reviews/:id endpoint (our override — see the backend route file), which
 * resolves ownership through the customer<->review link, so listing, seller and
 * product reviews all go through here.
 */
const updateOwnReview = async (
  reviewId: string,
  body: { rating: number; customer_note: string | null },
  revalidate?: string
) => {
  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  const response = await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/store/reviews/${reviewId}`,
    { headers, method: "POST", body: JSON.stringify(body) }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    return { error: data?.message || "Could not update your review." }
  }

  if (revalidate) revalidatePath(revalidate)
  revalidatePath("/user/reviews/written")
  return data
}

const deleteOwnReview = async (reviewId: string, revalidate?: string) => {
  const headers = {
    ...(await getAuthHeaders()),
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  const response = await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/store/reviews/${reviewId}`,
    { headers, method: "DELETE" }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    return { error: data?.message || "Could not delete your review." }
  }

  if (revalidate) revalidatePath(revalidate)
  revalidatePath("/user/reviews")
  revalidatePath("/user/reviews/written")
  return data
}

export {
  getReviews,
  createReview,
  createListingReview,
  updateOwnReview,
  deleteOwnReview,
}
