"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { BarterListing, BarterCategory } from "@/types/barter"
import { listBarterListings } from "@/lib/data/barter"
import { BarterListingCard } from "./BarterListingCard"
import { FilterSelect } from "@/components/molecules/FilterSelect/FilterSelect"

type BarterSearchProps = {
  initialListings: BarterListing[]
  initialCount: number
  categories: BarterCategory[]
}

const PAGE_SIZE = 20

export const BarterSearch = ({
  initialListings,
  initialCount,
  categories,
}: BarterSearchProps) => {
  const [listings, setListings] = useState(initialListings)
  const [count, setCount] = useState(initialCount)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [listingType, setListingType] = useState("")
  const [condition, setCondition] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce the free-text input before it hits the backend.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Explicit submit — the navy "Search" button, or pressing Enter in the field.
  // The debounce above stays as a live-filter convenience; an explicit submit
  // just FLUSHES it so the query runs now instead of after the 300ms idle
  // window. The two never fight — the pending timer resolves to the same value,
  // and setting identical state is a no-op. No search BEHAVIOUR changes here.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDebouncedSearch(search)
    // Dismiss the on-screen keyboard so the results are visible on mobile.
    inputRef.current?.blur()
  }

  // Build the server-side query for a given page. `q`/filters are sent to the
  // backend so search covers the FULL dataset, not just the first page.
  const buildParams = useCallback(
    (pageOffset: number) => ({
      limit: PAGE_SIZE,
      offset: pageOffset,
      ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
      ...(categoryId ? { category_id: categoryId } : {}),
      ...(listingType ? { listing_type: listingType } : {}),
      ...(condition ? { condition } : {}),
    }),
    [debouncedSearch, categoryId, listingType, condition]
  )

  // Re-fetch page 0 whenever the search text or any filter changes. The first
  // run is skipped so the server-rendered initialListings aren't immediately
  // refetched on mount.
  const isFirstRun = useRef(true)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    let cancelled = false
    setLoading(true)
    listBarterListings(buildParams(0))
      .then((res) => {
        if (cancelled) return
        setListings(res.listings || [])
        setCount(res.count || 0)
        setOffset(0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [buildParams])

  // Fetch the next page and append (real pagination — searches/filters carry
  // over so "Load More" pulls the next slice of the matching dataset).
  const loadMore = async () => {
    const nextOffset = offset + PAGE_SIZE
    setLoadingMore(true)
    try {
      const res = await listBarterListings(buildParams(nextOffset))
      setListings((prev) => [...prev, ...(res.listings || [])])
      setCount(res.count || 0)
      setOffset(nextOffset)
    } finally {
      setLoadingMore(false)
    }
  }

  const clearFilters = () => {
    setSearch("")
    setCategoryId("")
    setListingType("")
    setCondition("")
  }

  const hasActiveFilters = search || categoryId || listingType || condition
  const hasMore = listings.length < count

  return (
    <>
      {/* Search & Filter Bar — the standard search bar (SearchBar variant="hero"
          on /categories is canonical): a white floating card, a gray
          magnifying-glass icon inside the field on the left, and a navy
          "Search" button on the right, at the hero's type metrics
          (text-[15px] / py-3) and button shape (px-8 rounded-lg).

          It is a real <form>, so Enter in the field submits. Clear and Filters
          share the right-hand slot with Search: on desktop the three sit side
          by side; on mobile the card stacks and the action row splits its width
          between Clear/Filters and Search so all of them stay tappable. */}
      <section className="px-4 lg:px-8 pt-8 lg:pt-10 relative z-20">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} role="search">
            <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col md:flex-row items-stretch gap-2 border border-gray-100">
              {/* Search input */}
              <div className="flex-[2] flex items-center px-4 md:border-r border-gray-100">
                <span className="material-symbols-outlined text-secondary mr-3">
                  search
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search sacred goods..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 font-sans text-[15px] py-3 outline-none placeholder:text-[#75777f]"
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className="material-symbols-outlined text-secondary/70 hover:text-navy-dark text-[20px] ml-1 shrink-0"
                  >
                    close
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="flex-1 flex items-center px-4 md:border-r border-gray-100">
                <FilterSelect
                  icon="category"
                  placeholder="Category"
                  value={categoryId}
                  onChange={setCategoryId}
                  className="py-3"
                  options={[
                    { value: "", label: "All Categories" },
                    ...categories.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    })),
                  ]}
                />
              </div>

              {/* Listing Type */}
              <div className="flex-1 flex items-center px-4 md:border-r border-gray-100">
                <FilterSelect
                  icon="sell"
                  placeholder="Listing Type"
                  value={listingType}
                  onChange={setListingType}
                  className="py-3"
                  options={[
                    { value: "", label: "All Types" },
                    { value: "sell", label: "Sell" },
                    { value: "trade", label: "Trade" },
                    { value: "free", label: "Free" },
                  ]}
                />
              </div>

              {/* Condition */}
              <div className="flex-1 flex items-center px-4 md:border-r border-gray-100">
                <FilterSelect
                  icon="grade"
                  placeholder="Condition"
                  value={condition}
                  onChange={setCondition}
                  className="py-3"
                  options={[
                    { value: "", label: "Any Condition" },
                    { value: "new", label: "New" },
                    { value: "like_new", label: "Like New" },
                    { value: "good", label: "Good" },
                    { value: "fair", label: "Fair" },
                    { value: "poor", label: "Poor" },
                  ]}
                />
              </div>

              {/* Actions — Clear/Filters, then the navy Search button. Both
                  children are flex-1 while the card is stacked (mobile) and
                  size to content once it becomes a row (md+). */}
              <div className="flex items-stretch gap-2 px-2 shrink-0">
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-gray-200 text-secondary hover:text-navy-dark hover:border-navy-dark/30 px-5 py-3 rounded-lg label-sm text-[10px] font-bold tracking-widest transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">
                      close
                    </span>
                    Clear
                  </button>
                ) : (
                  <div className="flex-1 md:flex-none flex items-center justify-center gap-2 text-secondary px-5 py-3 label-sm text-[10px] font-bold tracking-widest opacity-60">
                    <span className="material-symbols-outlined text-sm">
                      tune
                    </span>
                    Filters
                  </div>
                )}
                <button
                  type="submit"
                  className="flex-1 md:flex-none flex items-center justify-center bg-navy-dark text-white px-8 py-3 rounded-lg label-sm text-[10px] font-bold tracking-widest hover:bg-navy active:scale-95 transition-all shrink-0"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Gold horizontal rule */}
      <div className="max-w-2xl mx-auto py-12 lg:py-16">
        <div className="h-[1px] w-full bg-gold" />
      </div>

      {/* Listings */}
      <section className="px-4 lg:px-8 pb-24 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-12 text-secondary">Searching...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-secondary">
            No listings found. Try adjusting your search.
          </div>
        ) : (
          <>
            {/* Results header */}
            <div className="flex items-baseline justify-between mb-12">
              <h2 className="label-sm font-bold text-secondary tracking-[0.4em] shrink-0">
                Community Listings
              </h2>
              <div className="h-px flex-grow mx-8 bg-gray-200" />
              <span className="font-serif italic text-secondary shrink-0">
                Showing {listings.length} of {count}{" "}
                {count === 1 ? "result" : "results"}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {listings.map((listing) => (
                <BarterListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-20 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-10 py-4 border-b-2 border-gold text-navy-dark label-sm tracking-[0.2em] hover:bg-gold/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
                >
                  {loadingMore ? "Loading…" : "Load More Discoveries"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
