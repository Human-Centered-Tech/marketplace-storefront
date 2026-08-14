"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FilterSelect } from "@/components/molecules/FilterSelect/FilterSelect"

/**
 * Marketplace sort control. Sorting in Algolia = querying a replica index, so
 * the selected value maps to an index name in AlgoliaProductsListing
 * (PRODUCT_SORT_INDEX) — this component only owns the ?sortBy= URL param,
 * matching how the listing already reads q/page. Default ("") is the primary
 * index: relevance + tier ranking ("Featured").
 */
export const PRODUCT_SORT_OPTIONS = [
  { value: "", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
]

export const ProductSortSelect = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const value = searchParams.get("sortBy") ?? ""

  const onChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next) params.set("sortBy", next)
    else params.delete("sortBy")
    // A new sort order restarts from the first page.
    params.delete("page")
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <div className="w-[190px] shrink-0">
      <FilterSelect
        value={value}
        onChange={onChange}
        options={PRODUCT_SORT_OPTIONS}
        placeholder="Sort: Featured"
        ariaLabel="Sort products"
        icon="sort"
        // The header row provides its own vertical rhythm; FilterSelect's
        // filter-bar padding would inflate the row height.
        className="py-0 justify-end"
      />
    </div>
  )
}
