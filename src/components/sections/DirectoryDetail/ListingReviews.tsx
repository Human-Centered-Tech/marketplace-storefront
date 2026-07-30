"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ListingReview, listListingReviews } from "@/lib/data/directory"
import {
  createListingReview,
  deleteOwnReview,
  updateOwnReview,
} from "@/lib/data/reviews"

const MAX_NOTE = 300
const PAGE_SIZE = 10

/**
 * Customer reviews on a directory listing.
 *
 * Eligibility is "signed in" and nothing else (Brooke 7/28) — there's no
 * purchase to verify against a listing, unlike seller/product reviews. The
 * server enforces it; this component just doesn't render the form for guests.
 */
export const ListingReviews = ({
  listingId,
  businessName,
  initialReviews,
  initialRating,
  initialCount,
  totalCount,
  currentCustomerId,
  isOwner,
}: {
  listingId: string
  businessName: string
  initialReviews: ListingReview[]
  initialRating: number | null
  initialCount: number
  // Total rows available from the API — drives whether "Load more" shows at all.
  totalCount: number
  // null when the viewer is a guest. Sent from the page (retrieveCustomer is
  // server-only).
  currentCustomerId: string | null
  isOwner: boolean
}) => {
  const router = useRouter()
  const [reviews, setReviews] = useState(initialReviews)
  const [loadingMore, setLoadingMore] = useState(false)
  const [exhausted, setExhausted] = useState(
    initialReviews.length >= totalCount
  )

  const own = currentCustomerId
    ? reviews.find((r) => r.customer_id === currentCustomerId)
    : undefined

  const [editing, setEditing] = useState(false)
  const showForm = !!currentCustomerId && !isOwner && (!own || editing)

  const loadMore = async () => {
    setLoadingMore(true)
    const next = await listListingReviews(listingId, {
      limit: PAGE_SIZE,
      offset: reviews.length,
    })
    setLoadingMore(false)
    if (!next.reviews.length) {
      setExhausted(true)
      return
    }
    // De-dupe by id: a review written between page loads shifts the window and
    // would otherwise repeat a row across pages.
    setReviews((prev) => {
      const seen = new Set(prev.map((r) => r.id))
      const merged = [...prev, ...next.reviews.filter((r) => !seen.has(r.id))]
      if (merged.length >= next.count) setExhausted(true)
      return merged
    })
  }

  return (
    <div id="listing-reviews" className="scroll-mt-24">
      <h2 className="label-sm text-[10px] text-gold-dark font-bold tracking-[0.2em] mb-4">
        REVIEWS
      </h2>
      <div className="h-px w-full bg-gold/30 mb-8" />

      <ReviewSummary rating={initialRating} count={initialCount} />

      {showForm && (
        <ReviewForm
          listingId={listingId}
          businessName={businessName}
          existing={editing ? own : undefined}
          onDone={() => {
            setEditing(false)
            router.refresh()
          }}
          onCancel={editing ? () => setEditing(false) : undefined}
        />
      )}

      {!currentCustomerId && (
        <div className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-6">
          <p className="font-serif text-lg text-primary">
            Have you worked with {businessName}?
          </p>
          <p className="text-sm text-[#44474e] mt-1 mb-4">
            Sign in to leave a review.
          </p>
          <LocalizedClientLink
            href="/user"
            className="inline-block bg-navy-dark text-white px-6 py-3 rounded-xl label-sm text-[10px] font-bold tracking-widest hover:bg-navy transition-colors"
          >
            Sign In To Review
          </LocalizedClientLink>
        </div>
      )}

      {/* The owner sees no form at all — they reply from the vendor dashboard.
          Saying so beats silently omitting it and looking broken. */}
      {isOwner && (
        <p className="mt-6 text-sm text-[#44474e] italic">
          This is your listing. You can reply to reviews from your dashboard
          under Reviews → Business Listing.
        </p>
      )}

      <div className="mt-10 space-y-8">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            listingId={listingId}
            businessName={businessName}
            isOwn={!!currentCustomerId && review.customer_id === currentCustomerId}
            onEdit={() => setEditing(true)}
            onDeleted={() => {
              setReviews((prev) => prev.filter((r) => r.id !== review.id))
              router.refresh()
            }}
          />
        ))}
      </div>

      {!reviews.length && (
        <p className="mt-6 font-serif text-lg text-[#44474e]">
          No reviews yet
          {currentCustomerId && !isOwner ? " — be the first." : "."}
        </p>
      )}

      {!exhausted && reviews.length > 0 && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-8 w-full py-3 border border-navy-dark/20 rounded-xl label-sm text-[10px] font-bold tracking-widest text-navy-dark hover:bg-navy-dark/5 transition-colors disabled:opacity-50"
        >
          {loadingMore ? "LOADING…" : "LOAD MORE REVIEWS"}
        </button>
      )}
    </div>
  )
}

