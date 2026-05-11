/**
 * Etsy-style "Showing X-Y of Z listings" — clarifies pagination state
 * at a glance. Falls back to a simpler "Z listings" when there's only
 * one page worth so the header doesn't get pedantic at small counts.
 */
export const ProductListingHeader = ({
  total,
  page = 1,
  pageSize,
}: {
  total: number
  page?: number
  pageSize?: number
}) => {
  const noun = total === 1 ? "listing" : "listings"

  // Without pageSize, fall back to the legacy "X listings" line.
  if (!pageSize || total <= pageSize) {
    return (
      <div className="flex justify-between w-full items-center mb-6">
        <span className="font-sans text-sm text-[#44474e]">
          {total} {noun}
        </span>
      </div>
    )
  }

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex justify-between w-full items-center mb-6">
      <span className="font-sans text-sm text-[#44474e]">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of{" "}
        {total.toLocaleString()} {noun}
      </span>
    </div>
  )
}
