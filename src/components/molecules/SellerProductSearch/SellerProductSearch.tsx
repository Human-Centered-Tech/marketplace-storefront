"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"

// Seller-scoped product search. Writes the term to ?q= on the current seller
// URL — AlgoliaProductsListing already reads ?q= and ANDs it with the
// seller.handle filter, so results stay within this shop. Resets ?page= on a
// new search. Rendered only on a seller storefront with enough products
// (see AlgoliaProductsListing's threshold).
export function SellerProductSearch({
  initialQuery = "",
  placeholder = "Search this shop's products…",
}: {
  initialQuery?: string
  placeholder?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)

  const navigate = (q: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set("q", q)
    else params.delete("q")
    // A new search starts at page 1.
    params.delete("page")
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(query.trim())
  }

  const onClear = () => {
    setQuery("")
    navigate("")
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-xl mb-6">
      <input
        className="w-full bg-[#f4f4f0] border-none rounded-full py-3.5 pl-6 pr-20 text-[14px] focus:ring-2 focus:ring-[#755b00] transition-all placeholder:text-[#75777f]"
        placeholder={placeholder}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-12 top-1/2 -translate-y-1/2 text-[#75777f] hover:text-[#755b00] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      ) : null}
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#75777f] hover:text-[#755b00] transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  )
}
