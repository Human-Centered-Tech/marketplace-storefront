"use client"

import { HttpTypes } from "@medusajs/types"
import useGetAllSearchParams from "@/hooks/useGetAllSearchParams"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { useState } from "react"
import { addToCart } from "@/lib/data/cart"
import { Chat } from "@/components/organisms/Chat/Chat"
import { SellerProps } from "@/types/seller"
import { WishlistButton } from "../WishlistButton/WishlistButton"
import { AddToRegistryButton } from "../AddToRegistryButton/AddToRegistryButton"
import { Wishlist } from "@/types/wishlist"
import { GiftRegistry } from "@/types/registry"
import { toast } from "@/lib/helpers/toast"
import { useCartContext } from "@/components/providers"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

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
}: {
  product: HttpTypes.StoreProduct & { seller?: SellerProps }
  locale: string
  user: HttpTypes.StoreCustomer | null
  wishlist?: Wishlist[]
  registries?: GiftRegistry[]
}) => {
  const { onAddToCart, cart } = useCartContext()
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { allSearchParams } = useGetAllSearchParams()
  const updateSearchParams = useUpdateSearchParams()

  const { cheapestVariant, cheapestPrice } = getProductPrice({
    product,
  })

  // Check if product has any valid prices in current region
  const hasAnyPrice = cheapestPrice !== null && cheapestVariant !== null

  // set default variant
  const selectedVariant = hasAnyPrice
    ? {
        ...optionsAsKeymap(cheapestVariant.options ?? null),
        ...allSearchParams,
      }
    : allSearchParams

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

  const variantStock =
    product.variants?.find(({ id }) => id === variantId)?.inventory_quantity ||
    0

  const variantHasPrice = !!product.variants?.find(({ id }) => id === variantId)
    ?.calculated_price

  const isVariantStockMaxLimitReached =
    (cart?.items?.find((item) => item.variant_id === variantId)?.quantity ??
      0) >= variantStock

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!variantId || !hasAnyPrice) return null

    setIsAdding(true)

    const subtotal = +(variantPrice?.calculated_price_without_tax_number || 0)
    const total = +(variantPrice?.calculated_price_number || 0)

    const storeCartLineItem = {
      thumbnail: product.thumbnail || "",
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

      {/* Product title */}
      <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#001435] leading-tight">
        {product.title}
      </h1>

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

      {/* Variant selector */}
      {hasAnyPrice && (
        <div className="space-y-4">
          {(product.options || []).map(
            ({ id, title, values }: HttpTypes.StoreProductOption) => (
              <div key={id}>
                <span className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#75777f] font-semibold">
                  {title}:{" "}
                </span>
                <span className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#001435] font-bold">
                  {selectedVariant[title.toLowerCase()]}
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(values || []).map(({ id: valId, value }) => {
                    const isSelected =
                      selectedVariant[title.toLowerCase()] === value
                    const isColor = title.toLowerCase() === "color"

                    if (isColor) {
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
                          style={{ backgroundColor: value || "#ccc" }}
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
              setQuantity((q) => Math.min(variantStock || 99, q + 1))
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
          className="flex-1 h-12 bg-[#755b00] hover:bg-[#5e4900] disabled:bg-[#75777f]/30 disabled:text-[#75777f] text-white font-sans text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center justify-center"
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
          user={user}
          registries={registries || []}
        />
      </div>

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
          title="Vetted Catholic Vendor"
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
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          title="Support the Faithful"
          description="Every purchase directly supports a Catholic-owned small business."
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
