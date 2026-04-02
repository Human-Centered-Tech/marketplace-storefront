import type { Metadata } from "next"
import { retrieveCustomer } from "@/lib/data/customer"
import { BusinessPricingSection } from "@/components/sections/BusinessPricing/BusinessPricingSection"

export const metadata: Metadata = {
  title: "Sell on Catholic Owned — Plans & Pricing",
  description:
    "Join the Catholic Owned marketplace. Choose a plan to list your business, sell products, and reach Catholic consumers nationwide.",
}

export default async function ForBusinessPage() {
  const customer = await retrieveCustomer()

  return (
    <main>
      <BusinessPricingSection isLoggedIn={!!customer} />
    </main>
  )
}
