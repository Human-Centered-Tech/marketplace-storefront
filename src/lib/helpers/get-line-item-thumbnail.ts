/**
 * Resolve the best available image for a cart or order line item.
 *
 * A line item's own `thumbnail` is a snapshot captured at add-to-cart time and
 * is empty whenever the product had no thumbnail set (e.g. the image was added
 * to the gallery only). Fall back to the product's first gallery image so the
 * cart, checkout and order views show the same image as the product page,
 * rather than a placeholder. Requires the cart/order to be fetched with
 * `*items.product.images`.
 */
export const getLineItemThumbnail = (item: any): string | null =>
  item?.thumbnail ||
  item?.product?.images?.[0]?.url ||
  item?.variant?.product?.images?.[0]?.url ||
  item?.product?.thumbnail ||
  item?.variant?.product?.thumbnail ||
  null
