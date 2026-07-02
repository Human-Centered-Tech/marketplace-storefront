"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useCallback, useRef, useEffect } from "react"
import { GlobalSearchResults } from "./GlobalSearchResults"

export function SearchBar({
  variant = "hero",
  placeholder,
}: {
  variant?: "hero" | "header"
  placeholder?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const defaultPlaceholder = "Search products, businesses, services..."

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const locale = pathname.split("/")[1] || "us"
      const params = new URLSearchParams()
      if (query.trim()) params.set("q", query.trim())
      // Note: products don't have geolocation, so we deliberately do NOT
      // append near_lat/near_lon/radius_km here. Proximity belongs to the
      // directory route only.
      const qs = params.toString()
      router.push(`/${locale}/categories${qs ? `?${qs}` : ""}`)
      setIsExpanded(false)
    },
    [query, pathname, router]
  )

  // Close expanded search on click outside
  useEffect(() => {
    if (!isExpanded) return
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isExpanded])

  if (variant === "header") {
    return (
      <form
        ref={formRef}
        onSubmit={handleSearch}
        className="relative flex items-center w-[400px] xl:w-[640px] 2xl:w-[800px]"
      >
        <input
          ref={inputRef}
          className={`w-full bg-[#f4f4f0] border-none rounded-full py-[11px] pl-[24px] ${
            query ? "pr-[80px]" : "pr-[48px]"
          } text-[14px] focus:ring-2 focus:ring-[#755b00] transition-all placeholder:text-[#75777f]`}
          placeholder={placeholder || defaultPlaceholder}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsExpanded(false)
          }}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            className="absolute right-[52px] top-1/2 -translate-y-1/2 text-[#75777f] hover:text-[#17294a] transition-colors"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-[19px] top-1/2 -translate-y-1/2 text-[#75777f] hover:text-[#755b00] transition-colors"
        >
          <svg
            aria-hidden="true"
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        {isExpanded && (
          <GlobalSearchResults
            query={query}
            onNavigate={() => setIsExpanded(false)}
          />
        )}
      </form>
    )
  }

  // Hero variant — standardized search bar (matches the Directory): a gray
  // magnifying-glass icon inside the input on the left, and a navy "Search"
  // button on the right, housed in a white floating card.
  return (
    <form onSubmit={handleSearch} className="max-w-2xl w-full mx-auto px-4">
      <div className="flex items-stretch gap-2 bg-white border border-gray-100 shadow-lg rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#755b00] transition-all">
        <div className="relative flex-1 flex items-center">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
            search
          </span>
          <input
            ref={inputRef}
            className="w-full bg-transparent border-none focus:ring-0 font-sans text-[15px] py-3 pl-11 pr-9 placeholder:text-[#75777f]"
            placeholder={placeholder || defaultPlaceholder}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("")
                inputRef.current?.focus()
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#75777f] hover:text-[#17294a] transition-colors"
            >
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-navy-dark text-white px-8 rounded-lg label-sm text-[10px] font-bold tracking-widest hover:bg-navy active:scale-95 transition-all shrink-0"
        >
          Search
        </button>
      </div>
    </form>
  )
}
