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
            <PriceFilter
              defaultOpen={Boolean(
                allSearchParams.min_price || allSearchParams.max_price
              )}
            />
            <SizeFilter defaultOpen={Boolean(allSearchParams.size)} />
            {/* Color/Condition hidden until products carry these attributes
                — Algolia returns empty refinement lists today and an empty
                filter section reads as broken. Reinstate when the catalog
                has real values. */}
          </div>
        </Modal>
      )}
    </>
  ) : (
    <div className="space-y-4">
      <PriceFilter />
      <SizeFilter />
    </div>
  )
}

function ConditionFilter({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const { items } = useRefinementList({
    attribute: "variants.condition",
    limit: 100,
    operator: "or",
  })
  const { updateFilters, isFilterActive } = useFilters("condition")

  const selectHandler = (option: string) => {
    updateFilters(option)
  }
  return (
    <Accordion heading="Condition" defaultOpen={defaultOpen}>
      <ul className="px-4">
        {items.map(({ label, count }) => (
          <li key={label} className="mb-4">
            <FilterCheckboxOption
              checked={isFilterActive(label)}
              disabled={Boolean(!count)}
              onCheck={selectHandler}
              label={label}
            />
          </li>
        ))}
      </ul>
    </Accordion>
  )
}

function ColorFilter({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const { items } = useRefinementList({
    attribute: "variants.color",
    limit: 100,
    operator: "and",
    escapeFacetValues: false,
    sortBy: ["isRefined", "count", "name"],
  })
  const { updateFilters, isFilterActive } = useFilters("color")

  const selectHandler = (option: string) => {
    updateFilters(option)
  }
  return (
    <Accordion heading="Color" defaultOpen={defaultOpen}>
      <ul className="px-4">
        {items.map(({ label, count }) => (
          <li key={label} className="mb-4 flex items-center justify-between">
            <FilterCheckboxOption
              checked={isFilterActive(label)}
              disabled={Boolean(!count)}
              onCheck={selectHandler}
              label={label}
            />
            <div
              style={{ backgroundColor: label.toLowerCase() }}
              className={cn(
                "w-5 h-5 border border-primary rounded-xs",
                Boolean(!label) && "opacity-30"
              )}
            />
          </li>
        ))}
      </ul>
    </Accordion>
  )
}

function SizeFilter({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const { items } = useRefinementList({
    attribute: "variants.size",
    limit: 100,
    operator: "or",
  })
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  const selected = searchParams.get("size") || ""

  const selectSizeHandler = (size: string) => {
    // Single-select: clicking the active option clears it; otherwise replaces.
    updateSearchParams("size", selected === size ? "" : size)
  }

  return (
    <Accordion heading="Size" defaultOpen={defaultOpen}>
      <ul className="px-4 mt-1 space-y-2">
        {items.map(({ label, count }) => {
          const checked = selected === label
          const disabled = !count
          return (
            <li key={label}>
              <label
                className={cn(
                  "flex items-center gap-2 cursor-pointer text-sm",
                  disabled && "opacity-50 cursor-default"
                )}
              >
                <input
                  type="radio"
                  name="size-filter"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => selectSizeHandler(label)}
                  className="accent-[#755b00]"
                />
                <span className={cn(checked && "font-semibold")}>{label}</span>
              </label>
            </li>
          )
        })}
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
