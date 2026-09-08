// The ?category= URL param — the marketplace category filter's source of truth.
//
// WHY THIS FILE EXISTS (and is a leaf module): the write side lives in
// AlgoliaProductSidebar, the read side is needed by AlgoliaProductsListing
// (initialUiState seed) and by the active-filter chips in ActiveFilterElement,
// which is a cell and must not import an organism. One encoder, one decoder,
// one place — a round trip is only lossless if every one of those agrees.
//
// -------------------------------------------------------------------------
// URL key. Deliberately NOT `category_id`, which already exists and means
// something else: it is the SINGLE category id that the no-Algolia server
// route reads (categories/page.tsx → <ProductListing category_id=...>, the bot
// / no-key fallback path). Three reasons not to overload it:
//   * shape — this facet is multi-select, and comma-joining ids into
//     category_id would feed that server route a value it cannot query with;
//   * value — the only category attribute the index can label and count is
//     `categories.name`; ids would render as ids;
//   * `category` is already the app's chip vocabulary for this filter
//     (ActiveFilterElement.filtersLabels), and useFilters("category") gives
//     the chips a working remove handler for free.
// getFacedFilters intentionally maps no clause for `category` — the selection
// is applied as the widget's own facet refinement instead, so the facet's own
// counts stay usable for multi-select. Don't "fix" that by adding a case.
export const CATEGORY_PARAM = "category"

// The indexed attribute those names refine. Exported because
// AlgoliaProductsListing seeds the same refinement in initialUiState.
export const CATEGORY_FACET = "categories.name"

// -------------------------------------------------------------------------
// ENCODING
//
// The app-wide convention for a multi-value filter param is a comma-joined
// list, and useFilters()/useGetAllSearchParams() both split on "," — so the
// separator stays a comma here. The problem the separator alone cannot solve:
// the facet values are human category NAMES, and three of the twenty-three
// live categories contain a comma of their own —
//
//     Arts, Crafts & Sewing
//     Clothing, Shoes & Accessories
//     Coffee, Tea & Beverages
//
// — so ?category=Arts, Crafts & Sewing round-tripped as TWO values, "Arts" and
// "Crafts & Sewing", neither of which is a category: two ticked checkboxes
// that matched nothing and zero results (prod, 9/8).
//
// Fix: percent-escape the separator INSIDE each value before joining, and
// unescape on the way out. `,` → %2C, and `%` → %25 first so the escape is
// injective (a name containing the literal text "%2C" survives too). Note the
// escape is applied to the param VALUE, which URLSearchParams then encodes
// again on serialisation — so the address bar shows %252C for those three
// categories and is untouched for the other twenty.
//
// Why not the alternatives:
//   * repeated params (?category=A&category=B) — a single legacy value that
//     contains a comma is then indistinguishable from a legacy comma-joined
//     pair, so the one case we are fixing (ticking ONE comma category) stays
//     broken, and every reader would have to switch to getAll();
//   * a different separator (| ~ ¦) — same ambiguity: a single new-style value
//     carries no separator, so a comma in it still has to be guessed at, and
//     it forks this filter away from the app-wide convention for nothing.
//
// The escaping approach is the only one that makes the legacy case decidable:
// a NEW-style value never contains a raw comma, therefore a raw comma in the
// param is unambiguously a legacy separator and is split, exactly as before.
const ESCAPED: Record<string, string> = { "%": "%25", ",": "%2C" }

export const encodeCategoryValue = (value: string): string =>
  value.replace(/[%,]/g, (character) => ESCAPED[character])

// Single pass, so "%252C" (an encoded literal "%2C") decodes back to "%2C"
// rather than being unescaped twice into a comma.
export const decodeCategoryValue = (value: string): string =>
  value.replace(/%25|%2C/gi, (token) =>
    token.toLowerCase() === "%2c" ? "," : "%"
  )

// Param value → category names.
//
// Old links keep working: a comma-free list ("Jewelry,Books") is unaffected,
// and an already-corrupted one ("Arts, Crafts & Sewing") still splits into the
// same two values it splits into today. Those values match no category, so
// they filter to nothing — but they are NOT silently re-joined into a real
// category name, and they stay removable (ticked in the sidebar, and always as
// an active-filter chip).
export const splitCategories = (raw: string | null): string[] =>
  raw
    ? Array.from(
        new Set(
          raw
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
            .map(decodeCategoryValue)
        )
      )
    : []

// Category names → param value. null means "drop the param entirely" rather
// than leave it set to "", which would still render an active-filter chip and
// an empty refinement.
export const joinCategories = (values: string[]): string | null =>
  values.length ? values.map(encodeCategoryValue).join(",") : null
