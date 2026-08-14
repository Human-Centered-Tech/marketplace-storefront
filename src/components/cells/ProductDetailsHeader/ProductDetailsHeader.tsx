"use client"

import { HttpTypes } from "@medusajs/types"
import useGetAllSearchParams from "@/hooks/useGetAllSearchParams"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { useState } from "react"
import { addToCart } from "@/lib/data/cart"
import { track } from "@/lib/analytics"
import { Chat } from "@/components/organisms/Chat/Chat"
import { SellerProps } from "@/types/seller"
import { WishlistButton } from "../WishlistButton/WishlistButton"
import { AddToRegistryButton } from "../AddToRegistryButton/AddToRegistryButton"
import { ShareButton } from "@/components/molecules/ShareButton/ShareButton"
import { Wishlist } from "@/types/wishlist"
import { GiftRegistry } from "@/types/registry"
import { toast } from "@/lib/helpers/toast"
import { useCartContext } from "@/components/providers"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

// Option titles we treat as a color option (→ render swatches, not text pills).
const COLOR_OPTION_TITLES = new Set(["color", "colour", "colors", "colours"])

const isColorOption = (title?: string | null) =>
  COLOR_OPTION_TITLES.has((title || "").trim().toLowerCase())

// CSS named colors we accept as a swatch fill when no explicit hex is set.
const CSS_COLOR_NAMES = new Set([
  "black", "white", "gray", "grey", "silver", "red", "maroon", "crimson",
  "pink", "hotpink", "orange", "coral", "salmon", "gold", "yellow", "khaki",
  "brown", "tan", "beige", "ivory", "green", "olive", "lime", "seagreen",
  "teal", "cyan", "aqua", "turquoise", "blue", "navy", "royalblue", "skyblue",
  "indigo", "purple", "violet", "magenta", "fuchsia", "lavender", "plum",
  "orchid", "chocolate", "charcoal",
])

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

/**
 * Swatch fill for a color value: the merchant's explicit hex (from
 * product.metadata.color_hex) first, then the value itself if it's a hex or a
 * known CSS color name, else a neutral grey. Deterministic (SSR-safe).
 */
const resolveSwatchColor = (
  value: string,
  hexMap?: Record<string, string> | null
): string => {
  const explicit = hexMap?.[value]?.trim()
  if (
    explicit &&
    (HEX_RE.test(explicit) || CSS_COLOR_NAMES.has(explicit.toLowerCase()))
  ) {
    return explicit
  }
  const v = (value || "").trim()
  if (HEX_RE.test(v)) return v
  if (CSS_COLOR_NAMES.has(v.toLowerCase())) return v.toLowerCase()
  return "#ccc"
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce(
    (
      acc: Record<string, string>,
      varopt: HttpTypes.StoreProductOptionValue
    ) => {
      acc[varopt.option?.title.toLowerCase() || ""] = varopt.value

      return acc
    },
    {}
  )
}

