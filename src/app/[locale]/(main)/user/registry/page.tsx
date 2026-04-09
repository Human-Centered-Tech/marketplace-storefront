import { retrieveCustomer } from "@/lib/data/customer"
import { LoginForm, UserNavigation } from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { listMyRegistries } from "@/lib/data/registry"
import { RegistryCard } from "@/components/sections/Registry/RegistryCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Gift Registries",
}

export default async function UserRegistryPage() {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const { registries } = await listMyRegistries()

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h1 className="heading-xl uppercase">My Gift Registries</h1>
            <LocalizedClientLink
              href="/user/registry/create"
              className="bg-navy-dark text-white px-6 py-2 rounded-sm text-sm uppercase font-medium"
            >
              Create Registry
            </LocalizedClientLink>
          </div>

          {registries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {registries.map((registry) => (
                <RegistryCard key={registry.id} registry={registry} />
              ))}
            </div>
          ) : (
            <div className="border rounded-sm p-8 text-center">
              <h2 className="heading-md text-primary mb-2">
                No Registries Yet
              </h2>
              <p className="text-secondary mb-4">
                Create a gift registry for your sacramental celebration and
                share it with family and friends.
              </p>
              <LocalizedClientLink
                href="/user/registry/create"
                className="bg-primary text-white px-6 py-2 rounded-sm text-sm uppercase font-medium inline-block"
              >
                Create Registry
              </LocalizedClientLink>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
