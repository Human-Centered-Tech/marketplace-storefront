"use client"

import { useCallback, useEffect, useRef, useState, type UIEvent } from "react"
import { DirectoryParishAffiliation, Parish } from "@/types/directory"
import {
  addParishAffiliation,
  removeParishAffiliation,
} from "@/lib/data/directory-actions"

// Mirror of the backend's TIER_AFFILIATION_LIMITS map (see
// marketplace-backend/src/api/store/directory/listings/[id]/affiliations/route.ts).
// Used only for UI hints; the backend remains the source of truth and will
// 422 if we get out of sync. Unknown/newer tiers fall back to 1 to match
// the backend's `|| 1` behavior.
const TIER_PARISH_LIMITS: Record<string, number> = {
  verified: 1,
  featured: 3,
  enterprise: 25,
}

// Typeahead page size for the infinite-scroll parish search.
const PARISH_PAGE = 20

const formatParish = (p: Parish) => {
  const loc = [p.city, p.state].filter(Boolean).join(", ")
  const dio = p.diocese || ""
  return { primary: p.name, secondary: [loc, dio].filter(Boolean).join(" · ") }
}

type Props = {
  listingId: string
  // Optional: a listing without a subscription_tier falls back to the
  // 1-affiliation default (matches the backend's `|| 1` and the verified
  // tier limit). Letting tier be optional lets us render the section
  // unconditionally in edit mode regardless of subscription state.
  tier?: string
  initialAffiliations: DirectoryParishAffiliation[]
}

