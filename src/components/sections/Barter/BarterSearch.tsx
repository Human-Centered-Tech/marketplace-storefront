"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { BarterListing, BarterCategory } from "@/types/barter"
import { listBarterListings } from "@/lib/data/barter"
import { BarterListingCard } from "./BarterListingCard"

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

  // Debounce the free-text input before it hits the backend.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

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
      {/* Search & Filter Bar — sits below the flat hero, aligned to the other
          page bodies (max-w-7xl) rather than floating over a banner image. */}
      <section className="px-4 lg:px-8 pt-8 lg:pt-10 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search input */}
            <div className="md:col-span-4 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Search sacred goods..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-transparent border-b border-gold-light focus:border-navy-dark focus:ring-0 font-serif text-lg transition-all outline-none"
              />
            </div>

            {/* Category */}
            <div className="md:col-span-2">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-transparent border-b border-gold-light focus:border-navy-dark focus:ring-0 label-sm py-3 appearance-none cursor-pointer"
              >
                <option value="">Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Listing Type */}
            <div className="md:col-span-2">
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="w-full bg-transparent border-b border-gold-light focus:border-navy-dark focus:ring-0 label-sm py-3 appearance-none cursor-pointer"
              >
                <option value="">Listing Type</option>
                <option value="sell">Sell</option>
                <option value="trade">Trade</option>
                <option value="free">Free</option>
              </select>
            </div>

            {/* Condition */}
            <div className="md:col-span-2">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-transparent border-b border-gold-light focus:border-navy-dark focus:ring-0 label-sm py-3 appearance-none cursor-pointer"
              >
                <option value="">Condition</option>
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Clear filters button */}
            <div className="md:col-span-2">
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-2 bg-navy-dark text-white py-3 rounded-lg label-sm hover:bg-navy transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  Clear
                </button>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 bg-navy-dark text-white py-3 rounded-lg label-sm hover:bg-navy transition-all active:scale-95 opacity-60 cursor-default">
                  <span className="material-symbols-outlined text-sm">tune</span>
                  Filters
                </button>
              )}
            </div>
          </div>
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
