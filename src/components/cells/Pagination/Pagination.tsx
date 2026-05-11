"use client"
import { PaginationButton } from "@/components/atoms"
import { CollapseIcon } from "@/icons"

// Build the page-number sequence Etsy-style:
//   first page is always shown, last page is always shown, ±1 around
//   current is shown, and gaps get rendered as a "…" non-interactive
//   chip. Examples (current = bracketed):
//
//     pages=5,  current=1 → [1] 2 3 4 5
//     pages=12, current=1 → [1] 2 … 12
//     pages=12, current=6 → 1 … 5 [6] 7 … 12
//     pages=12, current=12 → 1 … 11 [12]
const buildPageSequence = (
  current: number,
  pages: number
): (number | "ellipsis-left" | "ellipsis-right")[] => {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, i) => i + 1)
  }
  const out: (number | "ellipsis-left" | "ellipsis-right")[] = []
  out.push(1)
  const windowStart = Math.max(2, current - 1)
  const windowEnd = Math.min(pages - 1, current + 1)
  if (windowStart > 2) out.push("ellipsis-left")
  for (let i = windowStart; i <= windowEnd; i++) out.push(i)
  if (windowEnd < pages - 1) out.push("ellipsis-right")
  out.push(pages)
  return out
}

export const Pagination = ({
  pages,
  setPage,
  currentPage,
}: {
  pages: number
  setPage: (page: number) => void
  currentPage: number
}) => {
  if (pages <= 1) return null

  const sequence = buildPageSequence(currentPage, pages)

  return (
    <div className="flex items-center gap-2">
      <PaginationButton
        disabled={currentPage === 1}
        onClick={() => setPage(currentPage - 1)}
        className="border-none"
        aria-label="Previous page"
      >
        <CollapseIcon size={20} className="rotate-90" />
      </PaginationButton>

      {sequence.map((entry, i) => {
        if (entry === "ellipsis-left" || entry === "ellipsis-right") {
          return (
            <PaginationButton
              key={`${entry}-${i}`}
              disabled
              aria-label="More pages"
            >
              …
            </PaginationButton>
          )
        }
        const isActive = entry === currentPage
        return (
          <PaginationButton
            key={`page-${entry}`}
            isActive={isActive}
            aria-label={
              isActive ? `Current page, page ${entry}` : `Go to page ${entry}`
            }
            aria-current={isActive ? "page" : undefined}
            onClick={isActive ? undefined : () => setPage(entry)}
          >
            {entry}
          </PaginationButton>
        )
      })}

      <PaginationButton
        disabled={currentPage === pages}
        onClick={() => setPage(currentPage + 1)}
        className="border-none"
        aria-label="Next page"
      >
        <CollapseIcon size={20} className="-rotate-90" />
      </PaginationButton>
    </div>
  )
}
