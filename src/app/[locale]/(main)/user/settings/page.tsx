import { LoginForm, ProfileDetails } from "@/components/molecules"
import { UserNavigation } from "@/components/molecules"
import { ProfilePassword } from "@/components/molecules/ProfileDetails/ProfilePassword"
import { SmsPreferences } from "@/components/molecules/SmsPreferences/SmsPreferences"
import { retrieveCustomer } from "@/lib/data/customer"
import { getSmsPreferences } from "@/lib/data/sms-preferences"

export default async function ReviewsPage() {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  // Read on the server so the consent box renders with the persisted value on
  // first paint — it must never flash checked-then-unchecked (or the reverse)
  // while a client fetch resolves.
  const smsPreferences = await getSmsPreferences()

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3">
          <h1 className="heading-md uppercase mb-8">Settings</h1>
          <ProfileDetails user={user} />
          <ProfilePassword user={user} />
          <SmsPreferences preferences={smsPreferences} />
        </div>
      </div>
    </main>
  )
}
