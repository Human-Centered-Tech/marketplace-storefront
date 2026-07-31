"use client"
import {
  FieldError,
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { reviewSchema, ReviewFormData } from "./schema"
import { Button } from "@/components/atoms"
import { InteractiveStarRating } from "@/components/atoms/InteractiveStarRating/InteractiveStarRating"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { createReview, Order } from "@/lib/data/reviews"
import { pendingReviewTargets, ReviewTarget } from "@/lib/review-targets"

interface Props {
  handleClose?: () => void
  seller: Order
}

export const ReviewForm: React.FC<Props> = ({ ...props }) => {
  const methods = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      sellerId: "",
      rating: 0,
      opinion: "",
    },
  })

  return (
    <FormProvider {...methods}>
      <Form {...props} />
    </FormProvider>
  )
}

const Form: React.FC<Props> = ({ handleClose, seller }) => {
  const [error, setError] = useState<string>()

  // Everything on this order that still needs a review: the seller plus each
  // distinct product. This used to be hardcoded to reference:"seller", so a
  // buyer could never review the product itself from the web storefront even
  // though the API and the mobile app both supported it.
  const targets = pendingReviewTargets(seller)
  const [target, setTarget] = useState<ReviewTarget | undefined>(targets[0])

  const {
    watch,
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useFormContext()

  const submit = async (data: FieldValues) => {
    if (!target) {
      setError("There's nothing left to review on this order.")
      return
    }

    const response = await createReview({
      order_id: seller.id,
      rating: data.rating,
      reference: target.reference,
      reference_id: target.reference_id,
      customer_note: data.opinion,
    })

    // Surface the server's own words — "Product was not part of this order" and
    // "Review already exists" both need to be readable. The old form only ever
    // set a bare "error" string.
    if (response?.error || response?.message) {
      setError(response.message || "Could not save your review.")
      return
    }

    setError("")
    handleClose && handleClose()
  }

  const lettersCount = watch("opinion")?.length
  const rating = watch("rating")

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="px-4 space-y-4">
        <div className="max-w-full grid grid-cols-1 items-top gap-4 mb-4">
          {/* Target picker. Hidden when there's only one thing left to review —
              a one-option chooser is just noise. */}
          {targets.length > 1 && (
            <div>
              <label className="label-sm block mb-2">
                What are you reviewing?
              </label>
              <div className="flex flex-wrap gap-2">
                {targets.map((t) => {
                  const active =
                    target?.reference === t.reference &&
                    target?.reference_id === t.reference_id
                  return (
                    <button
                      key={`${t.reference}:${t.reference_id}`}
                      type="button"
                      onClick={() => setTarget(t)}
                      className={cn(
                        "px-3 py-2 rounded-sm border text-sm transition-colors",
                        active
                          ? "border-primary bg-component-secondary font-semibold"
                          : "border-base-primary hover:border-primary"
                      )}
                    >
                      {t.reference === "seller"
                        ? `${t.label} (seller)`
                        : t.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <label className="label-sm block mb-2">Rating</label>
            <InteractiveStarRating
              value={rating}
              onChange={(value) => setValue("rating", value)}
              error={!!errors.rating}
            />
            {errors.rating?.message && (
              <p className="label-sm text-negative mt-1">
                {(errors.rating as FieldError).message}
              </p>
            )}
          </div>

          <label className={cn("label-sm block relative")}>
            <p className={cn(error && "text-negative")}>Your opinion</p>
            <textarea
              className={cn(
                "w-full px-4 py-3 h-32 border rounded-sm bg-component-secondary focus:border-primary focus:outline-none focus:ring-0 relative",
                error && "border-negative focus:border-negative"
              )}
              placeholder={
                target?.reference === "product"
                  ? `Write your opinion about ${target.label}...`
                  : "Write your opinion about this seller..."
              }
              {...register("opinion")}
            />
            <div
              className={cn(
                "absolute right-4 label-medium text-secondary",
                errors.opinion?.message ? "bottom-8" : "bottom-3 "
              )}
            >
              {`${lettersCount} / 300`}
            </div>
            {errors.opinion?.message && (
              <p className="label-sm text-negative">
                {(errors.opinion as FieldError).message}
              </p>
            )}
          </label>
        </div>
        {error && <p className="label-md text-negative">{error}</p>}
        <Button className="w-full" disabled={!target}>
          SUBMIT REVIEW
        </Button>
      </div>
    </form>
  )
}
