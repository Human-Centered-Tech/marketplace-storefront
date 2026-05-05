"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserLocation } from "@/hooks/useUserLocation"

const DISMISS_KEY = "location_prompt_dismissed"

export function LocationPrompt({
  className = "",
}: {
  className?: string
}) {
  const router = useRouter()
  const { location, status, hydrated, request, setFromZip } = useUserLocation()
  const [dismissed, setDismissed] = useState(true)
  const [showZip, setShowZip] = useState(false)
  const [zip, setZip] = useState("")
  const [zipError, setZipError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1")
  }, [])

  if (!hydrated || dismissed || location) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1")
    setDismissed(true)
  }

  const handleAllow = async () => {
    setBusy(true)
    const result = await request()
    setBusy(false)
    if (!result) {
      setShowZip(true)
      return
    }
    // Refresh server components so the homepage / DirectoryPreview re-fetch
    // with the new user_location cookie.
    router.refresh()
  }

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setZipError(null)
    setBusy(true)
    const result = await setFromZip(zip)
    setBusy(false)
    if (!result) {
      setZipError("Couldn't find that zip — double-check and try again.")
      return
    }
    router.refresh()
  }

  return (
    <div
      className={`bg-[#f4f4f0] border border-[#BE9B32]/30 rounded-xl px-5 py-4 flex flex-wrap items-center gap-4 ${className}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#001435"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>

      <div className="flex-1 min-w-[200px]">
        <p className="font-serif text-base text-[#001435]">
          Find Catholic-owned businesses near you
        </p>
        {status === "denied" && (
          <p className="text-xs text-[#75777f] mt-1">
            Location blocked. Enter a zip code instead.
          </p>
        )}
      </div>

      {!showZip && status !== "denied" && (
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={handleAllow}
            disabled={busy}
            className="bg-[#001435] text-white text-xs font-bold uppercase tracking-[0.1em] px-4 py-2 rounded-full hover:bg-[#17294a] transition-colors disabled:opacity-50"
          >
            {busy ? "…" : "Use my location"}
          </button>
          <button
            type="button"
            onClick={() => setShowZip(true)}
            className="text-xs text-[#001435] underline hover:text-[#755b00]"
          >
            Enter zip
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-[#75777f] hover:text-[#001435] ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {(showZip || status === "denied") && (
        <form onSubmit={handleZipSubmit} className="flex gap-2 items-center">
          <input
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={10}
            placeholder="ZIP"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="w-24 px-3 py-2 text-sm rounded-full border border-[#c5c6cf] focus:ring-2 focus:ring-[#755b00] focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !zip}
            className="bg-[#001435] text-white text-xs font-bold uppercase tracking-[0.1em] px-4 py-2 rounded-full hover:bg-[#17294a] transition-colors disabled:opacity-50"
          >
            {busy ? "…" : "Go"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-[#75777f] hover:text-[#001435]"
          >
            ✕
          </button>
          {zipError && (
            <span className="text-xs text-red-600 w-full mt-1">{zipError}</span>
          )}
        </form>
      )}
    </div>
  )
}
