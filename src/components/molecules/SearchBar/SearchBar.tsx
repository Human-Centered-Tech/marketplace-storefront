"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useCallback, useRef, useEffect } from "react"

type SearchScope = "products" | "directory"

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
  const [scope, setScope] = useState<SearchScope>("products")
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const defaultPlaceholder =
    scope === "directory"
      ? "Search businesses, electricians, services..."
      : "Search products, rosaries, candles..."

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const locale = pathname.split("/")[1] || "us"
      if (scope === "directory") {
        if (query.trim()) {
          router.push(
            `/${locale}/directory?q=${encodeURIComponent(query.trim())}`
          )
        } else {
          router.push(`/${locale}/directory`)
        }
      } else {
        if (query.trim()) {
          router.push(
            `/${locale}/categories?q=${encodeURIComponent(query.trim())}`
          )
        } else {
          router.push(`/${locale}/categories`)
        }
      }
      setIsExpanded(false)
    },
    [query, pathname, router, scope]
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
        className={`relative hidden lg:flex items-center transition-all duration-300 ${
          isExpanded ? "w-96" : "w-64"
        }`}
      >
        {/* Scope toggle */}
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center z-10">
          <button
            type="button"
            onClick={() =>
              setScope((s) => (s === "products" ? "directory" : "products"))
            }
            className="flex items-center gap-1 bg-white border border-[#75777f]/20 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#001435] hover:border-[#755b00] transition-colors"
            title={`Searching ${scope === "products" ? "Products" : "Directory"} — click to switch`}
          >
            {scope === "directory" ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[#755b00]"
              >
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ) : (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[#755b00]"
              >
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            )}
            {scope === "directory" ? "Biz" : "Shop"}
          </button>
        </div>

        <input
          ref={inputRef}
          className="w-full bg-[#f4f4f0] border-none rounded-full py-2.5 pl-[5.5rem] pr-10 text-sm focus:ring-2 focus:ring-[#755b00] transition-all placeholder:text-[#75777f]"
          placeholder={placeholder || defaultPlaceholder}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
        />

        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#75777f] hover:text-[#755b00] transition-colors"
        >
          <svg
            width="18"
            height="18"
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

  // Hero variant
  return (
    <form
      onSubmit={handleSearch}
      className="relative max-w-2xl w-full mx-auto px-4"
    >
      {/* Scope toggle pills */}
      <div className="flex justify-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setScope("products")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
            scope === "products"
              ? "bg-[#001435] text-white"
              : "bg-white/80 text-[#001435] hover:bg-white"
          }`}
        >
          Products
        </button>
        <button
          type="button"
          onClick={() => setScope("directory")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
            scope === "directory"
              ? "bg-[#001435] text-white"
              : "bg-white/80 text-[#001435] hover:bg-white"
          }`}
        >
          Business Directory
        </button>
      </div>

      <input
        className="w-full bg-white border-none shadow-sm rounded-xl py-5 px-8 pr-16 font-sans text-[15px] focus:ring-2 focus:ring-[#755b00] transition-all placeholder:text-[#75777f]"
        placeholder={placeholder || defaultPlaceholder}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        className="absolute right-8 top-[calc(50%+16px)] -translate-y-1/2 bg-[#001435] text-white p-3 rounded-lg flex items-center justify-center hover:bg-[#17294a] transition-colors"
      >
        <svg
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
