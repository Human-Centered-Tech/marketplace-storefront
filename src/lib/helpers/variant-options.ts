// Helpers for hiding meaningless "variant" language on single-variant products.
//
// When a product is created without real options, Medusa/Mercur generates a
// placeholder option ("Default option" / "Default value") and a placeholder
// variant title ("Default variant"); Shopify imports use "Title" / "Default
// Title". None of these represent a real buyer choice, so we hide them from
// customer-facing surfaces (cart, order) — the product page already does the
// same when rendering its option selector.

type VariantOptionLike = {
  id?: string
  option?: { title?: string | null } | null
  value?: string | null
}

const normalize = (value?: string | null) => (value || "").trim().toLowerCase()

// A single variant option (e.g. "Default option: Default value") that carries
// no real choice and should not be shown.
export const isPlaceholderVariantOption = (
  optionTitle?: string | null,
  value?: string | null
) => {
  const title = normalize(optionTitle)
  const val = normalize(value)

  if (title === "default option") return true
  if (title === "title" && (val === "default title" || val === "")) return true
  if (val === "default value" || val === "default title") return true

  return false
}

// Keep only the variant options worth displaying to a buyer.
export const filterRealVariantOptions = <T extends VariantOptionLike>(
  options?: T[] | null
): T[] =>
  (options || []).filter(
    (o) => !isPlaceholderVariantOption(o.option?.title, o.value)
  )

// A placeholder variant title ("Default variant", empty, etc.) that shouldn't
// be rendered as "Variant: …".
export const isPlaceholderVariantTitle = (title?: string | null) => {
  const t = normalize(title)

  return (
    t === "" ||
    t === "default variant" ||
    t === "default title" ||
    t === "default option" ||
    t === "default value"
  )
}
