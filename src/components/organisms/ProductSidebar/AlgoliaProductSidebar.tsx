"use client"

import { Button, Chip, Input, StarRating } from "@/components/atoms"
import { Accordion, FilterCheckboxOption, Modal } from "@/components/molecules"
import useFilters from "@/hooks/useFilters"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useRefinementList } from "react-instantsearch"
import { ProductListingActiveFilters } from "../ProductListingActiveFilters/ProductListingActiveFilters"
import useGetAllSearchParams from "@/hooks/useGetAllSearchParams"

const filters = [
  { label: "5", amount: 40 },
  { label: "4", amount: 78 },
  { label: "3", amount: 0 },
  { label: "2", amount: 0 },
  { label: "1", amount: 0 },
]

export const AlgoliaProductSidebar = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const { allSearchParams } = useGetAllSearchParams()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile ? (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full uppercase mb-4">
        Filters
      </Button>
      {isOpen && (
        <Modal heading="Filters" onClose={() => setIsOpen(false)}>
          <div className="px-4 space-y-4">
            <ProductListingActiveFilters />
            <CategoryFilter />
            <PriceFilter
              defaultOpen={Boolean(
                allSearchParams.min_price || allSearchParams.max_price
              )}
            />
          </div>
        </Modal>
      )}
    </>
  ) : (
    <div className="space-y-4">
      <CategoryFilter />
      <PriceFilter />
    </div>
  )
}

// Product category refinement. Reads the "categories.name" Algolia facet,
// which is actually populated (unlike the old variants.size/color/condition
// facets — products carry no variants, so those returned empty lists and the
// filters did nothing). useRefinementList applies the refinement directly to
// the same InstantSearch query the listing renders from, so no extra wiring is
// needed. Hidden entirely when the index has no categories so an empty box
// never reads as broken.
function CategoryFilter({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const { items, refine } = useRefinementList({
    attribute: "categories.name",
    limit: 100,
    operator: "or",
    sortBy: ["name:asc"],
  })

  if (!items.length) return null

  return (
    <Accordion heading="Category" defaultOpen={defaultOpen}>
      <ul className="px-4">
        {items.map(({ label, count, isRefined }) => (
          <li key={label} className="mb-4">
            <FilterCheckboxOption
              checked={isRefined}
              disabled={Boolean(!count)}
              onCheck={refine}
              label={label}
              amount={count}
            />
          </li>
        ))}
      </ul>
    </Accordion>
  )
}

// Hardcoded for now — when variants.prices.amount is added to the index's
// attributesForFaceting, swap to useRange({ attribute: "variants.prices.amount" })
// to auto-scale these from real catalog data. Catalog max today is ~$499.
const PRICE_MIN = 0
const PRICE_MAX = 500

function PriceFilter({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()

  // Slider value tracks the *max* — minimum is always $0. Matches the
  // single-handle pattern from the non-Algolia ProductSidebar.
  const initial = parseInt(searchParams.get("max_price") || "") || PRICE_MAX
  const [value, setValue] = useState<number>(initial)

  useEffect(() => {
    const v = parseInt(searchParams.get("max_price") || "")
    setValue(Number.isFinite(v) && v > 0 ? v : PRICE_MAX)
  }, [searchParams])

  const commit = () => {
    // No filter when slider is at the cap; otherwise persist max_price.
    updateSearchParams("max_price", value >= PRICE_MAX ? "" : String(value))
  }

  return (
    <Accordion heading="Price" defaultOpen={defaultOpen}>
      <div className="px-4 space-y-4 pb-4">
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={5}
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          aria-label="Maximum price"
          aria-valuetext={value >= PRICE_MAX ? `$${PRICE_MAX}+` : `$${value}`}
          className="w-full accent-[#755b00] cursor-pointer"
        />
        <div className="flex justify-between text-xs font-bold text-[#44474e]">
          <span>${PRICE_MIN}</span>
          <span>{value >= PRICE_MAX ? `$${PRICE_MAX}+` : `$${value}`}</span>
        </div>
      </div>
    </Accordion>
  )
}

function RatingFilter() {
  const { updateFilters, isFilterActive } = useFilters("rating")

  const selectHandler = (option: string) => {
    updateFilters(option)
  }

  return (
    <Accordion heading="Rating">
      <ul className="px-4">
        {filters.map(({ label }) => (
          <li
            key={label}
            className={cn("mb-4 flex items-center gap-2 cursor-pointer")}
            onClick={() => selectHandler(label)}
          >
            <FilterCheckboxOption
              checked={isFilterActive(label)}
              label={label}
            />
            <StarRating rate={+label} />
          </li>
        ))}
      </ul>
    </Accordion>
  )
}
