import type { Metadata } from "next"
import { Suspense } from "react"
import { VendorOnboardingFunnel } from "@/components/sections/VendorOnboardingFunnel/VendorOnboardingFunnel"

export const metadata: Metadata = {
  title: "Merchant Onboarding | Catholic Owned®",
  description:
    "Tell us about your business and we'll guide you to the right plan for selling on Catholic Owned®.",
}

export default function SellOnboardingPage() {
  // Suspense boundary required: the funnel now calls useSearchParams()
  // (reads claim_listing/return_to for the claim flow), which Next requires
  // to be wrapped or the production build errors on this route.
  return (
    <Suspense>
      <VendorOnboardingFunnel />
    </Suspense>
  )
}
