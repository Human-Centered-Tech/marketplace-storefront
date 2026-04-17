import { LoginForm, UserNavigation } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import {
  getMyNetworkingDashboard,
  listNetworkingEvents,
} from "@/lib/data/networking"
import { NetworkingDashboard } from "@/components/sections/Networking/NetworkingDashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Speed Networking — My Dashboard",
}

export default async function UserNetworkingPage() {
  const user = await retrieveCustomer()
  if (!user) return <LoginForm />

  const [dashboard, { events: upcomingEvents }] = await Promise.all([
    getMyNetworkingDashboard(),
    listNetworkingEvents({ status: "published", limit: 10 }),
  ])

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3 space-y-8">
          <h1 className="heading-xl text-primary uppercase">
            Speed Networking
          </h1>
          <NetworkingDashboard
            currentUserId={user.id}
            subscription={dashboard?.subscription || null}
            rsvps={dashboard?.rsvps || []}
            contacts={dashboard?.contacts || []}
            upcomingEvents={upcomingEvents}
          />
        </div>
      </div>
    </main>
  )
}
