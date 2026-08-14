"use client"

import { useEffect, useRef, useState } from "react"
import { trackButtonClick } from "@/lib/analytics"

/**
 * Share button (Brooke, 8/11 — "no share buttons anywhere on the platform").
 *
 * Shares the page's canonical URL: origin + pathname, query params dropped
 * (variant selections, search state and tracking params aren't part of the
 * page's identity). That https URL IS the deep link — Android App Links /
 * iOS Universal Links route it into the mobile app when installed, and the
 * web page renders it for everyone else, so one URL serves both audiences.
 *
 * Mobile browsers get the native share sheet (navigator.share); desktop falls
 * back to copying the link with a transient "Link copied" confirmation.
 * The icon is an inline SVG, deliberately NOT a Material Symbols glyph — the
 * icon font is only loaded on the directory detail page, and a font-dependent
 * icon would render as the literal word "share" on the product and seller
 * pages.
 */
export const ShareButton = ({
  title,
  text,
  path,
  entityType,
  entityId,
  className,
  iconSize = 20,
  label,
}: {
  /** Share-sheet headline, e.g. the business or product name. */
  title: string
  /** Optional supporting line for the share sheet. */
  text?: string
  /**
   * Canonical path to share (e.g. `/us/directory/abc`). Defaults to the
   * current pathname at click time.
   */
  path?: string
  /** Analytics: entity for the button_click event ("share"). */
  entityType?: string
  entityId?: string
  /** Full visual override — when set, replaces the default icon-button look. */
  className?: string
  iconSize?: number
  /** Optional visible label next to the icon (icon-only by default). */
  label?: string
}) => {
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
    },
    []
  )

  const handleShare = async () => {
    if (entityType && entityId) {
      trackButtonClick(entityType, entityId, "share")
    }

    const url = `${window.location.origin}${path ?? window.location.pathname}`

    // Native share sheet where the platform offers one (all mobile browsers,
    // some desktop). A dismissed sheet rejects with AbortError — that's the
    // user changing their mind, not a failure, so never fall through to the
    // clipboard on it.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, ...(text ? { text } : {}), url })
        return
      } catch (e: unknown) {
        if ((e as { name?: string })?.name === "AbortError") return
        // Anything else (e.g. permission policy): fall through to copy.
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (rare: non-secure context / permissions). Last
      // resort: the prompt is ugly but always works and stays copyable.
      window.prompt("Copy this link:", url)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Link copied" : "Share"}
      title="Share"
      className={
        className ??
        "relative p-3 rounded-xl bg-gray-100 text-navy-dark hover:bg-[#F2CD69]/30 transition-colors"
      }
    >
      {/* iOS-style share: arrow out of a tray. */}
      <svg
        aria-hidden="true"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      {label && <span>{label}</span>}
      {copied && (
        <span
          role="status"
          className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#001435] px-3 py-1.5 font-sans text-[11px] font-semibold text-white shadow-lg"
        >
          Link copied
        </span>
      )}
    </button>
  )
}
