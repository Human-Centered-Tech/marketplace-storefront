"use client"

import { HttpTypes } from "@medusajs/types"
import {
  AlgoliaProductSidebar,
  ProductCard,
  ProductListingActiveFilters,
  ProductListingHeader,
  ProductsPagination,
} from "@/components/organisms"
import { client } from "@/lib/client"
import { Configure, useHits, usePagination } from "react-instantsearch"
import { InstantSearchNext } from "react-instantsearch-nextjs"
import { useSearchParams } from "next/navigation"
import { getFacedFilters } from "@/lib/helpers/get-faced-filters"
import { PRODUCT_LIMIT } from "@/const"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { SellerProductSearch } from "@/components/molecules/SellerProductSearch/SellerProductSearch"
import { useEffect, useState } from "react"
import { listProducts } from "@/lib/data/products"
import { getProductPrice } from "@/lib/helpers/get-product-price"

// On a seller storefront, show a search box once the shop is large enough to
// warrant it. Based on the seller-scoped Algolia count (nbHits) when no query
// is active, so it reflects the shop's real catalog size.
const SELLER_SEARCH_MIN_PRODUCTS = 75

export const AlgoliaProductsListing = ({
  category_id,
  collection_id,
  seller_handle,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
  currency_code,
  owner_preview,
}: {
  category_id?: string
  collection_id?: string
  locale?: string
  seller_handle?: string
  currency_code: string
  // Seller previewing their own draft store. Server has already verified
  // ownership; this just drops the store_status filter for that one query.
  owner_preview?: boolean
}) => {
  const searchParamas = useSearchParams()

  const facetFilters: string = getFacedFilters(searchParamas)
  // The SearchBar writes its term to ?q=, matching the rest of the app.
  const query: string = searchParamas.get("q") || ""

  // 1-indexed in our URL (?page=2 = second page). Algolia is 0-indexed,
  // so subtract one before passing to Configure.
  const urlPage = Math.max(1, parseInt(searchParamas.get("page") || "1") || 1)
  const algoliaPage = urlPage - 1

  // Transitional flag — set NEXT_PUBLIC_RELAX_ALGOLIA_PRODUCT_FILTERS=true
  // while we're still working with test products that lack seller assignments
  // and supported_countries data. Drops the per-product attribution filters
  // so the shop renders something instead of an empty list.
  const relaxFilters =
    process.env.NEXT_PUBLIC_RELAX_ALGOLIA_PRODUCT_FILTERS === "true"

  const clauses: string[] = []

  if (!relaxFilters) {
    clauses.push("NOT seller:null")
    // Only ACTIVE stores show. INACTIVE = vendor still in draft (no
    // payment / not gone live yet); SUSPENDED = admin-blocked. The
    // store_status clause is dropped in owner-preview mode so a vendor
    // can see their own draft — the seller_handle scope below keeps it
    // narrowed to just their products.
    if (!owner_preview) {
      clauses.push("seller.store_status:ACTIVE")
    }
    clauses.push(`supported_countries:${locale}`)
  }

  if (seller_handle) clauses.push(`seller.handle:${seller_handle}`)
  if (category_id) clauses.push(`categories.id:${category_id}`)
  if (collection_id !== undefined)
    clauses.push(`collections.id:${collection_id}`)

  // getFacedFilters returns fragments that *start* with " AND ..." since
  // they were designed to be appended after a fixed base filter. When the
  // relax flag is on and no category/seller/collection is selected,
  // baseFilter is empty — leading " AND " then makes Algolia reject the
  // query ("Unexpected token 'AND' expected filter at col 1"). Trim the
  // leading "AND" defensively so we can always concat cleanly.
  const trimmedFacetFilters = facetFilters.replace(/^\s*AND\s+/, "")
  const baseFilter = clauses.join(" AND ")
  const filters = trimmedFacetFilters
    ? baseFilter
      ? `${baseFilter} AND ${trimmedFacetFilters}`
      : trimmedFacetFilters
    : baseFilter

  return (
    <InstantSearchNext
      searchClient={client}
      indexName="products"
      // Seed the Algolia page from the URL so a direct load of ?page=2 is
      // server-rendered on the correct slice. uiState `page` is 1-indexed
      // (unlike Configure's 0-indexed `page`), so pass urlPage as-is.
      initialUiState={{ products: { page: urlPage } }}
    >
      {/*
        Server-side Algolia pagination: hitsPerPage scopes useHits() to
        just the current page. The active page is driven by
        <AlgoliaPageSync> below via the pagination connector's refine(),
        which is the reliable way to control the slice on client-side
        navigation — a `page` prop on <Configure> is overridden by the
        pagination uiState and silently reused the prior page's hits
        (page 2 showing page 1's items).
      */}
      <Configure query={query} filters={filters} hitsPerPage={PRODUCT_LIMIT} />
      <AlgoliaPageSync page={algoliaPage} />
      <ProductsListing
        locale={locale}
        currency_code={currency_code}
        page={urlPage}
        seller_handle={seller_handle}
        query={query}
      />
    </InstantSearchNext>
  )
}

// Drives the Algolia result page from the URL's ?page= param. Uses the
// pagination connector's refine() (0-indexed). Mounting this connector also
// registers the pagination widget, which is what makes the pagination uiState
// (initialUiState + this refine) the authority on the active page — a
// <Configure page> prop alone does not survive that merge.
const AlgoliaPageSync = ({ page }: { page: number }) => {
  const { refine, currentRefinement } = usePagination()

  useEffect(() => {
    if (currentRefinement !== page) {
      refine(page)
    }
  }, [page, currentRefinement, refine])

  return null
}

