"use client"

import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { isManual, isStripe } from "../../../lib/constants"
import { placeOrder } from "@/lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import {
  useElements,
  useStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/atoms"
import { orderErrorFormatter } from "@/lib/helpers/order-error-formatter"
import { toast } from "@/lib/helpers/toast"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  // Pre-launch kill-switch (same flag as the cart's Proceed to Checkout):
  // if a shopper reaches this page via a direct /checkout URL, still block
  // order completion. Greyed/disabled button + "Checkout coming soon".
  if (process.env.NEXT_PUBLIC_CHECKOUT_DISABLED === "true") {
    return (
      <div>
        <Button
          disabled
          className="w-full opacity-50 cursor-not-allowed"
          data-testid={dataTestId}
        >
          Place order
        </Button>
        <p className="text-center text-xs text-secondary mt-2">
          Checkout coming soon
        </p>
      </div>
    )
  }

  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      // No payment method selected yet — render nothing rather than a
      // disabled "Select a payment method" stub. The button only appears
      // once the buyer can actually act on it.
      return null
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)

  const onPaymentCompleted = async () => {
    try {
      const res = await placeOrder()
      if (!res.ok) {
        setErrorMessage(res.error?.message)
      }
    } catch (error: any) {
      if (error?.message !== "NEXT_REDIRECT") {
        setErrorMessage(
          error?.message?.replace("Error setting up the request: ", "")
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const stripe = useStripe()
  const elements = useElements()

  const session = cart.payment_collection?.payment_sessions?.find(
    (s: any) => s.status === "pending"
  )

  // Reactively track completeness across the three split card fields
  // (number / expiry / cvc) via Stripe's element change events. The
  // fields are mounted by StripeCardContainer in the same Elements
  // provider; they may mount slightly after this button, so retry
  // attaching until all three exist.
  useEffect(() => {
    if (!elements) return
    let active = true
    const state = { number: false, expiry: false, cvc: false }
    const attached: Array<{ off: () => void }> = []

    const attach = (): boolean => {
      const num = elements.getElement(CardNumberElement)
      const exp = elements.getElement(CardExpiryElement)
      const cvc = elements.getElement(CardCvcElement)
      if (!num || !exp || !cvc) return false
      const make =
        (key: "number" | "expiry" | "cvc") => (e: { complete: boolean }) => {
          state[key] = e.complete
          if (active) setCardComplete(state.number && state.expiry && state.cvc)
        }
      const hn = make("number")
      const he = make("expiry")
      const hc = make("cvc")
      num.on("change", hn)
      exp.on("change", he)
      cvc.on("change", hc)
      attached.push(
        { off: () => num.off("change", hn) },
        { off: () => exp.off("change", he) },
        { off: () => cvc.off("change", hc) }
      )
      return true
    }

    let interval: ReturnType<typeof setInterval> | undefined
    if (!attach()) {
      interval = setInterval(() => {
        if (attach() && interval) clearInterval(interval)
      }, 200)
    }
    return () => {
      active = false
      if (interval) clearInterval(interval)
      attached.forEach((a) => a.off())
    }
  }, [elements])

  const handlePayment = async () => {
    setSubmitting(true)

    const card = elements?.getElement(CardNumberElement)
    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  // Only show the Place Order button once it's actually actionable —
  // card fully entered and prior steps complete. No greyed-out button
  // while the buyer is still filling in card details.
  const canPlaceOrder = cardComplete && !notReady

  return (
    <>
      {canPlaceOrder && (
        <Button onClick={handlePayment} loading={submitting} className="w-full">
          Place order
        </Button>
      )}
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    try {
      const res = await placeOrder()
      if (!res.ok) {
        setErrorMessage(res.error?.message)
      }
    } catch (error: any) {
      if (error?.message !== "NEXT_REDIRECT") {
        setErrorMessage(
          error?.message?.replace("Error setting up the request: ", "")
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayment = () => {
    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        onClick={handlePayment}
        className="w-full"
        loading={submitting}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
