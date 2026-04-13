"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useCallback, useRef, useEffect } from "react"

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
      if (query.trim()) {
        router.push(
          `/${locale}/categories?q=${encodeURIComponent(query.trim())}`
        )
      } else {
        router.push(`/${locale}/categories`)
      }
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
        className="relative flex items-center w-full max-w-2xl"
      >
        <input
          ref={inputRef}
          className="w-full bg-[#f4f4f0] border-none rounded-full py-3 pl-5 pr-12 text-sm focus:ring-2 focus:ring-[#755b00] transition-all placeholder:text-[#75777f]"
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
      <input
        className="w-full bg-white border-none shadow-sm rounded-xl py-5 px-8 pr-16 font-sans text-[15px] focus:ring-2 focus:ring-[#755b00] transition-all placeholder:text-[#75777f]"
        placeholder={placeholder || defaultPlaceholder}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        className="absolute right-8 top-1/2 -translate-y-1/2 bg-[#001435] text-white p-3 rounded-lg flex items-center justify-center hover:bg-[#17294a] transition-colors"
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
