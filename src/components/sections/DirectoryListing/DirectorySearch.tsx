"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { DirectoryListing, DirectoryCategory } from "@/types/directory"
import { DirectoryListingCard } from "./DirectoryListingCard"

type DirectorySearchProps = {
  initialListings: DirectoryListing[]
  initialCount: number
  categories: DirectoryCategory[]
}

export const DirectorySearch = ({
  initialListings,
  initialCount,
  categories,
}: DirectorySearchProps) => {
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get("q") || ""
  const [listings, setListings] = useState(initialListings)
  const [count, setCount] = useState(initialCount)
  const [search, setSearch] = useState(urlQuery)
  const [categoryId, setCategoryId] = useState("")
  const [state, setState] = useState("")
  const [loading, setLoading] = useState(false)

  // Sync search field when URL query changes (e.g. from header search bar)
  useEffect(() => {
    if (urlQuery && urlQuery !== search) {
      setSearch(urlQuery)
    }
  }, [urlQuery])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (categoryId) params.set("category_id", categoryId)
      if (state) params.set("state", state)
      params.set("verification_status", "approved")

      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const res = await fetch(
        `${backendUrl}/store/directory/listings?${params.toString()}`,
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
  }, [search, categoryId, state])

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
          placeholder="Search businesses..."
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
        <input
          type="text"
          placeholder="State (e.g. TX)"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="border rounded-sm px-4 py-2 text-sm w-32"
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-secondary">Searching...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 text-secondary">
          No businesses found. Try adjusting your search.
        </div>
      ) : (
        <>
          <p className="text-sm text-secondary mb-4">
            {count} {count === 1 ? "business" : "businesses"} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <DirectoryListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
