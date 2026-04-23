import { sdk } from "../config"

export type VendorCollectionSummary = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  slug: string
  image_url: string | null
  product_count: number
}

export type VendorCollectionDetail = {
  collection: {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    slug: string
    image_url: string | null
  }
  products: Array<{
    id: string
    title: string
    handle: string
    thumbnail: string | null
    variants?: Array<{ id: string; calculated_price?: any }>
  }>
  count: number
  offset: number
  limit: number
}

export const listSellerCollections = async (
  handle: string
): Promise<VendorCollectionSummary[]> => {
  try {
    const { collections } = await sdk.client.fetch<{
      collections: VendorCollectionSummary[]
    }>(`/store/sellers/${handle}/collections`, { cache: "no-cache" })
    return collections ?? []
  } catch {
    return []
  }
}

export const getSellerCollection = async (
  handle: string,
  slug: string,
  params: { offset?: number; limit?: number } = {}
): Promise<VendorCollectionDetail | null> => {
  try {
    return await sdk.client.fetch<VendorCollectionDetail>(
      `/store/sellers/${handle}/collections/${slug}`,
      {
        cache: "no-cache",
        query: params as Record<string, any>,
      }
    )
  } catch {
    return null
  }
}
