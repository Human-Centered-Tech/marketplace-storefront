"use client"

import { useState, useEffect, useCallback } from "react"
import { BarterListing, BarterCategory } from "@/types/barter"
import { BarterListingCard } from "./BarterListingCard"

type BarterSearchProps = {
  initialListings: BarterListing[]
  initialCount: number
  categories: BarterCategory[]
}

export const BarterSearch = ({
  initialListings,
  initialCount,
  categories,
}: BarterSearchProps) => {
  const [listings, setListings] = useState(initialListings)
  const [count, setCount] = useState(initialCount)
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [listingType, setListingType] = useState("")
  const [condition, setCondition] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (categoryId) params.set("category_id", categoryId)
      if (listingType) params.set("listing_type", listingType)
      if (condition) params.set("condition", condition)

      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const res = await fetch(
        `${backendUrl}/store/barter/listings?${params.toString()}`,
        {
          headers: {
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
        }
      )
      const data = await res.json()
      setListings(data.listings || [])
      setCount(data.count || 0)
    } catch {
      // keep current state
    } finally {
      setLoading(false)
    }
  }, [search, categoryId, listingType, condition])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchListings])

  return (
    <>
      {/* Search & Filter Bar — floats over hero */}
      <section className="px-4 lg:px-8 -mt-10 relative z-20">
        <div className="max-w-6xl mx-auto">
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
                <option value="barter">Barter</option>
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

            {/* Filters button */}
            <div className="md:col-span-2">
              <button className="w-full flex items-center justify-center gap-2 bg-navy-dark text-white py-3 rounded-lg label-sm hover:bg-navy transition-all active:scale-95">
                <span className="material-symbols-outlined text-sm">tune</span>
                Filters
              </button>
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
                Showing {count} {count === 1 ? "result" : "results"}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {listings.map((listing) => (
                <BarterListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Load More */}
            {listings.length < count && (
              <div className="mt-20 text-center">
                <button className="px-10 py-4 border-b-2 border-gold text-navy-dark label-sm tracking-[0.2em] hover:bg-gold/5 transition-all duration-300">
                  Load More Discoveries
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
