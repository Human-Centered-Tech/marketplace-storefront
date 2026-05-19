"use client"

import { useEffect, useRef, useState } from "react"
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
  enterprise: 10,
}

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reqIdRef = useRef(0)

  const atCap = affiliations.length >= limit
  const remaining = Math.max(0, limit - affiliations.length)

  // Debounced typeahead. We bump a request id on each call so a slower
  // older response can't overwrite a faster newer one.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (trimmed.length < 2 || atCap) {
      setResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    const myReq = ++reqIdRef.current

    debounceRef.current = setTimeout(async () => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const url = new URL(`${backendUrl}/store/directory/parishes`)
        url.searchParams.set("q", trimmed)
        url.searchParams.set("limit", "15")
        const res = await fetch(url.toString(), {
          headers: {
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
        })
        if (!res.ok) throw new Error(`Search failed (${res.status})`)
        const data = (await res.json()) as { parishes: Parish[] }
        if (myReq !== reqIdRef.current) return
        const affiliatedIds = new Set(affiliations.map((a) => a.parish_id))
        setResults(data.parishes.filter((p) => !affiliatedIds.has(p.id)))
      } catch {
        if (myReq === reqIdRef.current) setResults([])
      } finally {
        if (myReq === reqIdRef.current) setSearching(false)
      }
    }, 220)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, atCap, affiliations])

  const handleAdd = async (parish: Parish) => {
    setError(null)
    setBusyParishId(parish.id)
    const res = await addParishAffiliation(listingId, parish.id)
    setBusyParishId(null)
    if (!res.ok) {
      setError(res.error)
      return
    }
    // The backend returns the bare affiliation without the parish
    // relation eagerly loaded; attach it locally so the UI can render
    // city/diocese without a refetch.
    setAffiliations((prev) => [
      ...prev,
      { ...res.affiliation, parish },
    ])
    setQuery("")
    setResults([])
  }

  const handleRemove = async (affiliationId: string) => {
    setError(null)
    const res = await removeParishAffiliation(listingId, affiliationId)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setAffiliations((prev) => prev.filter((a) => a.id !== affiliationId))
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
          You've reached your plan's limit of {limit} parish
          affiliation{limit === 1 ? "" : "s"}. Remove one to add a different
          parish, or upgrade your plan.
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by parish name, city, or diocese…"
            className="w-full border rounded-sm px-3 py-2 text-sm"
            autoComplete="off"
          />
          {query.trim().length >= 2 && (
            <div className="border rounded-sm mt-1 max-h-72 overflow-y-auto bg-white shadow-sm">
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
