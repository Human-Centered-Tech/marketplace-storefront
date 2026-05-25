import { Radio, Radio as RadioGroupOption } from "@headlessui/react"
import { Text, clx } from "@medusajs/ui"
import React, { useContext, useMemo, useState, type JSX } from "react"

import { isManual } from "../../../lib/constants"
import SkeletonCardDetails from "./SkeletonCardDetails"
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js"
import { StripeElementStyle } from "@stripe/stripe-js"
import PaymentTest from "./PaymentTest"
import { StripeContext } from "./StripeWrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "rounded-sm flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
        {
          "border-primary/20": selectedPaymentOptionId === paymentProviderId,
        }
      )}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-x-4">
          <Radio value={selectedPaymentOptionId === paymentProviderId} />
          <Text className="text-base-regular">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </Text>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>
        <span className="justify-self-end text-ui-fg-base">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="small:hidden text-[10px]" />
      )}
      {children}
    </RadioGroupOption>
  )
}

export default PaymentContainer

export const StripeCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setCardBrand,
  setError,
  setCardComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setCardBrand: (brand: string) => void
  setError: (error: string | null) => void
  setCardComplete: (complete: boolean) => void
}) => {
  const stripeReady = useContext(StripeContext)

  // Track completeness of each split field independently; the card is
  // "complete" only when all three are. Mirrors the combined
  // CardElement's single `complete` flag, but for separate inputs.
  const [fieldComplete, setFieldComplete] = useState({
    number: false,
    expiry: false,
    cvc: false,
  })

  const elementStyle: StripeElementStyle = useMemo(
    () => ({
      base: {
        fontFamily: "Inter, sans-serif",
        color: "#424270",
        "::placeholder": { color: "rgb(107 114 128)" },
      },
    }),
    []
  )

  const fieldClass =
    "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out"

  const onFieldChange =
    (key: "number" | "expiry" | "cvc") =>
    (e: { complete: boolean; error?: { message: string }; brand?: string }) => {
      if (key === "number" && e.brand) {
        setCardBrand(e.brand.charAt(0).toUpperCase() + e.brand.slice(1))
      }
      setError(e.error?.message || null)
      setFieldComplete((prev) => {
        const next = { ...prev, [key]: e.complete }
        setCardComplete(next.number && next.expiry && next.cvc)
        return next
      })
    }

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady ? (
          <div className="my-4 flex flex-col gap-y-3 transition-all duration-150 ease-in-out">
            <div>
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Card number
              </Text>
              <CardNumberElement
                options={{ style: elementStyle, classes: { base: fieldClass } }}
                onChange={onFieldChange("number")}
              />
            </div>
            <div className="flex gap-x-3">
              <div className="flex-1">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Expiration
                </Text>
                <CardExpiryElement
                  options={{
                    style: elementStyle,
                    classes: { base: fieldClass },
                  }}
                  onChange={onFieldChange("expiry")}
                />
              </div>
              <div className="flex-1">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  CVC
                </Text>
                <CardCvcElement
                  options={{
                    style: elementStyle,
                    classes: { base: fieldClass },
                  }}
                  onChange={onFieldChange("cvc")}
                />
              </div>
            </div>
          </div>
        ) : (
          <SkeletonCardDetails />
        ))}
    </PaymentContainer>
  )
}
