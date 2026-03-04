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
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-sm px-4 py-2 text-sm"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border rounded-sm px-4 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={listingType}
          onChange={(e) => setListingType(e.target.value)}
          className="border rounded-sm px-4 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="sell">For Sale</option>
          <option value="trade">Trade</option>
          <option value="barter">Barter</option>
          <option value="free">Free</option>
        </select>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="border rounded-sm px-4 py-2 text-sm"
        >
          <option value="">Any Condition</option>
          <option value="new">New</option>
          <option value="like_new">Like New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-secondary">Searching...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 text-secondary">
          No listings found. Try adjusting your search.
        </div>
      ) : (
        <>
          <p className="text-sm text-secondary mb-4">
            {count} {count === 1 ? "listing" : "listings"} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <BarterListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
