import { LoginForm, UserNavigation } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { listBarterCategories } from "@/lib/data/barter"
import { BarterCreateForm } from "@/components/sections/Barter/BarterCreateForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Post a Listing — Trade",
}

export default async function CreateBarterListingPage() {
  const user = await retrieveCustomer()
  if (!user) return <LoginForm />

  const categories = await listBarterCategories()

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3 space-y-6">
          <h1 className="heading-xl text-primary uppercase">
            Post a Listing
          </h1>
          <p className="text-secondary text-sm">
            Share something to sell, trade, or give away. Your listing goes
            live in the trade market right away.
          </p>
          <BarterCreateForm categories={categories} />
        </div>
      </div>
    </main>
  )
}