const ProductsListing = ({
  locale,
  currency_code,
  page,
  seller_handle,
  query,
}: {
  locale?: string
  currency_code: string
  page: number
  seller_handle?: string
  query?: string
}) => {
  const [apiProducts, setApiProducts] = useState<
    HttpTypes.StoreProduct[] | null
  >(null)
  const { items, results } = useHits()

  async function handleSetProducts() {
    try {
      setApiProducts(null)
      if (!items.length) {
        setApiProducts([])
        return
      }
      const { response } = await listProducts({
        countryCode: locale,
        queryParams: {
          // *seller is required: without it, listProducts' ACTIVE-status
          // post-filter sees seller.store_status as null on every product
          // and drops the entire page. *seller.reviews alone expands the
          // reviews relation but does not populate the seller's own columns.
          fields:
            "*variants.calculated_price,*seller,*seller.reviews,-type,-tags,-variants.options,-options,-collection,-collection_id",
          handle: items.map((item) => item.handle),
          limit: items.length,
        },
      })

      setApiProducts(
        response.products.filter((prod) => {
          const { cheapestPrice } = getProductPrice({ product: prod })
          return Boolean(cheapestPrice) && prod
        })
      )
    } catch (error) {
      setApiProducts(null)
    }
  }

  useEffect(() => {
    handleSetProducts()
    // Re-fetch when the visible Algolia hits change (page navigation,
    // filter changes — both update `items`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.objectID).join(",")])

  // Scroll to top whenever the page changes so the next page's grid
  // is visible without a manual scroll. Smooth is nice on desktop; on
  // mobile the gesture is fast enough that smooth feels laggy — leave
  // it as the default scroll behavior on mobile via prefers-reduced.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [page])

  if (!results?.processingTimeMS) return <ProductListingSkeleton />

  const totalHits = results?.nbHits ?? 0
  const pages = Math.max(1, Math.ceil(totalHits / PRODUCT_LIMIT))

  // Seller storefront only: show the in-shop search once the catalog is big
  // enough. Keep it visible whenever a query is active so it doesn't vanish
  // mid-search when the filtered count drops below the threshold (without a
  // query, totalHits is the shop's full catalog size).
  const hasQuery = Boolean(query && query.length > 0)
  const showSellerSearch =
    Boolean(seller_handle) &&
    (hasQuery || totalHits >= SELLER_SEARCH_MIN_PRODUCTS)

  // Algolia has already scoped `items` to the current page. We still
  // filter the in-page list to the products we successfully resolved
  // via the Medusa products API, so cards without a calculated price
  // for the active region drop out (rather than rendering blank).
  const filteredProducts = items.filter((pr) =>
    apiProducts?.some((p: any) => p.id === pr.objectID)
  )

  const products = filteredProducts.filter((pr) =>
    apiProducts?.some(
      (p: any) => p.id === pr.objectID && filterProductsByCurrencyCode(p)
    )
  )

  function filterProductsByCurrencyCode(product: HttpTypes.StoreProduct) {
    const searchParamas = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    )
    const minPrice = searchParamas.get("min_price")
    const maxPrice = searchParamas.get("max_price")

    if ([minPrice, maxPrice].some((price) => typeof price === "string")) {
      const variantsWithCurrencyCode = product?.variants?.filter(
        (variant) => variant.calculated_price?.currency_code === currency_code
      )

      if (!variantsWithCurrencyCode?.length) return false

      if (minPrice && maxPrice) {
        return variantsWithCurrencyCode.some(
          (variant) =>
            (variant.calculated_price?.calculated_amount ?? 0) >= +minPrice &&
            (variant.calculated_price?.calculated_amount ?? 0) <= +maxPrice
        )
      }
      if (minPrice) {
        return variantsWithCurrencyCode.some(
          (variant) =>
            (variant.calculated_price?.calculated_amount ?? 0) >= +minPrice
        )
      }
      if (maxPrice) {
        return variantsWithCurrencyCode.some(
          (variant) =>
            (variant.calculated_price?.calculated_amount ?? 0) <= +maxPrice
        )
      }
    }
    return true
  }

  return (
    <div className="min-h-[70vh]">
      {showSellerSearch && <SellerProductSearch initialQuery={query ?? ""} />}
      <ProductListingHeader
        total={totalHits}
        page={page}
        pageSize={PRODUCT_LIMIT}
      />
      <div className="hidden lg:block">
        <ProductListingActiveFilters />
      </div>
      <div className="lg:flex gap-4">
        <div className="w-full lg:w-[280px] flex-shrink-0">
          <AlgoliaProductSidebar />
        </div>
        <div className="w-full">
          {!items.length ? (
            <div className="text-center w-full my-10">
              <h2 className="uppercase text-primary heading-lg">no results</h2>
              <p className="mt-4 text-lg">
                Sorry, we can&apos;t find any results for your criteria
              </p>
            </div>
          ) : (
            <div className="w-full">
              <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-8 md:gap-x-8 md:gap-y-16">
                {products.map(
                  (hit) =>
                    apiProducts?.find((p: any) => p.id === hit.objectID) && (
                      <li key={hit.objectID}>
                        <ProductCard
                          api_product={apiProducts?.find(
                            (p: any) => p.id === hit.objectID
                          )}
                          product={hit}
                        />
                      </li>
                    )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
      <ProductsPagination pages={pages} />
    </div>
  )
}
