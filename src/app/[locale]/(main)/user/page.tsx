import { LoginForm } from "@/components/molecules"
import { UserNavigation } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export default async function UserPage() {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3">
          <p className="label-sm text-secondary tracking-[0.15em] mb-1">
            Good Morning, {user.first_name}
          </p>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-primary mb-2">
            Your journey of stewardship is{" "}
            <span className="italic">flourishing.</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Recent Orders */}
            <div className="bg-[rgba(var(--neutral-0))] border border-[rgba(var(--neutral-100))] rounded-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif text-lg font-semibold">
                  Recent Acquisitions
                </h2>
                <LocalizedClientLink
                  href="/user/orders"
                  className="text-[12px] font-semibold uppercase tracking-[0.1em] text-action hover:underline"
                >
                  View All Orders
                </LocalizedClientLink>
              </div>
              <p className="text-[14px] text-secondary">
                Items currently being prepared for your home sanctuary.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <LocalizedClientLink
                href="/user/wishlist"
                className="block bg-[rgba(var(--neutral-0))] border border-[rgba(var(--neutral-100))] rounded-sm p-5 hover:border-[rgba(var(--brand-600))] transition-colors"
              >
                <h3 className="font-serif text-md font-semibold mb-1">
                  Sacred Artifacts
                </h3>
                <p className="text-[13px] text-secondary">
                  Your wishlist favorites
                </p>
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/user/registry"
                className="block bg-[rgba(var(--neutral-0))] border border-[rgba(var(--neutral-100))] rounded-sm p-5 hover:border-[rgba(var(--brand-600))] transition-colors"
              >
                <h3 className="font-serif text-md font-semibold mb-1">
                  Gift Registry
                </h3>
                <p className="text-[13px] text-secondary">
                  Manage your sacramental registries
                </p>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
