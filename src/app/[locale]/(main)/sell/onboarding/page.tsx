import type { Metadata } from "next"
import { VendorOnboardingFunnel } from "@/components/sections/VendorOnboardingFunnel/VendorOnboardingFunnel"

export const metadata: Metadata = {
  title: "Vendor Onboarding | Catholic Owned®",
  description:
    "Tell us about your business and we'll guide you to the right plan for selling on Catholic Owned®.",
}

export default function SellOnboardingPage() {
  return <VendorOnboardingFunnel />
}
