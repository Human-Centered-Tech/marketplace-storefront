"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

/**
 * Scroll the window to the top when the ROUTE changes.
 *
 * Reported 25 Sep 2026: several client-side navigations landed the visitor
 * part-way down the new page — the one named was My Parishes → "View All",
 * which opened the directory already scrolled down.
 *
 * Three deliberate constraints, all of them protecting behaviour that is
 * already in the product:
 *
 * 1. It keys off usePathname() only. Search params are NOT in that value, so a
 *    filter or sort change on /categories (AlgoliaProductSidebar pushes
 *    ?category= / ?sortBy= with router.push) does not re-run the effect and
 *    does not yank a browsing shopper back to the top. This is the whole
 *    reason the component reads the pathname rather than useSearchParams.
 *
 * 2. Tab bars are exempt (KEEP_SCROLL_WITHIN). Seller tabs and wishlist tabs
 *    are separate routes rendered as a tab strip, and TabsList passes
 *    scroll={false} on purpose — the visitor is looking at the tab strip when
 *    they tap it, so holding position IS the requested behaviour there
 *    (Matteo/Brooke web polish, "toggle behavior"). Only tab-to-tab inside one
 *    of those pages is exempt; arriving at a seller page from anywhere else
 *    still goes to the top.
 *
 * 3. Back/forward is left alone, so the browser's own scroll restoration keeps
 *    working — pressing Back should return you to where you were, not to the
 *    top of the previous page.
 */

/**
 * Route families whose INTERNAL navigations must keep the scroll position.
 * Each entry matches the shared prefix of one tab group; the match text is
 * compared between the old and new path, so `/us/sellers/foo/reviews` →
 * `/us/sellers/foo/policies` is exempt but `/us/categories` →
 * `/us/sellers/foo` is not. First segment is the locale.
 */
const KEEP_SCROLL_WITHIN: RegExp[] = [
  /^\/[^/]+\/sellers\/[^/]+/,
  /^\/[^/]+\/wishlist/,
]

const sameTabFamily = (from: string, to: string): boolean =>
  KEEP_SCROLL_WITHIN.some((re) => {
    const a = from.match(re)
    const b = to.match(re)
    return !!a && !!b && a[0] === b[0]
  })

export function ScrollToTop() {
  const pathname = usePathname()
  // Previous pathname, so we can tell a real route change from the first
  // render and can compare the two paths.
  const previous = useRef<string | null>(null)
  // Set while a popstate (Back/Forward) is being handled.
  const popped = useRef(false)

  useEffect(() => {
    const onPopState = () => {
      popped.current = true
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  useEffect(() => {
    if (!pathname) return

    const from = previous.current
    previous.current = pathname

    // First render of this session — a fresh load already starts at the top,
    // and a restored one should stay where the browser put it.
    if (from === null) return
    if (from === pathname) return

    if (popped.current) {
      popped.current = false
      return
    }

    if (sameTabFamily(from, pathname)) return

    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
