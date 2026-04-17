"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import {
  renewBarterListing,
  updateBarterListing,
} from "@/lib/data/barter"
import type { BarterListing } from "@/types/barter"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-50 text-green-700 border-green-200" },
  pending: {
    label: "Pending review",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  sold: { label: "Sold", color: "bg-gray-100 text-gray-700 border-gray-200" },
  traded: {
    label: "Traded",
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
  expired: {
    label: "Expired",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  removed: { label: "Removed", color: "bg-red-50 text-red-700 border-red-200" },
}

export const MyBarterListings = ({
  listings,
}: {
  listings: BarterListing[]
}) => {
  const router = useRouter()
  const [optimistic, setOptimistic] = useState(listings)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleRenew = (id: string) => {
    startTransition(async () => {
      setError(null)
      const res = await renewBarterListing(id)
      if (res.ok && res.data?.listing) {
        setOptimistic(
          optimistic.map((l) =>
            l.id === id ? { ...l, ...res.data!.listing } : l
          )
        )
        router.refresh()
      } else {
        setError(res.error || "Failed to renew")
      }
    })
  }

  const handleMarkSold = (id: string, asTraded: boolean) => {
    const verb = asTraded ? "traded" : "sold"
    if (!confirm(`Mark this listing as ${verb}? This can't be easily undone.`))
      return
    startTransition(async () => {
      setError(null)
      const res = await updateBarterListing(id, { status: verb })
      if (res.ok && res.data?.listing) {
        setOptimistic(
          optimistic.map((l) => (l.id === id ? { ...l, ...res.data!.listing } : l))
        )
      } else {
        setError(res.error || "Failed to update")
      }
    })
  }

  const handleArchive = (id: string) => {
    if (!confirm("Archive this listing? It will no longer be visible to others."))
      return
    startTransition(async () => {
      setError(null)
      const res = await updateBarterListing(id, { status: "removed" })
      if (res.ok && res.data?.listing) {
        setOptimistic(
          optimistic.map((l) => (l.id === id ? { ...l, ...res.data!.listing } : l))
        )
      } else {
        setError(res.error || "Failed to archive")
      }
    })
  }

  if (!optimistic.length) {
    return (
      <div className="border border-[#d6d0c4]/40 rounded-xl bg-white p-8 text-center">
        <p className="text-sm text-secondary mb-3">
          You haven&rsquo;t posted any barter listings yet.
        </p>
        <LocalizedClientLink
          href="/user/barter/create"
          className="inline-flex text-sm text-[#BE9B32] font-semibold underline"
        >
          Post your first listing →
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {optimistic.map((listing) => {
        const status = STATUS_LABELS[listing.status] || {
          label: listing.status,
          color: "bg-gray-100 text-gray-700 border-gray-200",
        }
        const coverImage = (listing as any).images?.[0]?.url
        const isExpired = listing.status === "expired"
        const isActive = listing.status === "active"
        const isPending = listing.status === "pending"
        const isClosed =
          listing.status === "sold" ||
          listing.status === "traded" ||
          listing.status === "removed"

        return (
          <div
            key={listing.id}
            className="border border-[#d6d0c4]/40 rounded-xl bg-white p-4 flex gap-4 items-start"
          >
            <div className="w-24 h-24 bg-[#faf9f5] rounded-lg overflow-hidden flex-shrink-0">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  No image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
                <LocalizedClientLink
                  href={`/barter/${listing.id}`}
                  className="font-serif text-lg text-[#17294A] font-semibold hover:text-[#BE9B32] transition-colors"
                >
                  {listing.title}
                </LocalizedClientLink>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${status.color}`}
                >
                  {status.label}
                </span>
              </div>

              <p className="text-xs text-secondary mb-3">
                Posted{" "}
                {new Date(listing.created_at).toLocaleDateString()}
                {listing.expires_at && isActive && (
                  <>
                    {" "}
                    &middot; expires{" "}
                    {new Date(listing.expires_at).toLocaleDateString()}
                  </>
                )}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                {!isClosed && !isPending && (
                  <LocalizedClientLink
                    href={`/user/barter/edit/${listing.id}`}
                    className="text-xs font-semibold text-[#17294A] border border-[#d6d0c4] px-3 py-1.5 rounded-lg hover:bg-[#faf9f5] transition-colors"
                  >
                    Edit
                  </LocalizedClientLink>
                )}
                {isExpired && (
                  <button
                    onClick={() => handleRenew(listing.id)}
                    disabled={pending}
                    className="text-xs font-semibold bg-[#BE9B32] text-[#17294A] px-3 py-1.5 rounded-lg hover:brightness-105 transition-all disabled:opacity-50"
                  >
                    Renew (+30 days)
                  </button>
                )}
                {isActive && (
                  <>
                    <button
                      onClick={() => handleMarkSold(listing.id, false)}
                      disabled={pending}
                      className="text-xs font-semibold text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                    >
                      Mark sold
                    </button>
                    <button
                      onClick={() => handleMarkSold(listing.id, true)}
                      disabled={pending}
                      className="text-xs font-semibold text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                    >
                      Mark traded
                    </button>
                  </>
                )}
                {(isActive || isExpired) && (
                  <button
                    onClick={() => handleArchive(listing.id)}
                    disabled={pending}
                    className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
