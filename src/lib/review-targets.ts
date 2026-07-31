/**
 * What can still be reviewed on an order (7/28).
 *
 * An order has more than one reviewable thing: the SELLER you bought from, plus
 * each distinct PRODUCT in it. The account Reviews page used to treat "order has
 * any review" as done and the write form hardcoded reference:'seller', so a
 * buyer could only ever leave one seller review per order — product reviews were
 * reachable from the mobile app but never from web (follow-up #6 in
 * context/reviews-mobile-ui-spec-2026-07-08.md).
 *
 * The server is the real gate: validate-review now rejects any target that
 * wasn't in the order (see patches/@mercurjs__reviews@1.5.3.patch). This module
 * just keeps the UI from offering something that would be refused.
 */

export type ReviewTarget = {
  reference: "seller" | "product"
  reference_id: string
  label: string
  thumbnail?: string | null
}

type OrderLike = {
  seller?: { id?: string; name?: string } | null
  items?: Array<{
    title?: string | null
    thumbnail?: string | null
    product?: { id?: string | null; title?: string | null } | null
    product_id?: string | null
  }> | null
  reviews?: Array<{
    reference?: string
    product?: { id?: string } | null
    seller?: { id?: string } | null
  } | null> | null
}

/** Every reviewable target on an order, reviewed or not. */
export function reviewTargets(order: OrderLike): ReviewTarget[] {
  const targets: ReviewTarget[] = []

  if (order.seller?.id) {
    targets.push({
      reference: "seller",
      reference_id: order.seller.id,
      label: order.seller.name || "the seller",
      thumbnail: order.items?.[0]?.thumbnail ?? null,
    })
  }

  // De-duped: two variants of the same product are one reviewable product.
  const seen = new Set<string>()
  for (const item of order.items ?? []) {
    const productId = item?.product?.id ?? item?.product_id
    if (!productId || seen.has(productId)) continue
    seen.add(productId)
    targets.push({
      reference: "product",
      reference_id: productId,
      label: item?.product?.title || item?.title || "this product",
      thumbnail: item?.thumbnail ?? null,
    })
  }

  return targets
}

/**
 * Targets on this order the customer hasn't reviewed yet.
 *
 * A review whose target expansion is null is IGNORED rather than treated as
 * covering something: soft-deleted reviews resolve that way, and counting one
 * would permanently hide a target the buyer is entitled to review again.
 */
export function pendingReviewTargets(order: OrderLike): ReviewTarget[] {
  const reviewed = new Set<string>()
  for (const review of order.reviews ?? []) {
    if (!review?.reference) continue
    const targetId =
      review.reference === "product" ? review.product?.id : review.seller?.id
    if (targetId) reviewed.add(`${review.reference}:${targetId}`)
  }

  return reviewTargets(order).filter(
    (t) => !reviewed.has(`${t.reference}:${t.reference_id}`)
  )
}
