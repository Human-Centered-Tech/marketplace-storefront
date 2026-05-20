"use server"

import { sdk } from "../config"
import { sortProducts } from "@/lib/helpers/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@/types/product"
import { getAuthHeaders } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { SellerProps } from "@/types/seller"

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
  category_id,
  collection_id,
  forceCache = false,
  // When true, keeps products whose seller is INACTIVE/SUSPENDED in the
  // returned list. Callers must verify ownership before passing this —
  // it's intended for "preview my draft store" flows, not general use.
  ownerPreview = false,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams &
    HttpTypes.StoreProductParams & {
      handle?: string[]
    }
  category_id?: string
  collection_id?: string
  countryCode?: string
  regionId?: string
  forceCache?: boolean
  ownerPreview?: boolean
}): Promise<{
  response: {
    products: (HttpTypes.StoreProduct & { seller?: SellerProps })[]
    count: number
  }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  // TEMP DEBUG (revert): trace empty-categories root cause on staging.
  if (process.env.DEBUG_LIST_PRODUCTS === "true") {
    console.error(
      `[listProducts.debug] countryCode=${countryCode} regionId=${regionId} region=${region?.id ?? "<null>"} handles=${JSON.stringify(queryParams?.handle ?? null)} limit=${limit}`
    )
  }

  if (!region) {
    if (process.env.DEBUG_LIST_PRODUCTS === "true") {
      console.error(`[listProducts.debug] BAIL: region undefined for countryCode=${countryCode}`)
    }
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const useCached = forceCache || (limit <= 8 && !category_id && !collection_id)

  return sdk.client
    .fetch<{
      products: (HttpTypes.StoreProduct & { seller?: SellerProps })[]
      count: number
    }>(`/store/products`, {
      method: "GET",
      query: {
        country_code: countryCode,
        category_id,
        collection_id,
        limit,
        offset,
        region_id: region?.id,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,*seller,*variants,*seller.products," +
          "*seller.reviews,*seller.reviews.customer,*seller.reviews.seller,*seller.products.variants,*attribute_values,*attribute_values.attribute",
        ...queryParams,
      },
      headers,
      next: useCached ? { revalidate: 60 } : undefined,
      cache: useCached ? "force-cache" : "no-cache",
    })
    .then(({ products: productsRaw, count }) => {
      if (process.env.DEBUG_LIST_PRODUCTS === "true") {
        console.error(
          `[listProducts.debug] medusa returned raw=${productsRaw.length} count=${count}: ${JSON.stringify(productsRaw.map((p: any) => ({ handle: p.handle, sellerStatus: p.seller?.store_status ?? null })))}`
        )
      }
      // Only ACTIVE stores are visible to shoppers. INACTIVE = draft mode
      // (vendor hasn't paid / hit Go Live yet); SUSPENDED = admin-blocked.
      // ownerPreview is set by the seller-preview path after the page has
      // verified the requester is the seller themselves.
      const products = ownerPreview
        ? productsRaw
        : productsRaw.filter(
            (product) => product.seller?.store_status === "ACTIVE"
          )
      if (process.env.DEBUG_LIST_PRODUCTS === "true") {
        console.error(`[listProducts.debug] after ACTIVE filter: ${products.length}`)
      }

      const nextPage = count > offset + limit ? pageParam + 1 : null

      const response = products.map((prod) => {
        // @ts-ignore Property 'seller' exists but TypeScript doesn't recognize it
        const reviews = prod.seller?.reviews?.filter((item) => !!item) ?? []
        if (!prod?.seller) return prod
        return {
          ...prod,
          seller: {
            // @ts-ignore Property 'seller' exists but TypeScript doesn't recognize it
            ...prod.seller,
            reviews,
          },
        }
      })

      return {
        response: {
          products: response,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
    .catch((err) => {
      if (process.env.DEBUG_LIST_PRODUCTS === "true") {
        console.error(`[listProducts.debug] CAUGHT ERROR: ${err?.message ?? err}`, err)
      }
      return {
        response: {
          products: [],
          count: 0,
        },
        nextPage: 0,
        queryParams,
      }
    })
}

// Maps our SortOptions enum to Medusa /store/products `order` param syntax.
// Medusa 2.x supports sorting on stored columns (created_at, title, ...)
// but 500s on nested computed paths like variants.calculated_price.*
// because calculated_price is region-derived, not a column. For price
// sorts we therefore return undefined and rely on the client-side
// sortProducts fallback below — meaning price sort is page-local only.
// Cross-page price sort needs Algolia (which has price replicas) or a
// dedicated backend endpoint; tracked as a follow-up.
const sortToOrder = (sortBy: SortOptions): string | undefined => {
  switch (sortBy) {
    case "created_at":
      return "-created_at"
    case "price_asc":
    case "price_desc":
      return undefined
    default:
      return "-created_at"
  }
}

/**
 * Server-paginated product listing. Pass `page` (1-indexed) and the
 * function asks the backend for just that page's slice — no more
 * silent 100-item cap. Returns the backend's true total `count` so
 * pagination UIs can render the correct number of pages.
 *
 * Sort is applied server-side via the `order` query param. The
 * client-side `sortProducts` fallback only runs as a safety net for
 * the in-page slice.
 */
export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
  category_id,
  seller_id,
  collection_id,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
  category_id?: string
  seller_id?: string
  collection_id?: string
}): Promise<{
  response: {
    products: HttpTypes.StoreProduct[]
    count: number
  }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit ?? 48
  const offset = Math.max(0, (page - 1) * limit)
  const order = queryParams?.order ?? sortToOrder(sortBy)

  // seller_id is a client-side filter today (no backend filter on
  // product.seller.id in Mercur's /store/products). Without true
  // server-side filtering, total `count` for a single-seller view is
  // approximate. Use the calling page's filter on a per-page basis;
  // accept the limitation that filtered pagination can be off by
  // a page near the end. SellerTabs uses seller_handle through Algolia
  // for the accurate path.
  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit,
      offset,
      ...(order ? { order } : {}),
    },
    category_id,
    collection_id,
    countryCode,
  })

  const filteredProducts = seller_id
    ? products.filter((product) => product.seller?.id === seller_id)
    : products

  // Hide products without a calculated price for the active region.
  // Filtering after server pagination means the page might be short
  // (e.g. 47/48 cards if one variant lacks a price) — acceptable
  // tradeoff vs the prior silent 100 cap.
  const pricedProducts = filteredProducts.filter((prod) =>
    prod.variants?.some((variant) => variant.calculated_price !== null)
  )

  // Backend already sorted. sortProducts is a defensive client-side
  // re-sort of the page slice so callers passing unusual sortBy don't
  // see backend-default order leaking through.
  const sortedProducts = sortProducts(pricedProducts, sortBy)

  const nextPage = offset + limit < count ? offset + limit : null

  return {
    response: {
      products: sortedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}
