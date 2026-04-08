"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"

export const ProductSidebar = ({
  categories,
  sellers,
}: {
  categories?: HttpTypes.StoreProductCategory[]
  sellers?: { id: string; name: string }[]
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeCategoryId = searchParams.get("category_id") || ""
  const activeSort = searchParams.get("sort") || "created_at"
  const currentMin = searchParams.get("min_price") || ""
  const currentMax = searchParams.get("max_price") || ""

  const [priceRange, setPriceRange] = useState(
    parseInt(currentMax) || 500
  )
  const [selectedSellers, setSelectedSellers] = useState<string[]>(
    searchParams.get("seller_id")?.split(",").filter(Boolean) || []
  )

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const handleCategoryClick = (categoryId: string) => {
    updateParams("category_id", categoryId === activeCategoryId ? "" : categoryId)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams("sort", e.target.value)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    setPriceRange(val)
  }

  const handlePriceCommit = () => {
    updateParams("max_price", priceRange >= 1000 ? "" : String(priceRange))
  }

  const handleSellerToggle = (sellerId: string) => {
    const next = selectedSellers.includes(sellerId)
      ? selectedSellers.filter((s) => s !== sellerId)
      : [...selectedSellers, sellerId]
    setSelectedSellers(next)
    updateParams("seller_id", next.join(","))
  }

  return (
    <aside className="w-full space-y-10">
      {/* Categories */}
      {categories && categories.length > 0 && (
        <div>
          <h3 className="font-sans uppercase tracking-widest text-[11px] font-bold text-[#001435] mb-6">
            Categories
          </h3>
          <ul className="space-y-3 text-sm font-medium">
            <li
              onClick={() => updateParams("category_id", "")}
              className={`flex items-center justify-between cursor-pointer transition-colors ${
                !activeCategoryId
                  ? "text-[#755b00] font-semibold"
                  : "text-[#44474e] hover:text-[#001435]"
              }`}
            >
              <span>All</span>
            </li>
            {categories.map((cat) => (
              <li
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center justify-between cursor-pointer transition-colors ${
                  activeCategoryId === cat.id
                    ? "text-[#755b00] font-semibold"
                    : "text-[#44474e] hover:text-[#001435]"
                }`}
              >
                <span>{cat.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-sans uppercase tracking-widest text-[11px] font-bold text-[#001435] mb-6">
          Price Range
        </h3>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="1000"
            value={priceRange}
            onChange={handlePriceChange}
            onMouseUp={handlePriceCommit}
            onTouchEnd={handlePriceCommit}
            className="w-full accent-[#755b00] cursor-pointer"
          />
          <div className="flex justify-between text-xs font-bold text-[#44474e]">
            <span>$0</span>
            <span>{priceRange >= 1000 ? "$1,000+" : `$${priceRange}`}</span>
          </div>
        </div>
      </div>

      {/* Vendor */}
      {sellers && sellers.length > 0 && (
        <div>
          <h3 className="font-sans uppercase tracking-widest text-[11px] font-bold text-[#001435] mb-6">
            Vendor
          </h3>
          <div className="space-y-3 text-sm">
            {sellers.map((seller) => (
              <label
                key={seller.id}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedSellers.includes(seller.id)}
                  onChange={() => handleSellerToggle(seller.id)}
                  className="rounded border-[#c5c6cf] text-[#755b00] focus:ring-[#755b00]"
                />
                <span className="text-[#44474e] group-hover:text-[#001435] transition-colors">
                  {seller.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sort By */}
      <div>
        <h3 className="font-sans uppercase tracking-widest text-[11px] font-bold text-[#001435] mb-6">
          Sort By
        </h3>
        <select
          value={activeSort}
          onChange={handleSortChange}
          className="w-full bg-[#f4f4f0] border-none rounded-xl text-sm py-3 px-4 focus:ring-2 focus:ring-[#755b00] text-[#001435]"
        >
          <option value="created_at">Newest Arrivals</option>
          <option value="popularity">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </aside>
  )
}
