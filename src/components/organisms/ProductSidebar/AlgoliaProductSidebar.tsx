"use client"

import { Button, Chip, Input, StarRating } from "@/components/atoms"
import { Accordion, FilterCheckboxOption, Modal } from "@/components/molecules"
import useFilters from "@/hooks/useFilters"
import { cn } from "@/lib/utils"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  useInstantSearch,
  useRange,
  useRefinementList,
} from "react-instantsearch"
import { ProductListingActiveFilters } from "../ProductListingActiveFilters/ProductListingActiveFilters"
import {
  CATEGORY_FACET,
  CATEGORY_PARAM,
  joinCategories,
  splitCategories,
} from "@/lib/helpers/category-filter-param"

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

// Writes one filter param into the URL, which is where every filter in this
// sidebar keeps its state (see the CategoryFilter / PriceFilter notes below).
// Pass null to drop the param entirely rather than leave it set to "" — an
// empty value would still render an active-filter chip and, for the category
// facet, an empty refinement list.
const useFilterParam = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useCallback(
    (key: string, value: string | null) => {
      // Nothing actually changed (a track click that lands on the current
      // value, a re-render) — don't push a duplicate history entry.
      if ((searchParams.get(key) || null) === value) return

      const params = new URLSearchParams(searchParams.toString())
      if (value === null) params.delete(key)
      else params.set(key, value)
      // A changed filter restarts from the first page, as the sort control
      // does; otherwise narrowing from page 7 strands you past the last page.
      params.delete("page")
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams]
  )
}

const sameCategories = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value) => b.includes(value))

