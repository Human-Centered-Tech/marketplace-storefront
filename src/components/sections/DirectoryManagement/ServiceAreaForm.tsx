"use client"

import { useMemo, useState } from "react"
import { US_STATES, US_STATE_CODES } from "@/lib/us-states"

type Mode = "single" | "some" | "nationwide"

/**
 * Service area picker.
 *
 * Split out of the big listing form because this is the one field that
 * decides whether a listing can be FOUND: the public directory's state facet
 * falls back to the shopper's detected home state, so a listing with no
 * serviced states is missing from most default searches.
 *
 * Shaped to what merchants actually pick — of 4,390 active listings, 79%
 * serve exactly one state and 11% are effectively nationwide, with almost
 * nothing in between. So the default path is one dropdown, not a 50-button
 * grid; the grid is still there behind "Several states" for the ~1% who need
 * it.
 */
export const ServiceAreaForm = ({
  initialStates,
  homeState,
  onSave,
  saving,
  error,
}: {
  initialStates: string[]
  homeState?: string | null
  onSave: (codes: string[]) => void
  saving?: boolean
  error?: string | null
}) => {
  const initialMode: Mode =
    initialStates.length >= US_STATE_CODES.length
      ? "nationwide"
      : initialStates.length > 1
        ? "some"
        : "single"

  const [mode, setMode] = useState<Mode>(initialMode)
  const [single, setSingle] = useState<string>(
    initialStates[0] || (homeState || "").toUpperCase() || ""
  )
  const [some, setSome] = useState<string[]>(initialStates)

  const selected = useMemo(() => {
    if (mode === "nationwide") return US_STATE_CODES
    if (mode === "some") return some
    return single ? [single] : []
  }, [mode, single, some])

  const toggle = (code: string) =>
    setSome((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )

  const Option = ({
    value,
    title,
    subtitle,
  }: {
    value: Mode
    title: string
    subtitle: string
  }) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      aria-pressed={mode === value}
      className={`w-full text-left border rounded-sm px-4 py-3 transition-colors ${
        mode === value
          ? "border-primary bg-[rgba(23,41,74,0.04)]"
          : "border-gray-300 hover:bg-gray-50"
      }`}
    >
      <span className="block text-sm font-medium text-primary">{title}</span>
      <span className="block text-xs text-secondary mt-0.5">{subtitle}</span>
    </button>
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="heading-md text-primary mb-1">
          Where do you serve customers?
        </h2>
        <p className="text-sm text-secondary">
          Shoppers browse the directory by state. We&apos;ll show your listing
          to people in the states you pick.
        </p>
      </div>

      <div className="space-y-2">
        <Option
          value="single"
          title="One state"
          subtitle="Most businesses — customers in a single state."
        />
        {mode === "single" && (
          <div className="pl-4">
            <select
              value={single}
              onChange={(e) => setSingle(e.target.value)}
              className="w-full max-w-xs border rounded-sm px-3 py-2 text-sm"
            >
              <option value="">Select a state</option>
              {US_STATES.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Option
          value="some"
          title="Several states"
          subtitle="Pick each state you serve."
        />
        {mode === "some" && (
          <div className="pl-4 grid grid-cols-6 sm:grid-cols-10 gap-2">
            {US_STATES.map(({ code, name }) => {
              const on = some.includes(code)
              return (
                <button
                  key={code}
                  type="button"
                  title={name}
                  aria-pressed={on}
                  onClick={() => toggle(code)}
                  className={`px-2 py-1 text-xs rounded-sm border transition-colors ${
                    on
                      ? "border-transparent text-white"
                      : "border-gray-300 text-secondary hover:bg-gray-50"
                  }`}
                  style={on ? { backgroundColor: "#17294A" } : undefined}
                >
                  {code}
                </button>
              )
            })}
          </div>
        )}

        <Option
          value="nationwide"
          title="Nationwide"
          subtitle="You serve customers anywhere in the US."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={selected.length === 0 || saving}
          onClick={() => onSave(selected)}
          className="bg-navy text-white px-6 py-2.5 rounded-sm text-sm uppercase font-medium disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save service area"}
        </button>
        <span className="text-xs text-secondary">
          {selected.length === 0
            ? "Pick at least one state."
            : selected.length >= US_STATE_CODES.length
              ? "All 50 states"
              : `${selected.length} state${selected.length === 1 ? "" : "s"} selected`}
        </span>
      </div>
    </div>
  )
}
