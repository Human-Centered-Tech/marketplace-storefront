"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Parish } from "@/types/directory"
import { addMyParish, removeMyParish } from "@/lib/data/parish-actions"

/**
 * Client manager for the logged-in user's followed parishes: chip list with
 * remove, plus a typeahead against /store/directory/parishes (same search
 * endpoint + debounce pattern as the listing-edit ParishAffiliationsSection).
 * Mutations run through server actions (httpOnly auth cookie), then
 * router.refresh() re-renders the server-side parish feeds below.
 */

const formatParishSecondary = (p: Parish) => {
  const loc = [p.city, p.state].filter(Boolean).join(", ")
  return [loc, p.diocese || ""].filter(Boolean).join(" · ")
}

export const MyParishesManager = ({
  initialParishes,
  limit,
}: {
  initialParishes: Parish[]
  limit: number
}) => {
  const router = useRouter()
  const [parishes, setParishes] = useState<Parish[]>(initialParishes)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Parish[]>([])
  const [searching, setSearching] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reqIdRef = useRef(0)

  const atCap = parishes.length >= limit

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (trimmed.length < 2 || atCap) {
      reqIdRef.current++
      setResults([])
      setSearching(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      const myReq = ++reqIdRef.current
      setSearching(true)
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const url = new URL(`${backendUrl}/store/directory/parishes`)
        url.searchParams.set("q", trimmed)
        url.searchParams.set("limit", "8")
        const res = await fetch(url.toString(), {
          headers: {
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
        })
        if (!res.ok) throw new Error(`Search failed (${res.status})`)
        const data = (await res.json()) as { parishes: Parish[] }
        if (myReq !== reqIdRef.current) return
        const followed = new Set(parishes.map((p) => p.id))
        setResults((data.parishes || []).filter((p) => !followed.has(p.id)))
      } catch {
        if (myReq === reqIdRef.current) setResults([])
      } finally {
        if (myReq === reqIdRef.current) setSearching(false)
      }
    }, 220)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, atCap, parishes])

  const add = async (parish: Parish) => {
    setBusyId(parish.id)
    setError(null)
    const res = await addMyParish(parish.id)
    setBusyId(null)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setParishes(res.parishes)
    setQuery("")
    setResults([])
    router.refresh()
  }

  const remove = async (parish: Parish) => {
    setBusyId(parish.id)
    setError(null)
    const res = await removeMyParish(parish.id)
    setBusyId(null)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setParishes(res.parishes)
    router.refresh()
  }

  return (
    <div className="rounded-2xl border border-[#BE9B32]/30 bg-white p-6 md:p-8">
      <h2 className="font-serif text-xl font-semibold text-[#001435]">
        Your parishes
      </h2>
      <p className="text-sm text-secondary mt-1">
        Follow the parishes you belong to or love — we&apos;ll gather the
        Catholic businesses, products, and Sacred Exchange listings connected
        to each one below.
      </p>

      {parishes.length > 0 && (
        <ul className="flex flex-wrap gap-2 mt-4">
          {parishes.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-full border border-[#BE9B32]/50 bg-[#faf9f5] pl-4 pr-2 py-1.5"
            >
              <span className="text-sm font-medium text-[#001435]">
                {p.name}
                <span className="text-secondary font-normal">
                  {p.city ? ` · ${p.city}` : ""}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Unfollow ${p.name}`}
                disabled={busyId === p.id}
                onClick={() => remove(p)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-secondary hover:text-[#001435] hover:bg-[#BE9B32]/20 transition-colors disabled:opacity-50"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {!atCap ? (
        <div className="relative mt-4 max-w-xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parishes by name, city, state, or ZIP…"
            className="w-full rounded-xl border border-gray-200 bg-[#faf9f5] px-4 py-3 text-sm text-[#001435] focus:outline-none focus:border-[#BE9B32]"
          />
          {searching && (
            <span className="absolute right-4 top-3.5 text-xs text-secondary">
              Searching…
            </span>
          )}
          {results.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => add(p)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#faf9f5] transition-colors disabled:opacity-50"
                  >
                    <span className="block text-sm font-medium text-[#001435]">
                      {p.name}
                    </span>
                    <span className="block text-xs text-secondary">
                      {formatParishSecondary(p)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-xs text-secondary mt-4">
          You&apos;re following the maximum of {limit} parishes — remove one to
          add another.
        </p>
      )}

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  )
}
