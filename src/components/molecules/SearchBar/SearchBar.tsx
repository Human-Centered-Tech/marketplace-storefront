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
          className="w-full bg-[#f4f4f0] border-none rounded-full py-[11px] pl-[24px] pr-[48px] text-[14px] focus:ring-2 focus:ring-[#755b00] transition-all placeholder:text-[#75777f]"
          placeholder={placeholder || defaultPlaceholder}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsExpanded(false)
          }}
        />
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

  // Hero variant
  return (
    <form
      onSubmit={handleSearch}
      className="relative max-w-2xl w-full mx-auto px-4"
    >
      <input
        className="w-full bg-white border-none shadow-sm rounded-xl py-5 px-8 pr-16 font-sans text-[15px] focus:ring-2 focus:ring-[#755b00] transition-all placeholder:text-[#75777f]"
        placeholder={placeholder || defaultPlaceholder}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-8 top-1/2 -translate-y-1/2 bg-[#001435] text-white p-3 rounded-lg flex items-center justify-center hover:bg-[#17294a] transition-colors"
      >
        <svg
          aria-hidden="true"
          width="20"
          height="20"
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
    </form>
  )
}
