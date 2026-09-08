"use client"
import { Chip } from "@/components/atoms"
import useFilters from "@/hooks/useFilters"
import { CloseIcon } from "@/icons"
import {
  CATEGORY_PARAM,
  decodeCategoryValue,
} from "@/lib/helpers/category-filter-param"

const filtersLabels = {
  category: "Category",
  brand: "Brand",
  min_price: "Min Price",
  max_price: "Max Price",
  color: "Color",
  size: "Size",
  query: "Search",
  condition: "Condition",
  rating: "Rating",
}

export const ActiveFilterElement = ({ filter }: { filter: string[] }) => {
  const [key, rawValue] = filter
  const { updateFilters } = useFilters(key)

  // Raw, UNTRIMMED tokens. useFilters splits the same param on "," without
  // trimming and removes a value by exact string match, so the token handed to
  // updateFilters has to be byte-identical to the one in the URL — trimming it
  // here would make the match fail and the "remove" silently ADD the trimmed
  // variant instead. That matters for old links, whose fragments can carry a
  // leading space ("Arts, Crafts & Sewing" → "Arts" + " Crafts & Sewing").
  const activeFilters = rawValue.split(",").filter((token) => token.trim())

  // Only the display is normalised: the category param escapes commas inside
  // each name (category-filter-param.ts), so the chip has to unescape to show
  // "Arts, Crafts & Sewing" rather than "Arts%2C Crafts & Sewing". Every other
  // filter is shown as-is.
  const toLabel = (token: string) =>
    key === CATEGORY_PARAM ? decodeCategoryValue(token.trim()) : token

  const removeFilterHandler = (token: string) => {
    updateFilters(token)
  }

  return (
    <div className="flex gap-2 items-center mb-4">
      <span className="label-md hidden md:inline-block">
        {filtersLabels[key as keyof typeof filtersLabels]}:
      </span>
      {activeFilters.map((element) => {
        const Element = () => {
          return (
            <span className="flex gap-2 items-center cursor-default whitespace-nowrap">
              {toLabel(element)}{" "}
              <span onClick={() => removeFilterHandler(element)}>
                <CloseIcon size={16} className="cursor-pointer" />
              </span>
            </span>
          )
        }
        return <Chip key={element} value={<Element />} />
      })}
    </div>
  )
}
