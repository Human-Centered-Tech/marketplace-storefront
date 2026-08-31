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
import { ProductSortSelect } from "@/components/molecules/ProductSortSelect/ProductSortSelect"
import { useEffect, useRef, useState } from "react"
import { listProducts } from "@/lib/data/products"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { track } from "@/lib/analytics"

// On a seller storefront, show a search box once the shop is large enough to
// warrant it. Based on the seller-scoped Algolia count (nbHits) when no query
// is active, so it reflects the shop's real catalog size.
const SELLER_SEARCH_MIN_PRODUCTS = 75

// How long to wait for the Algolia search to answer before reading the
// catalog from Medusa instead. Normal responses are ~30-200ms, so this only
// trips on a genuine outage or a blocked/failed request.
const SEARCH_TIMEOUT_MS = 6000

// ?sortBy= → Algolia replica index. Sorting in Algolia is done by querying a
// sort replica (configured by the backend's init-algolia on deploy); the
// primary "products" index is the default: relevance + tier rank ("Featured").
// Unknown values fall through to the primary, so a stale URL can't 404 search.
const PRODUCT_SORT_INDEX: Record<string, string> = {
  price_asc: "products_price_asc",
  price_desc: "products_price_desc",
  newest: "products_newest",
  oldest: "products_oldest",
}

