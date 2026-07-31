"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ServiceAreaForm } from "@/components/sections/DirectoryManagement/ServiceAreaForm"
import {
  getMyDirectoryListing,
  setServiceArea,
} from "@/lib/data/directory-actions"

/**
 * Required onboarding step: which states does this business serve?
 *
 * Its own page rather than a control inside the listing form because the
 * go-live preflight blocks on it (`no_service_area`) — a listing with no
 * serviced states is filtered out of the storefront directory's state facet,
 * so paying for one would buy something customers can't find.
 *
 * Reached from the vendor dashboard checklist via storefrontHandoff.
 */
export default function ServiceAreaPage() {
  const router = useRouter()
  const [listingId, setListingId] = useState<string | null>(null)
  const [initialStates, setInitialStates] = useState<string[]>([])
  const [homeState, setHomeState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyDirectoryListing()
      .then(({ listing }) => {
        if (!listing) {
          // No listing yet (pre-auto-create accounts, or creation failed).
          // Send them to the create form rather than dead-ending here.
          router.replace("/user/directory/create")
          return
        }
        setListingId(listing.id)
        const addr = (listing as any).address || {}
        const raw = String(addr.serviced_states ?? "")
        setInitialStates(raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [])
        setHomeState(addr.state ?? null)
      })
      .catch(() => setError("Could not load your listing. Please try again."))
      .finally(() => setLoading(false))
  }, [router])

  const handleSave = async (codes: string[]) => {
    if (!listingId) return
    setSaving(true)
    setError(null)
    const res = await setServiceArea(listingId, codes)
    setSaving(false)
    if (!res.ok) {
      setError(res.error || "Could not save your service area.")
      return
    }
    // Back to the dashboard, where the checklist row now reads done and
    // "Go live & pay" is unblocked.
    router.push("/api/vendor-handoff")
  }

  return (
    <main className="container py-8">
      <div className="max-w-2xl">
        {loading ? (
          <p className="text-secondary">Loading…</p>
        ) : (
          <ServiceAreaForm
            initialStates={initialStates}
            homeState={homeState}
            onSave={handleSave}
            saving={saving}
            error={error}
          />
        )}
      </div>
    </main>
  )
}