export const ParishAffiliationsSection = ({
  listingId,
  tier,
  initialAffiliations,
}: Props) => {
  const limit = (tier && TIER_PARISH_LIMITS[tier]) || 1
  const [affiliations, setAffiliations] =
    useState<DirectoryParishAffiliation[]>(initialAffiliations)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Parish[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyParishId, setBusyParishId] = useState<string | null>(null)
  // Total matches reported by the backend (COUNT(*) OVER()), and whether a
  // "load more" page fetch is in flight — drives the infinite scroll.
  const [count, setCount] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reqIdRef = useRef(0)
  // Next server offset to request. Tracks rows *received from the server*
  // (incl. any already-affiliated ones filtered from the display), so the
  // offset math stays correct even though we hide affiliated parishes.
  const nextOffsetRef = useRef(0)

  const atCap = affiliations.length >= limit
  const remaining = Math.max(0, limit - affiliations.length)

  // Fetch one page of parishes. `append` distinguishes the first page (replace
  // results) from a scroll-triggered "load more" (append). A request id is
  // bumped on every call so a slower older response — or one for a now-stale
  // query — can never overwrite/append onto a newer one.
  const fetchParishes = useCallback(
    async (trimmed: string, offset: number, append: boolean) => {
      const myReq = ++reqIdRef.current
      if (append) setLoadingMore(true)
      else setSearching(true)
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const url = new URL(`${backendUrl}/store/directory/parishes`)
        url.searchParams.set("q", trimmed)
        url.searchParams.set("limit", String(PARISH_PAGE))
        url.searchParams.set("offset", String(offset))
        const res = await fetch(url.toString(), {
          headers: {
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
        })
        if (!res.ok) throw new Error(`Search failed (${res.status})`)
        const data = (await res.json()) as { parishes: Parish[]; count: number }
        if (myReq !== reqIdRef.current) return
        const affiliatedIds = new Set(affiliations.map((a) => a.parish_id))
        const fresh = data.parishes.filter((p) => !affiliatedIds.has(p.id))
        setCount(data.count ?? 0)
        nextOffsetRef.current = offset + data.parishes.length
        setResults((prev) => (append ? [...prev, ...fresh] : fresh))
      } catch {
        if (myReq === reqIdRef.current && !append) setResults([])
      } finally {
        if (myReq === reqIdRef.current) {
          if (append) setLoadingMore(false)
          else setSearching(false)
        }
      }
    },
    [affiliations]
  )

  // Debounced first-page search on query change. Resets paging state.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (trimmed.length < 2 || atCap) {
      reqIdRef.current++ // invalidate any in-flight fetch
      setResults([])
      setSearching(false)
      setLoadingMore(false)
      setCount(0)
      nextOffsetRef.current = 0
      return
    }

    debounceRef.current = setTimeout(() => {
      nextOffsetRef.current = 0
      fetchParishes(trimmed, 0, false)
    }, 220)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, atCap, fetchParishes])

  // Infinite scroll: when the dropdown nears its bottom and more results exist,
  // pull the next page from the server and append it.
  const handleResultsScroll = (e: UIEvent<HTMLDivElement>) => {
    if (searching || loadingMore) return
    if (nextOffsetRef.current >= count) return
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 64) {
      fetchParishes(query.trim(), nextOffsetRef.current, true)
    }
  }

  const handleAdd = async (parish: Parish) => {
    setError(null)
    setBusyParishId(parish.id)
    // Invalidate any in-flight typeahead fetch so a stale response can't
    // repopulate `results` after we clear it below.
    reqIdRef.current++
    try {
      const res = await addParishAffiliation(listingId, parish.id)
      if (!res.ok) {
        setError(
          /not signed in/i.test(res.error)
            ? "Your session expired. Refresh the page and try again."
            : res.error
        )
        return
      }
      // The backend returns the bare affiliation without the parish
      // relation eagerly loaded; attach it locally so the UI can render
      // city/diocese without a refetch.
      setAffiliations((prev) => [...prev, { ...res.affiliation, parish }])
      setQuery("")
      setResults([])
      setCount(0)
      nextOffsetRef.current = 0
    } finally {
      // try/finally guarantees the spinner clears even on an unexpected
      // throw — otherwise the row would stay disabled and feel frozen.
      setBusyParishId(null)
    }
  }

  const handleRemove = async (affiliationId: string) => {
    setError(null)
    try {
      const res = await removeParishAffiliation(listingId, affiliationId)
      if (!res.ok) {
        setError(
          /not signed in/i.test(res.error)
            ? "Your session expired. Refresh the page and try again."
            : res.error
        )
        return
      }
      setAffiliations((prev) => prev.filter((a) => a.id !== affiliationId))
    } catch (err: any) {
      setError(err?.message || "Failed to remove parish affiliation.")
    }
  }

  return (
    <div>
      <h3 className="heading-sm text-primary mb-3">Parish Affiliations</h3>
      <p className="text-xs text-secondary mb-3">
        Connect your business to a parish so local parishioners can find you.{" "}
        {limit === 1
          ? "Your plan supports 1 parish affiliation."
          : `Your plan supports up to ${limit} parish affiliations.`}{" "}
        <span className="text-primary">
          ({affiliations.length} of {limit} used)
        </span>
      </p>

      {affiliations.length > 0 && (
        <ul className="space-y-2 mb-4">
          {affiliations.map((a) => {
            const fmt = a.parish
              ? formatParish(a.parish)
              : { primary: a.parish_id, secondary: "" }
            return (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 border rounded-sm px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-sm text-primary truncate">
                    {fmt.primary}
                  </div>
                  {fmt.secondary && (
                    <div className="text-xs text-secondary truncate">
                      {fmt.secondary}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(a.id)}
                  className="text-xs uppercase tracking-[0.1em] text-secondary hover:text-red-700 shrink-0"
                  aria-label={`Remove ${fmt.primary}`}
                >
                  Remove
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {atCap ? (
        <div className="text-xs text-secondary border rounded-sm px-3 py-2 bg-[rgba(190,155,50,0.06)]">
          You've reached your plan's limit of {limit} parish affiliation
          {limit === 1 ? "" : "s"}. Remove one to add a different parish, or
          upgrade your plan.
        </div>
      ) : (
        <div className="relative">
          <p className="text-xs text-secondary mb-2">
            Search by parish <span className="text-primary">name</span>,{" "}
            <span className="text-primary">city</span>,{" "}
            <span className="text-primary">ZIP code</span>, or{" "}
            <span className="text-primary">diocese</span>. Combine terms to
            narrow same-named parishes — e.g. “St. Mary Springfield” or “St.
            Mary 62701”.
          </p>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, ZIP, or diocese…"
            className="w-full border rounded-sm px-3 py-2 text-sm"
            autoComplete="off"
          />
          {query.trim().length >= 2 && (
            <div
              className="border rounded-sm mt-1 max-h-72 overflow-y-auto bg-white shadow-sm"
              onScroll={handleResultsScroll}
            >
              {searching && (
                <div className="px-3 py-2 text-xs text-secondary">
                  Searching…
                </div>
              )}
              {!searching && results.length === 0 && (
                <div className="px-3 py-2 text-xs text-secondary">
                  No matching parishes found. Contact support if your parish
                  isn't listed.
                </div>
              )}
              {!searching &&
                results.map((p) => {
                  const fmt = formatParish(p)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAdd(p)}
                      disabled={busyParishId === p.id}
                      className="w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-[rgba(190,155,50,0.06)] disabled:opacity-50"
                    >
                      <div className="text-sm text-primary">{fmt.primary}</div>
                      {fmt.secondary && (
                        <div className="text-xs text-secondary">
                          {fmt.secondary}
                        </div>
                      )}
                    </button>
                  )
                })}
              {!searching && results.length > 0 && (
                <div className="px-3 py-2 text-[11px] text-secondary text-center border-t bg-[#FAF9F5]">
                  {loadingMore
                    ? "Loading more…"
                    : nextOffsetRef.current < count
                      ? `Showing ${results.length} of ${count} — scroll for more`
                      : "All matching parishes shown"}
                </div>
              )}
            </div>
          )}
          {query.trim().length > 0 && query.trim().length < 2 && (
            <div className="text-xs text-secondary mt-1">
              Type at least 2 characters to search.
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-xs text-red-700 mt-2 border border-red-300 rounded-sm px-3 py-2 bg-red-50">
          {error}
        </div>
      )}
    </div>
  )
}