// Product category refinement. Reads the "categories.name" Algolia facet,
// which is actually populated (unlike the old variants.size/color/condition
// facets — products carry no variants, so those returned empty lists and the
// filters did nothing).
//
// Selection lives in ?category=, not in InstantSearch's in-memory uiState —
// see category-filter-param.ts for the encoding, which escapes the commas that
// three of the live category names contain ("Arts, Crafts & Sewing" and
// friends) so a name can't split in two on the round trip. The widget used to
// call refine() straight from the checkbox, which meant a sort
// change — which remounts the whole InstantSearch root (key={indexName} in
// AlgoliaProductsListing, because a sort is a different replica index) — threw
// the selection away silently: same root cause as the price slider.
//
// The URL is the source of truth, but unlike the price filter it is NOT turned
// into a <Configure filters> clause by getFacedFilters. It is applied by
// mirroring it into this widget's own refinement, because Algolia computes a
// disjunctive facet's counts EXCLUDING that facet's own refinement — a raw
// filter clause is not excluded, so ticking "Books" would zero every other
// category's count and multi-select could never add a second box. Mirroring
// keeps exactly one filter in force (no double filtering) while the counts
// stay usable. The first render is seeded by initialUiState in
// AlgoliaProductsListing so the server-rendered grid already matches the URL;
// the effect here covers every later URL change that does not remount the root
// (a chip removal, back/forward).
function CategoryFilter({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const searchParams = useSearchParams()
  const setFilterParam = useFilterParam()
  const { setIndexUiState } = useInstantSearch()

  const selected = useMemo(
    () => splitCategories(searchParams.get(CATEGORY_PARAM)),
    [searchParams]
  )

  const { items } = useRefinementList({
    attribute: CATEGORY_FACET,
    limit: 100,
    operator: "or",
    sortBy: ["name:asc"],
  })

  useEffect(() => {
    setIndexUiState((previous) => {
      const current = previous.refinementList?.[CATEGORY_FACET] ?? []
      // Returning the previous state unchanged is a no-op for InstantSearch,
      // which is what keeps this from looping against its own update.
      if (sameCategories(current, selected)) return previous

      const refinementList = { ...previous.refinementList }
      if (selected.length) refinementList[CATEGORY_FACET] = selected
      else delete refinementList[CATEGORY_FACET]

      return { ...previous, refinementList }
    })
  }, [selected, setIndexUiState])

  const toggle = (label: string) => {
    const next = selected.includes(label)
      ? selected.filter((value) => value !== label)
      : [...selected, label]
    // joinCategories escapes each name before joining on "," and returns null
    // for an empty selection — the last box unticked drops the param rather
    // than writing "" (which would leave a dangling chip and an empty
    // refinement).
    setFilterParam(CATEGORY_PARAM, joinCategories(next))
  }

  // Nothing to filter on (index has no categories) — hide rather than render an
  // empty box that reads as broken. Never hide while a selection is applied, or
  // the user loses the only control that can undo it.
  if (!items.length && !selected.length) return null

  // A selected category can legitimately count 0 once another filter is layered
  // on top (a price range that excludes all of it). Keep those boxes live, or
  // the user can't untick their own selection.
  //
  // A value in the URL that is NOT a real category — the "Arts" / "Crafts &
  // Sewing" halves an old, comma-corrupted link splits into — is a row here
  // too: algoliasearch-helper injects any refined value the index didn't
  // return back into the facet data at count 0 (SearchResults, "add the
  // disjunctive refinements if it is no more retrieved"). That is
  // indistinguishable from a real category the other filters emptied out, so
  // the two are treated the same: never disabled while checked, so one click
  // removes it. Anything that somehow isn't in `items` at all (the first
  // render before a search resolves, a facet outage) is still removable from
  // the active-filter chips, which are driven straight off the URL.
  return (
    <Accordion heading="Category" defaultOpen={defaultOpen}>
      <ul className="px-4">
        {items.map(({ label, count }) => {
          const checked = selected.includes(label)
          return (
            <li key={label} className="mb-4">
              <FilterCheckboxOption
                checked={checked}
                disabled={!count && !checked}
                onCheck={toggle}
                label={label}
                amount={count}
              />
            </li>
          )
        })}
      </ul>
    </Accordion>
  )
}

// Single-handle "up to $X" price slider whose bounds come from the live result
// set. useRange reads facet *stats* (min/max) for `max_price` — which requires
// max_price to be in the index's attributesForFaceting (see algolia-config.json).
//
// The slider does NOT hold its own refinement. ?min_price / ?max_price in the
// URL are the source of truth: getFacedFilters turns them into Algolia filter
// clauses that AlgoliaProductsListing passes to <Configure>, the active-filter
// chips read and clear them, and they survive navigation. The widget used to
// call useRange's refine() instead, which lives only in InstantSearch's
// in-memory uiState — so a sort change, which remounts the whole InstantSearch
// root (key={indexName} in AlgoliaProductsListing, needed because a sort is a
// different replica index), threw the refinement away and re-initialised the
// handle at the ceiling while the URL kept the grid filtered. That is the
// "price filter resets on sort" report (Matteo 8/31): the control was lying,
// not the filtering. Reading and writing the URL makes both survive a remount.
//
// Ceiling for the price slider. The catalog has a long tail of high-priced
// Sacred Art originals ($1k–26k+), which stretched the slider's real max so
// far that the handle had no usable resolution over the sub-$500 band where
// the vast majority of products sit (Brooke 7/6: "cap at a reasonable max").
// The slider now tops out here and the top position means "and up" — no upper
// bound — so those expensive originals are still reachable, they just don't
// wreck the scale for everyone else. Only applied when the real max exceeds it.
const PRICE_SLIDER_CAP = 500

// A price URL param is only usable if it parses to a finite, non-negative
// number. Anything else (empty, "abc", a stale "NaN") is treated as absent —
// which is also how getFacedFilters treats it, so control and grid agree.
const parsePriceParam = (raw: string | null): number | undefined => {
  if (!raw) return undefined
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 0) return undefined
  return parsed
}

