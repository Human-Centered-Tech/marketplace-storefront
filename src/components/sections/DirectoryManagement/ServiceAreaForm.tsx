"use client"

import { useState } from "react"
import { US_STATES, US_STATE_CODES } from "@/lib/us-states"

/**
 * Service area picker.
 *
 * Lifted verbatim out of DirectoryListingForm's "States You Serve" block —
 * same Nationwide/Clear links, same 50-button grid, same toggle behaviour —
 * so merchants who have used the listing form see exactly the control they
 * already know. It only lives on its own page now because this is the one
 * field that decides whether a listing can be FOUND (the public directory's
 * state facet falls back to the shopper's detected home state), so go-live
 * blocks on it rather than letting it be skipped mid-form.
 */
export const ServiceAreaForm = ({
  initialStates,
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
  const [servicedStates, setServicedStates] = useState<string[]>(initialStates)

  const toggleServicedState = (code: string) =>
    setServicedStates((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-md text-primary mb-1">
          Where do you serve customers?
        </h2>
        <p className="text-sm text-secondary">
          Shoppers browse the directory by state, so this is how they find you.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="heading-sm text-primary">States You Serve</h3>
          <div className="flex gap-3 text-xs">
            <button
              type="button"
              onClick={() => setServicedStates(US_STATE_CODES)}
              className="text-secondary underline hover:no-underline"
            >
              Nationwide
            </button>
            <button
              type="button"
              onClick={() => setServicedStates([])}
              className="text-secondary underline hover:no-underline"
            >
              Clear
            </button>
          </div>
        </div>
        <p className="text-xs text-secondary mb-3">
          Pick every state you serve so customers there can find you in the
          directory
          {servicedStates.length > 0
            ? ` — ${servicedStates.length} selected`
            : ""}
          .
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {US_STATES.map(({ code, name }) => {
            const on = servicedStates.includes(code)
            return (
              <button
                key={code}
                type="button"
                title={name}
                aria-pressed={on}
                onClick={() => toggleServicedState(code)}
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
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={servicedStates.length === 0 || saving}
          onClick={() => onSave(servicedStates)}
          className="bg-navy text-white px-6 py-2.5 rounded-sm text-sm uppercase font-medium disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save service area"}
        </button>
        {servicedStates.length === 0 && (
          <span className="text-xs text-secondary">
            Pick at least one state.
          </span>
        )}
      </div>
    </div>
  )
}
