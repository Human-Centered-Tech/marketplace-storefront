"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react"

import {
  ConsentStatus,
  isLikelyEeaVisitor,
  readStoredConsent,
  writeStoredConsent,
} from "@/lib/consent"

type ConsentContextValue = {
  /** Stored decision. "unknown" until the visitor answers (or if they never do). */
  status: ConsentStatus
  /** Visitor looks EEA/UK, so non-essential analytics needs an opt-in first. */
  requiresConsent: boolean
  /** Client-side detection has run. Everything is inert before this is true. */
  ready: boolean
  /** May the GA4 tag be loaded at all? */
  analyticsAllowed: boolean
  /** The visitor actively clicked Accept (vs. being outside the EEA). */
  analyticsExplicitlyGranted: boolean
  /** Should the banner be on screen right now? */
  bannerVisible: boolean
  accept: () => void
  reject: () => void
  /** Re-open the banner from the footer so a decision can be withdrawn. */
  openPreferences: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

/**
 * Holds the cookie-consent decision for the storefront.
 *
 * Detection deliberately runs in an effect rather than a lazy useState
 * initializer: localStorage and Intl are client-only, so reading them during
 * render would desync the server HTML from the first client render. Until the
 * effect lands, `ready` is false and both the banner and GA render nothing.
 */
export function ConsentProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<ConsentStatus>("unknown")
  const [requiresConsent, setRequiresConsent] = useState(false)
  const [ready, setReady] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)

  useEffect(() => {
    setStatus(readStoredConsent())
    setRequiresConsent(isLikelyEeaVisitor())
    setReady(true)
  }, [])

  const decide = useCallback(
    (next: Exclude<ConsentStatus, "unknown">) => {
      // Re-deciding from the footer can only tighten or loosen an already-loaded
      // tag, and gtag has no clean unload path — so reload to rebuild the page
      // in the new state. First-time answers skip the reload: nothing has been
      // loaded yet, so mounting (or not mounting) GA is enough.
      const needsReload = promptOpen && next !== status

      writeStoredConsent(next)
      setStatus(next)
      setPromptOpen(false)

      if (needsReload) {
        window.location.reload()
      }
    },
    [promptOpen, status]
  )

  const value = useMemo<ConsentContextValue>(() => {
    const analyticsAllowed = ready && (!requiresConsent || status === "granted")

    return {
      status,
      requiresConsent,
      ready,
      analyticsAllowed,
      analyticsExplicitlyGranted: status === "granted",
      bannerVisible:
        ready && (promptOpen || (requiresConsent && status === "unknown")),
      accept: () => decide("granted"),
      reject: () => decide("denied"),
      openPreferences: () => setPromptOpen(true),
    }
  }, [status, requiresConsent, ready, promptOpen, decide])

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  )
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) {
    throw new Error("useConsent must be used within a ConsentProvider")
  }
  return ctx
}