function PriceFilter({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const searchParams = useSearchParams()
  const setFilterParam = useFilterParam()

  const { range, canRefine } = useRange({
    attribute: "max_price",
  })

  const urlMin = parsePriceParam(searchParams.get("min_price"))
  const urlMax = parsePriceParam(searchParams.get("max_price"))

  const statsMin = Number.isFinite(range.min)
    ? Math.floor(range.min as number)
    : 0
  const statsMax = Number.isFinite(range.max)
    ? Math.ceil(range.max as number)
    : 0

  // Track floor. With ?min_price set, the facet stats are already bounded by
  // it, but read the URL directly so the left-hand label is exactly the filter
  // in force rather than whatever the cheapest matching product happens to be.
  const sliderMin = urlMin ?? statsMin

  // Capped ceiling the slider actually renders to. Reaching it clears the
  // upper bound entirely (shows everything, including products above the cap).
  //
  // The URL price clauses go into <Configure filters>, which Algolia applies
  // to facet stats too (unlike a widget's own refinement, which it excludes).
  // So once ?max_price is set, statsMax collapses to roughly that value and
  // can no longer tell us the catalog's real ceiling — using it would pin the
  // handle to the far right with nowhere to drag back to, i.e. a one-way
  // filter. Fall back to the product cap (widened if the URL asks for more).
  // On a catalog whose real ceiling is under the cap (a small seller store)
  // that shows more headroom than the catalog has while a max is applied; the
  // trade is deliberate, since the alternative is a handle stuck at the right
  // edge on a filter that can then only ever be tightened.
  const sliderMax =
    urlMax === undefined
      ? Math.min(statsMax, PRICE_SLIDER_CAP)
      : Math.max(PRICE_SLIDER_CAP, Math.ceil(urlMax))

  // No max in the URL = no upper bound = handle at the ceiling. A max at or
  // above the ceiling is the same thing; anything below is a real constraint
  // the handle must show. Clamped into the track so it can always be dragged.
  const activeUpper =
    urlMax === undefined
      ? sliderMax
      : Math.min(Math.max(Math.round(urlMax), sliderMin), sliderMax)

  const [value, setValue] = useState<number>(activeUpper)

  // Re-sync when the URL changes (direct load, back/forward, active-filter
  // chip, reset) or when the result set changes the bounds (e.g. switching
  // category). Also covers the post-sort remount, where this runs fresh.
  useEffect(() => {
    setValue(activeUpper)
  }, [activeUpper])

  // No usable range to filter on (no results, or every product is the same
  // price) — hide rather than render a dead, full-width slider. Never hide
  // while a price filter is actually applied, or the user would lose the only
  // control that can widen it again.
  const hasUrlPrice = urlMin !== undefined || urlMax !== undefined
  if (!hasUrlPrice && !canRefine) return null
  if (sliderMax <= sliderMin) return null

  const atCeiling = value >= sliderMax
  // "$500+" only when the cap is actually hiding a longer tail; if the real
  // max is at/under the cap, the ceiling is a true max, so no "+". With a URL
  // max applied the stats can't answer that (see sliderMax above), so assume
  // the cap is hiding a tail whenever the track tops out at exactly the cap.
  const ceilingHidesTail =
    urlMax === undefined ? statsMax > sliderMax : sliderMax === PRICE_SLIDER_CAP
  const ceilingLabel = ceilingHidesTail ? `$${sliderMax}+` : `$${sliderMax}`

  const commit = () => {
    // At the ceiling = no constraint; clear so the count reflects everything.
    setFilterParam("max_price", atCeiling ? null : String(value))
  }

  // Coarser step on wide ranges so the handle stays usable.
  const step = Math.max(1, Math.round((sliderMax - sliderMin) / 50))

  return (
    <Accordion heading="Price" defaultOpen={defaultOpen}>
      <div className="px-4 space-y-4 pb-4">
        <input
          type="range"
          min={sliderMin}
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
          <span>${sliderMin}</span>
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
