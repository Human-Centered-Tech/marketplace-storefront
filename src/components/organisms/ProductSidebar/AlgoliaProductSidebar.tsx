"use client"

import { Button, Chip, Input, StarRating } from "@/components/atoms"
import { Accordion, FilterCheckboxOption, Modal } from "@/components/molecules"
import useFilters from "@/hooks/useFilters"
import { cn } from "@/lib/utils"
import React, { useEffect, useState } from "react"
import { useRange, useRefinementList } from "react-instantsearch"
import { ProductListingActiveFilters } from "../ProductListingActiveFilters/ProductListingActiveFilters"

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

  useEffect(() => {
    const handleResize = () => {
      // < lg (1024): tablets get the Filters button + modal too — the fixed
      // 280px sidebar ate a third of an iPad-portrait screen (Matteo 7/3).
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize() // set correct state on mount, before any resize fires
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
            <PriceFilter />
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

// Single-handle "up to $X" price slider whose bounds come from the live result
// set. useRange reads facet *stats* (min/max) for `max_price` — which requires
// max_price to be in the index's attributesForFaceting (see algolia-config.json)
// — and InstantSearch computes that range EXCLUDING this filter's own
// refinement, so dragging the handle never collapses the slider's own ceiling
// (no feedback loop). Refining on max_price means "show products whose priciest
// variant is at or below $X"; for the single-price products that dominate the
// catalog that's exactly "price ≤ $X".
// Ceiling for the price slider. The catalog has a long tail of high-priced
// Sacred Art originals ($1k–26k+), which stretched the slider's real max so
// far that the handle had no usable resolution over the sub-$500 band where
// the vast majority of products sit (Brooke 7/6: "cap at a reasonable max").
// The slider now tops out here and the top position means "and up" — no upper
// bound — so those expensive originals are still reachable, they just don't
// wreck the scale for everyone else. Only applied when the real max exceeds it.
const PRICE_SLIDER_CAP = 500

function PriceFilter({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const { start, range, refine, canRefine } = useRange({
    attribute: "max_price",
  })

  const min = Number.isFinite(range.min) ? Math.floor(range.min as number) : 0
  const max = Number.isFinite(range.max) ? Math.ceil(range.max as number) : 0
  // Capped ceiling the slider actually renders to. Reaching it clears the
  // upper bound entirely (shows everything, including products above the cap).
  const sliderMax = Math.min(max, PRICE_SLIDER_CAP)

  // `start` is [lower, upper]; an unset upper bound comes back as Infinity.
  const activeUpper = Number.isFinite(start[1])
    ? Math.min(start[1] as number, sliderMax)
    : sliderMax

  const [value, setValue] = useState<number>(activeUpper)

  // Re-sync when the result set changes the bounds (e.g. switching category)
  // or when the refinement is cleared elsewhere (active-filter chip / reset).
  useEffect(() => {
    setValue(activeUpper)
  }, [activeUpper])

  // No usable range to filter on (no results, or every product is the same
  // price) — hide rather than render a dead, full-width slider.
  if (!canRefine || sliderMax <= min) return null

  const atCeiling = value >= sliderMax
  // "$500+" only when the cap is actually hiding a longer tail; if the real
  // max is at/under the cap, the ceiling is a true max, so no "+".
  const ceilingLabel =
    max > sliderMax ? `$${sliderMax}+` : `$${sliderMax}`

  const commit = () => {
    // At the ceiling = no constraint; clear so the count reflects everything.
    refine(atCeiling ? [undefined, undefined] : [undefined, value])
  }

  // Coarser step on wide ranges so the handle stays usable.
  const step = Math.max(1, Math.round((sliderMax - min) / 50))

  return (
    <Accordion heading="Price" defaultOpen={defaultOpen}>
      <div className="px-4 space-y-4 pb-4">
        <input
          type="range"
          min={min}
          max={sliderMax}
          step={step}
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          aria-label="Maximum price"
          aria-valuetext={atCeiling ? ceilingLabel : `$${value}`}
          className="w-full accent-[#755b00] cursor-pointer"
        />
        <div className="flex justify-between text-xs font-bold text-[#44474e]">
          <span>${min}</span>
          <span>{atCeiling ? ceilingLabel : `$${value}`}</span>
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