export const AlgoliaProductsListing = ({
  category_id,
  collection_id,
  seller_handle,
  seller_id,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
  currency_code,
  owner_preview,
}: {
  category_id?: string
  collection_id?: string
  locale?: string
  seller_handle?: string
  // Same shop as seller_handle, by id — only used when search is unavailable
  // and the catalog is read straight from Medusa, which filters by id.
  seller_id?: string
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

  // NEXT_PUBLIC_RELAX_ALGOLIA_PRODUCT_FILTERS=true is still set on prod and
  // staging (a "transitional" flag from the test-product days). It used to
  // drop EVERY attribution clause below, which is why the shop counted and
  // paged over products it then hid client-side — "Showing 1–48 of 485" with
  // an 11-page pager that only ever yielded 400 products and an empty page 11
  // (qa78-marketplace-pagination). The 85 phantoms were all products of
  // INACTIVE (not-yet-live) sellers, which listProducts' ACTIVE post-filter
  // removes after Algolia has already counted them.
  //
  // The flag now scopes ONLY the supported_countries clause. That one is still
  // unsafe to enforce: the indexer derives supported_countries from variant →
  // inventory item → stock location, so made-to-order products
  // (manage_inventory=false — e.g. the 7/2 Shopify import) get [] and would
  // vanish from the shop even though they add to cart and ship fine. Fix
  // selectSupportedCountries in the backend indexer + reindex before unsetting
  // the flag.
  const relaxFilters =
    process.env.NEXT_PUBLIC_RELAX_ALGOLIA_PRODUCT_FILTERS === "true"

  const clauses: string[] = ["NOT seller:null"]

  // Only ACTIVE stores show. INACTIVE = vendor still in draft (no
  // payment / not gone live yet); SUSPENDED = admin-blocked. The
  // store_status clause is dropped in owner-preview mode so a vendor
  // can see their own draft — the seller_handle scope below keeps it
  // narrowed to just their products.
  if (!owner_preview) {
    clauses.push("seller.store_status:ACTIVE")
    // Vendors that never finished Stripe payout onboarding can't take
    // orders (add-to-cart 400s server-side). The indexer stamps
    // accepts_orders:false on their products; NOT-false (vs :true) keeps
    // records the indexer hasn't restamped yet visible until the full
    // reindex. Owner preview skips this so a vendor mid-onboarding can
    // still see their own catalog.
    clauses.push("NOT accepts_orders:false")
  }
  if (!relaxFilters) {
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

  const sortParam = searchParamas.get("sortBy") || ""
  const indexName = PRODUCT_SORT_INDEX[sortParam] ?? "products"

  return (
    <InstantSearchNext
      // Remount on sort change: InstantSearchNext does not re-root cleanly on
      // an indexName prop change, and the initialUiState key must match the
      // active index anyway.
      key={indexName}
      searchClient={client}
      indexName={indexName}
      // Seed the Algolia page from the URL so a direct load of ?page=2 is
      // server-rendered on the correct slice. uiState `page` is 1-indexed
      // (unlike Configure's 0-indexed `page`), so pass urlPage as-is.
      initialUiState={{ [indexName]: { page: urlPage } }}
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
        seller_id={seller_id}
        category_id={category_id}
        collection_id={collection_id}
        query={query}
      />
    </InstantSearchNext>
  )
}

// Catalog read straight from Medusa, used when the search index doesn't
// answer. No facets, no relevance sort, no pagination — a plain first page of
// the shop/category so browsing still works during a search outage instead of
// showing a skeleton that never resolves.
const CatalogFallbackGrid = ({
  locale,
  seller_id,
  category_id,
  collection_id,
}: {
  locale?: string
  seller_id?: string
  category_id?: string
  collection_id?: string
}) => {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[] | null>(
    null
  )
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    track({
      event_type: "search_unavailable",
      entity_type: seller_id ? "seller" : "product_listing",
      entity_id: seller_id || category_id || collection_id || "all",
      metadata: { timeout_ms: SEARCH_TIMEOUT_MS },
    })

    listProducts({
      countryCode: locale,
      category_id,
      collection_id,
      queryParams: {
        fields:
          "*variants.calculated_price,*seller,-type,-tags,-variants.options,-options",
        limit: PRODUCT_LIMIT,
        ...(seller_id ? ({ seller_id } as any) : {}),
      },
    })
      .then(({ response }) => {
        if (cancelled) return
        setProducts(
          response.products.filter((p) => {
            const { cheapestPrice } = getProductPrice({ product: p })
            return Boolean(cheapestPrice)
          })
        )
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, seller_id, category_id, collection_id])

  if (failed) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-center gap-3 py-16">
        <p className="font-serif text-xl text-primary">
          We couldn&apos;t load these products just now.
        </p>
        <p className="text-secondary text-sm max-w-md">
          This is on our side, not yours. Please refresh in a moment — if it
          keeps happening, tell us at support@catholicowned.com.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 bg-navy-dark text-white px-6 py-3 rounded-lg label-sm text-[10px] font-bold tracking-widest hover:bg-navy transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!products) return <ProductListingSkeleton />

  return (
    <div>
      <p className="text-secondary text-sm mb-6">
        Search is temporarily unavailable, so filters and sorting are turned
        off. Here are products from this shop.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p as any} api_product={p} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="text-secondary text-center py-12">
          No products to show right now.
        </p>
      )}
    </div>
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
  seller_id,
  category_id,
  collection_id,
  query,
}: {
  locale?: string
  currency_code: string
  page: number
  seller_handle?: string
  // Scope for the no-search catalog grid below. seller_handle identifies the
  // shop to Algolia; the Medusa API wants the id, so both are passed.
  seller_id?: string
  category_id?: string
  collection_id?: string
  query?: string
}) => {
  const [apiProducts, setApiProducts] = useState<
    HttpTypes.StoreProduct[] | null
  >(null)
  const [resolveFailed, setResolveFailed] = useState(false)
  const resolveSeq = useRef(0)
  const { items, results } = useHits()

  // Algolia watchdog. `results.processingTimeMS` is the only signal that a
  // search actually came back; react-instantsearch surfaces no error state,
  // so a request that never resolves — an extension or corporate proxy
  // blocking *.algolia.net, a dead network, an index outage — used to sit on
  // the loading skeleton forever with nothing logged and nothing shown.
  const searchAnswered = Boolean(results?.processingTimeMS)
  const [searchUnavailable, setSearchUnavailable] = useState(false)
  useEffect(() => {
    if (searchAnswered) {
      setSearchUnavailable(false)
      return
    }
    const timer = setTimeout(
      () => setSearchUnavailable(true),
      SEARCH_TIMEOUT_MS
    )
    return () => clearTimeout(timer)
  }, [searchAnswered])

  async function handleSetProducts() {
    // Sequence guard: filter changes fire these back-to-back and the
    // responses can land out of order, which would paint an older page's
    // products over the current one.
    const seq = ++resolveSeq.current
    setResolveFailed(false)

    try {
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
      if (seq !== resolveSeq.current) return

      setApiProducts(
        response.products.filter((prod) => {
          const { cheapestPrice } = getProductPrice({ product: prod })
          return Boolean(cheapestPrice) && prod
        })
      )
    } catch (error) {
      if (seq !== resolveSeq.current) return
      // Do NOT null the products here, and do not clear them before the
      // request either: `apiProducts === null` renders as an EMPTY GRID with
      // no message (the grid keeps only hits that also resolved via Medusa).
      // That is what "the marketplace showed nothing after applying filters"
      // was — a slow or failed resolve, silently indistinguishable from
      // "no matches". Keep the previous page visible and say what happened.
      setResolveFailed(true)
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

  if (!searchAnswered) {
    // Search hasn't answered. Show the catalog straight from Medusa rather
    // than an endless skeleton — browsing degrades to "no facets, no
    // relevance sort" instead of breaking.
    return searchUnavailable ? (
      <CatalogFallbackGrid
        locale={locale}
        seller_id={seller_id}
        category_id={category_id}
        collection_id={collection_id}
      />
    ) : (
      <ProductListingSkeleton />
    )
  }

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
      {/*
        The Medusa resolve failed. Previously this rendered as a silently
        empty grid, indistinguishable from "nothing matches your filters".
      */}
      {resolveFailed && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-3"
        >
          <p className="text-sm text-navy-dark">
            We couldn&apos;t load the latest prices and availability, so some
            products may be missing from this view.
          </p>
          <button
            type="button"
            onClick={() => handleSetProducts()}
            className="bg-navy-dark text-white px-5 py-2 rounded-lg label-sm text-[10px] font-bold tracking-widest hover:bg-navy transition-colors shrink-0"
          >
            Try again
          </button>
        </div>
      )}
      <ProductListingHeader
        total={totalHits}
        page={page}
        pageSize={PRODUCT_LIMIT}
      >
        <ProductSortSelect />
      </ProductListingHeader>
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
