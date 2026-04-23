import { sdk } from "../config"

export type VendorTag = {
  id: string
  value: string
  label: string | null
}

export const listProductVendorTags = async (productId: string) => {
  try {
    const { product_tags } = await sdk.client.fetch<{
      product_tags: VendorTag[]
    }>(`/store/products/${productId}/vendor-tags`, {
      cache: "no-cache",
    })
    return product_tags ?? []
  } catch {
    return []
  }
}

export const listSellerVendorTags = async (handle: string) => {
  try {
    const { product_tags } = await sdk.client.fetch<{
      product_tags: VendorTag[]
    }>(`/store/sellers/${handle}/vendor-tags`, {
      cache: "no-cache",
    })
    return product_tags ?? []
  } catch {
    return []
  }
}