export const ProductDetailsHeader = ({
  product,
  locale,
  user,
  wishlist,
  registries,
  sellerRefundPolicy,
}: {
  product: HttpTypes.StoreProduct & { seller?: SellerProps }
  locale: string
  user: HttpTypes.StoreCustomer | null
  wishlist?: Wishlist[]
  registries?: GiftRegistry[]
  // The vendor's plain-text refund policy. Null = no policy posted →
  // no link rendered. Surfaced near Add to Cart so buyers see the
  // policy before they purchase (Amazon/Etsy pattern).
  sellerRefundPolicy?: string | null
}) => {
  const { onAddToCart, cart } = useCartContext()
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  // Personalization: merchant enables it per product via metadata. When on, the
  // buyer's text is saved with the cart line item (and shown on the order).
  const personalizationEnabled = Boolean(
    (product.metadata as Record<string, unknown> | null)?.personalization_available
  )
  const personalizationLabel =
    ((product.metadata as Record<string, unknown> | null)
      ?.personalization_label as string) || "Personalization"
  const [personalization, setPersonalization] = useState("")
  const [showRefundPolicy, setShowRefundPolicy] = useState(false)
  const { allSearchParams } = useGetAllSearchParams()
  const updateSearchParams = useUpdateSearchParams()

  const { cheapestVariant, cheapestPrice } = getProductPrice({
    product,
  })

  // Check if product has any valid prices in current region
  const hasAnyPrice = cheapestPrice !== null && cheapestVariant !== null

  // Per-product default-variant hint: a merchant can set metadata.default_size
  // (a Size option value, e.g. '16" x 20"') to pre-select that size instead of
  // the cheapest. Falls back to the cheapest variant for every other product,
  // so this only affects products that opt in.
  const defaultSize =
    typeof product.metadata?.default_size === "string"
      ? (product.metadata.default_size as string)
      : null
  const hintVariant = defaultSize
    ? product.variants?.find((v) =>
        (v.options ?? []).some(
          (o: any) =>
            (o.option?.title || "").toLowerCase() === "size" &&
            o.value === defaultSize
        )
      )
    : null
  const baseVariant = hintVariant ?? cheapestVariant

  // set default variant
  const selectedVariant = hasAnyPrice
    ? {
        ...optionsAsKeymap(baseVariant?.options ?? null),
        ...allSearchParams,
      }
    : allSearchParams

  // Option-less / imported products carry a placeholder option that isn't a
  // real buyer choice — Shopify exports it as "Title" / "Default Title", and
  // Medusa generates "Default option" / "Default value". Filter these out so
  // the PDP doesn't render a useless "Title: Default Title" selector.
  const realOptions = (product.options || []).filter(
    (o: HttpTypes.StoreProductOption) => {
      const title = (o.title || "").trim().toLowerCase()
      const values = (o.values || []).map(
        (v: HttpTypes.StoreProductOptionValue) =>
          (v.value || "").trim().toLowerCase()
      )
      const onlyValue = values.length <= 1 ? values[0] ?? "" : null
      if (title === "default option") return false
      if (
        title === "title" &&
        (onlyValue === "default title" || values.length === 0)
      )
        return false
      if (onlyValue === "default value" || onlyValue === "default title")
        return false
      return true
    }
  )

  // Display dimension-style sizes smallest→largest (by area), triptych last —
  // Medusa doesn't preserve the import order of option values. Only reorders
  // when every value is a size; leaves other options (Color, Language) as-is.
  const sortSizeValues = (
    values?: HttpTypes.StoreProductOptionValue[] | null
  ): HttpTypes.StoreProductOptionValue[] => {
    const arr = [...(values || [])]
    const key = (v?: string | null): number | null => {
      const s = (v || "").toString()
      if (/triptych/i.test(s)) return Number.POSITIVE_INFINITY
      const m = s.match(/(\d+)\s*"?\s*x\s*(\d+)/i)
      return m ? parseInt(m[1], 10) * parseInt(m[2], 10) : null
    }
    if (arr.some((v) => key(v.value) === null)) return arr
    return arr.sort(
      (a, b) => (key(a.value) as number) - (key(b.value) as number)
    )
  }

  // get selected variant id
  const variantId =
    product.variants?.find(({ options }: { options: any }) =>
      options?.every((option: any) =>
        selectedVariant[option.option?.title.toLowerCase() || ""]?.includes(
          option.value
        )
      )
    )?.id || ""

  // get variant price
  const { variantPrice } = getProductPrice({
    product,
    variantId,
  })

  const selectedVariantData = product.variants?.find(
    ({ id }) => id === variantId
  )

  const variantStock = selectedVariantData?.manage_inventory
    ? selectedVariantData.inventory_quantity ?? 0
    : Infinity

  const variantHasPrice = !!selectedVariantData?.calculated_price

  const isVariantStockMaxLimitReached =
    (cart?.items?.find((item) => item.variant_id === variantId)?.quantity ??
      0) >= variantStock

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!variantId || !hasAnyPrice) return null

    setIsAdding(true)
    // Conversion signal — feeds the product_view → cart_add → purchase funnel
    // in admin/vendor analytics.
    track({ event_type: "cart_add", entity_type: "product", entity_id: product.id })

    const subtotal = +(variantPrice?.calculated_price_without_tax_number || 0)
    const total = +(variantPrice?.calculated_price_number || 0)

    const storeCartLineItem = {
      thumbnail: product.thumbnail || product.images?.[0]?.url || "",
      product_title: product.title,
      quantity: quantity,
      subtotal: subtotal * quantity,
      total: total * quantity,
      tax_total: (total - subtotal) * quantity,
      variant_id: variantId,
      product_id: product.id,
      variant: product.variants?.find(({ id }) => id === variantId),
    }

    try {
      if (!isVariantStockMaxLimitReached) {
        onAddToCart(storeCartLineItem, variantPrice?.currency_code || "eur")
      }
      await addToCart({
        variantId: variantId,
        quantity: quantity,
        countryCode: locale,
        metadata: personalization.trim()
          ? { personalization: personalization.trim() }
          : undefined,
      })
    } catch (error) {
      toast.error({
        title: "Error adding to cart",
        description: "Some variant does not have the required inventory",
      })
    } finally {
      setIsAdding(false)
    }
  }

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    if (value) updateSearchParams(optionId, value)
  }

  return (
    <div className="space-y-6">
      {/* Vendor name */}
      {product.seller && (
        <LocalizedClientLink
          href={`/sellers/${product.seller.handle}`}
          className="inline-block font-sans text-[11px] uppercase tracking-[0.2em] text-[#755b00] hover:text-[#001435] transition-colors font-semibold"
        >
          {product.seller.name}
        </LocalizedClientLink>
      )}

      {/* Product title + subtitle (e.g. artist / maker name). Subtitle is
          optional — rendered subtly below the title only when present. */}
      <div className="space-y-2">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#001435] leading-tight">
          {product.title}
        </h1>
        {product.subtitle && product.subtitle.trim() && (
          <p className="font-serif italic text-lg lg:text-xl text-[#75777f] leading-snug">
            {product.subtitle}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        {hasAnyPrice && variantPrice ? (
          <>
            <span className="font-serif italic text-2xl text-[#001435]">
              {variantPrice.calculated_price}
            </span>
            {variantPrice.calculated_price_number !==
              variantPrice.original_price_number && (
              <span className="font-sans text-base text-[#75777f] line-through">
                {variantPrice.original_price}
              </span>
            )}
          </>
        ) : (
          <span className="font-serif italic text-xl text-[#75777f]">
            Not available in your region
          </span>
        )}
      </div>

      {/* Variant selector — only for real options. Placeholder defaults
          (Shopify "Title"/"Default Title", Medusa "Default option"/"Default
          value") are filtered out so they don't show as a fake choice. */}
      {hasAnyPrice && realOptions.length > 0 && (
        <div className="space-y-4">
          {realOptions.map(
            ({ id, title, values }: HttpTypes.StoreProductOption) => (
              <div key={id}>
                <span className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#75777f] font-semibold">
                  {title}:{" "}
                </span>
                <span className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#001435] font-bold">
                  {selectedVariant[title.toLowerCase()]}
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sortSizeValues(values).map(({ id: valId, value }) => {
                    const isSelected =
                      selectedVariant[title.toLowerCase()] === value
                    const isColor = isColorOption(title)

                    if (isColor) {
                      const fill = resolveSwatchColor(
                        value || "",
                        (product.metadata as Record<string, any> | null)
                          ?.color_hex
                      )
                      return (
                        <button
                          key={valId}
                          onClick={() =>
                            setOptionValue(title.toLowerCase(), value || "")
                          }
                          className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-[#755b00] ring-2 ring-[#755b00]/20"
                              : "border-[#75777f]/30 hover:border-[#75777f]"
                          }`}
                          style={{ backgroundColor: fill }}
                          aria-label={`Select color ${value}`}
                          title={value || "Color option"}
                        />
                      )
                    }

                    return (
                      <button
                        key={valId}
                        onClick={() =>
                          setOptionValue(title.toLowerCase(), value || "")
                        }
                        className={`px-5 py-2.5 rounded-xl font-sans text-sm transition-all duration-200 ${
                          isSelected
                            ? "bg-[#001435] text-white font-semibold"
                            : "border border-[#75777f]/30 text-[#001435] hover:border-[#001435]"
                        }`}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Personalization — shown when the merchant enabled it on this product */}
      {personalizationEnabled && (
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-secondary mb-1">
            {personalizationLabel}
          </label>
          <textarea
            value={personalization}
            onChange={(e) => setPersonalization(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Add your personalization (e.g. name, date, message)…"
            className="w-full border border-[#75777f]/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#BE9B32]"
          />
        </div>
      )}

      {/* Quantity + Add to Cart + Wishlist row */}
      <div className="flex items-center gap-3">
        {/* Quantity selector */}
        <div className="flex items-center border border-[#75777f]/30 rounded-xl overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-12 flex items-center justify-center text-[#001435] hover:bg-[#f4f4f0] transition-colors text-lg"
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <span className="w-10 h-12 flex items-center justify-center text-[#001435] font-sans text-sm font-semibold border-x border-[#75777f]/30">
            {quantity}
          </span>
          <button
            onClick={() =>
              setQuantity((q) =>
                Math.min(Number.isFinite(variantStock) ? variantStock : 99, q + 1)
              )
            }
            className="w-10 h-12 flex items-center justify-center text-[#001435] hover:bg-[#f4f4f0] transition-colors text-lg"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={
            !variantStock || !variantHasPrice || !hasAnyPrice || isAdding
          }
          className="flex-1 h-12 bg-gradient-to-r from-[#D4B043] to-[#9F8129] hover:brightness-110 disabled:bg-none disabled:bg-[#75777f]/30 disabled:text-[#75777f] text-white font-sans text-[11px] font-bold uppercase tracking-widest rounded-full transition-all duration-200 flex items-center justify-center"
        >
          {isAdding ? (
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : !hasAnyPrice ? (
            "Not Available"
          ) : variantStock && variantHasPrice ? (
            "Add to Cart"
          ) : (
            "Out of Stock"
          )}
        </button>

        {/* Wishlist / Heart button */}
        <WishlistButton
          productId={product.id}
          wishlist={wishlist}
          user={user}
        />

        {/* Add to Registry button */}
        <AddToRegistryButton
          product={product}
          variantId={variantId}
          user={user}
          registries={registries || []}
        />

        {/* Share (Brooke 8/11). Sized to sit flush with the wishlist/registry
            icon buttons; shares the PDP's canonical URL (variant params
            dropped by design). */}
        <ShareButton
          title={product.title}
          text={`${product.title} on Catholic Owned`}
          entityType="product"
          entityId={product.id}
          className="relative w-10 h-10 shrink-0 rounded-sm bg-[#f4f4f0] hover:bg-[#e7e7de] text-[#001435] flex items-center justify-center transition-colors"
          iconSize={18}
        />
      </div>

      {/* Refund policy link — only when the vendor has posted one. Sits
          below the Add to Cart row so buyers see it at the purchase-
          decision moment (Amazon/Etsy pattern). */}
      {sellerRefundPolicy && sellerRefundPolicy.trim() && (
        <button
          type="button"
          onClick={() => setShowRefundPolicy(true)}
          className="text-[12px] font-sans text-[#75777f] hover:text-[#001435] underline underline-offset-2 self-start"
        >
          Refund &amp; return policy
        </button>
      )}

      {/* Product highlights */}
      <div className="space-y-4 pt-4 border-t border-[#75777f]/10">
        <ProductHighlight
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#755b00]"
            >
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          title="Vetted Catholic Merchant"
          description="This product is sold by a verified Catholic-owned business."
        />
        <ProductHighlight
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#755b00]"
            >
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          title="Carefully Packaged"
          description="Shipped with care to ensure your order arrives in perfect condition."
        />
      </div>

      {/* Seller message */}
      {user && product.seller && (
        <div className="pt-2">
          <Chat
            user={user}
            seller={product.seller}
            buttonClassNames="w-full uppercase font-sans text-[11px] font-bold tracking-widest border-2 border-[#001435] text-[#001435] hover:bg-[#001435] hover:text-white rounded-xl py-3 transition-all duration-200"
            product={product}
          />
        </div>
      )}

      {/* Refund policy modal. Plain-text content rendered with
          preserved line breaks. Click backdrop or X to close. */}
      {showRefundPolicy && sellerRefundPolicy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowRefundPolicy(false)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="refund-policy-title"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-[#75777f]/20 px-6 py-4">
              <h2
                id="refund-policy-title"
                className="font-serif text-xl font-bold text-[#001435]"
              >
                Refund &amp; return policy
              </h2>
              <button
                type="button"
                onClick={() => setShowRefundPolicy(false)}
                aria-label="Close"
                className="text-[#75777f] hover:text-[#001435] text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-5">
              {product.seller && (
                <p className="font-sans text-xs uppercase tracking-widest text-[#75777f] mb-3">
                  From {product.seller.name}
                </p>
              )}
              <p className="text-[14px] text-[#001435] whitespace-pre-line leading-relaxed">
                {sellerRefundPolicy}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* Product highlight row */
function ProductHighlight({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#755b00]/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="font-sans text-sm font-semibold text-[#001435]">
          {title}
        </h4>
        <p className="font-sans text-xs text-[#75777f] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}