/** Gold stars. `filled` is rounded — the numeral carries the precision. */
const Stars = ({ rate, size = 18 }: { rate: number; size?: number }) => (
  <div className="flex" aria-label={`${rate} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={star <= Math.round(rate) ? "#BE9B32" : "none"}
        stroke="#BE9B32"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
)

const ReviewSummary = ({
  rating,
  count,
}: {
  rating: number | null
  count: number
}) => {
  // rating is null (not 0) for an unrated listing — showing five empty stars
  // would read as a bad score rather than no score.
  if (rating === null || count === 0) return null

  return (
    <div className="flex items-center gap-4">
      <span className="font-serif text-4xl font-bold text-[#001435]">
        {rating.toFixed(1)}
      </span>
      <div>
        <Stars rate={rating} size={20} />
        <p className="text-sm text-[#44474e] mt-1">
          {count} {count === 1 ? "review" : "reviews"}
        </p>
      </div>
    </div>
  )
}

const ReviewCard = ({
  review,
  listingId,
  businessName,
  isOwn,
  onEdit,
  onDeleted,
}: {
  review: ListingReview
  listingId: string
  businessName: string
  isOwn: boolean
  onEdit: () => void
  onDeleted: () => void
}) => {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()

  const remove = () => {
    setError(undefined)
    startTransition(async () => {
      const res = await deleteOwnReview(review.id, `/directory/${listingId}`)
      if (res?.error) {
        setError(res.error)
        return
      }
      onDeleted()
    })
  }

  return (
    <div className="border-b border-gold/20 pb-8 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-md text-primary font-bold">
            {review.author_name}
            {isOwn && (
              <span className="ml-2 text-[10px] tracking-widest text-gold-dark">
                YOUR REVIEW
              </span>
            )}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <Stars rate={review.rating} size={14} />
            <span className="text-xs text-[#75777f]">
              {formatDistanceToNow(new Date(review.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        {isOwn && (
          <div className="flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className="text-xs text-navy-dark underline hover:no-underline"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="text-xs text-negative underline hover:no-underline disabled:opacity-50"
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
          </div>
        )}
      </div>

      {review.customer_note && (
        <p className="mt-3 font-serif text-lg leading-relaxed text-primary whitespace-pre-line break-words">
          {review.customer_note}
        </p>
      )}

      {error && <p className="mt-2 text-sm text-negative">{error}</p>}

      {/* Owner's reply. Same seller_note column the seller-review component
          renders, so replies look identical across review kinds. */}
      {review.seller_note && (
        <div className="mt-4 ml-4 border-l-2 border-gold pl-4">
          <p className="label-sm text-gold-dark font-bold">
            Reply from {businessName}
          </p>
          <p className="mt-1 text-[#44474e] whitespace-pre-line break-words">
            {review.seller_note}
          </p>
        </div>
      )}
    </div>
  )
}

const ReviewForm = ({
  listingId,
  businessName,
  existing,
  onDone,
  onCancel,
}: {
  listingId: string
  businessName: string
  existing?: ListingReview
  onDone: () => void
  onCancel?: () => void
}) => {
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [hover, setHover] = useState(0)
  const [note, setNote] = useState(existing?.customer_note ?? "")
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  const submit = () => {
    setError(undefined)
    if (rating < 1) {
      setError("Pick a star rating first.")
      return
    }

    startTransition(async () => {
      const body = { rating, customer_note: note.trim() || null }
      const res = existing
        ? await updateOwnReview(existing.id, body, `/directory/${listingId}`)
        : await createListingReview(listingId, body)

      if (res?.error) {
        setError(res.error)
        return
      }
      onDone()
    })
  }

  return (
    <div className="mt-6 rounded-xl border border-gold/30 bg-white p-6">
      <p className="font-serif text-xl text-primary mb-4">
        {existing ? "Edit your review" : `Review ${businessName}`}
      </p>

      <div className="flex gap-1 mb-4" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onMouseEnter={() => setHover(star)}
            onClick={() => setRating(star)}
            className="p-1 hover:scale-110 transition-transform bg-transparent"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill={star <= (hover || rating) ? "#BE9B32" : "none"}
              stroke="#BE9B32"
              strokeWidth="1.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE))}
          placeholder={`What was your experience with ${businessName}?`}
          className="w-full px-4 py-3 h-32 border border-gold/30 rounded-lg bg-[#FAF9F5] focus:border-gold focus:outline-none focus:ring-0"
        />
        <div className="absolute right-4 bottom-4 text-xs text-[#75777f]">
          {note.length} / {MAX_NOTE}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-negative">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="bg-navy-dark text-white px-6 py-3 rounded-xl label-sm text-[10px] font-bold tracking-widest hover:bg-navy transition-colors disabled:opacity-50"
        >
          {pending ? "SAVING…" : existing ? "SAVE CHANGES" : "SUBMIT REVIEW"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="px-6 py-3 rounded-xl label-sm text-[10px] font-bold tracking-widest text-navy-dark border border-navy-dark/20 hover:bg-navy-dark/5 transition-colors"
          >
            CANCEL
          </button>
        )}
      </div>
    </div>
  )
}
