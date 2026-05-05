"use client"

import { HttpTypes } from "@medusajs/types"
import {
  AlgoliaProductSidebar,
  ProductCard,
  ProductListingActiveFilters,
  ProductsPagination,
} from "@/components/organisms"
import { client } from "@/lib/client"
import { Configure, useHits } from "react-instantsearch"
import { InstantSearchNext } from "react-instantsearch-nextjs"
import { useSearchParams } from "next/navigation"
import { getFacedFilters } from "@/lib/helpers/get-faced-filters"
import { PRODUCT_LIMIT } from "@/const"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { useEffect, useState } from "react"
import { listProducts } from "@/lib/data/products"
import { getProductPrice } from "@/lib/helpers/get-product-price"

export const AlgoliaProductsListing = ({
  category_id,
  collection_id,
  seller_handle,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
  currency_code,
}: {
  category_id?: string
  collection_id?: string
  locale?: string
  seller_handle?: string
  currency_code: string
}) => {
  const searchParamas = useSearchParams()

  const facetFilters: string = getFacedFilters(searchParamas)
  // The SearchBar writes its term to ?q=, matching the rest of the app.
  // (Was previously reading ?query=, which nothing sets, so every search
  // landed here as an empty query and returned the unfiltered list.)
  const query: string = searchParamas.get("q") || ""

  // Transitional flag — set NEXT_PUBLIC_RELAX_ALGOLIA_PRODUCT_FILTERS=true
  // while we're still working with test products that lack seller assignments
  // and supported_countries data. Drops the per-product attribution filters
  // so the shop renders something instead of an empty list. Should be
  // removed (or env unset) once all products have proper seller + region
  // setup. Has no effect on category/collection/seller-handle filters,
  // which are explicit user choices.
  const relaxFilters =
    process.env.NEXT_PUBLIC_RELAX_ALGOLIA_PRODUCT_FILTERS === "true"

  const clauses: string[] = []

  // Seller / supported-countries gates (relaxable)
  if (!relaxFilters) {
    clauses.push("NOT seller:null")
    clauses.push("NOT seller.store_status:SUSPENDED")
    clauses.push(`supported_countries:${locale}`)
  }

  // Always-applied filters: vendor storefront, category, collection
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
    <InstantSearchNext searchClient={client} indexName="products">
      <Configure query={query} filters={filters} />
      <ProductsListing
        locale={locale}
        currency_code={currency_code}
        filters={filters}
      />
    </InstantSearchNext>
  )
}

const ProductsListing = ({
  locale,
  currency_code,
  filters,
}: {
  locale?: string
  currency_code: string
  filters: string
}) => {
  const [apiProducts, setApiProducts] = useState<
    HttpTypes.StoreProduct[] | null
  >(null)
  const { items, results } = useHits()

  const searchParamas = useSearchParams()

  async function handleSetProducts() {
    try {
      setApiProducts(null)
      const { response } = await listProducts({
        countryCode: locale,
        queryParams: {
          fields:
            "*variants.calculated_price,*seller.reviews,-thumbnail,-images,-type,-tags,-variants.options,-options,-collection,-collection_id",
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
  }, [items.length])

  if (!results?.processingTimeMS) return <ProductListingSkeleton />

  const page: number = +(searchParamas.get("page") || 1)
  const filteredProducts = items.filter((pr) =>
    apiProducts?.some((p: any) => p.id === pr.objectID)
  )

  const products = filteredProducts
    .filter((pr) =>
      apiProducts?.some(
        (p: any) => p.id === pr.objectID && filterProductsByCurrencyCode(p)
      )
    )
    .slice((page - 1) * PRODUCT_LIMIT, page * PRODUCT_LIMIT)

  const count = filteredProducts?.length || 0
  const pages = Math.ceil(count / PRODUCT_LIMIT) || 1

  function filterProductsByCurrencyCode(product: HttpTypes.StoreProduct) {
    const minPrice = searchParamas.get("min_price")
    const maxPrice = searchParamas.get("max_price")

    if ([minPrice, maxPrice].some((price) => typeof price === "string")) {
      const variantsWithCurrencyCode = product?.variants?.filter(
        (variant) => variant.calculated_price?.currency_code === currency_code
      )

      if (!variantsWithCurrencyCode?.length) {
        return false
      }

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
      <div className="flex justify-between w-full items-center">
        <div className="my-4 label-md">{`${count} listings`}</div>
      </div>
      <div className="hidden md:block">
        <ProductListingActiveFilters />
      </div>
      <div className="md:flex gap-4">
        <div className="w-[280px] flex-shrink-0 hidden md:block">
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
              {/* Grid (instead of flex-wrap) so cards in a row stretch to
                  equal height. Matches the layout used in the non-Algolia
                  ProductListing for the same visual rhythm. */}
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
                {products.map(
                  (hit) =>
                    apiProducts?.find((p: any) => p.id === hit.objectID) && (
                      <ProductCard
                        api_product={apiProducts?.find(
                          (p: any) => p.id === hit.objectID
                        )}
                        key={hit.objectID}
                        product={hit}
                      />
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
