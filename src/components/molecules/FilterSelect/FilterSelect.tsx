"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type FilterSelectOption = { value: string; label: string }

/**
 * Branded dropdown for the page filter bars. Replaces a native <select> so the
 * OPEN menu is actually styled to the brand — native <option> lists can't be
 * styled cross-browser, which is why the trade dropdowns looked "unstyled" when
 * clicked. The CLOSED control mirrors the directory bar's look: optional
 * leading icon, value/placeholder, trailing chevron. Closes on outside-click
 * or Escape.
 */
export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  icon,
  ariaLabel,
  className,
}: {
  value: string
  onChange: (value: string) => void
  options: FilterSelectOption[]
  placeholder: string
  icon?: string
  ariaLabel?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  // A non-empty selected value shows its label; "" falls back to the
  // field-name placeholder (greyed).
  const selected = options.find((o) => o.value === value && o.value !== "")
  const label = selected ? selected.label : placeholder

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || placeholder}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2 py-4 font-sans text-sm text-left transition-colors cursor-pointer outline-none",
          className
        )}
      >
        {icon && (
          <span className="material-symbols-outlined text-secondary text-xl shrink-0">
            {icon}
          </span>
        )}
        <span
          className={cn(
            "flex-1 min-w-0 truncate",
            selected ? "text-navy-dark" : "text-secondary"
          )}
        >
          {label}
        </span>
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "shrink-0 text-secondary transition-transform",
            open && "rotate-180"
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 left-0 min-w-full w-max max-w-[16rem] bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 max-h-72 overflow-auto"
        >
          {options.map((o) => {
            const isSelected = o.value === value
            return (
              <li
                key={o.value || "__all"}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className={cn(
                  "px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-gold/10",
                  isSelected
                    ? "text-navy-dark font-semibold bg-gold/5"
                    : "text-secondary"
                )}
              >
                {o.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
