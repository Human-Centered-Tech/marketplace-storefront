import { LoginForm } from "@/components/molecules/LoginForm/LoginForm"
import { UserNavigation } from "@/components/molecules/UserNavigation/UserNavigation"
import { UserMessagesSection } from "@/components/sections/UserMessagesSection/UserMessagesSection"
import { retrieveCustomer } from "@/lib/data/customer"

type Props = {
  searchParams: Promise<{ conversation?: string }>
}

export default async function MessagesPage({ searchParams }: Props) {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const { conversation } = await searchParams

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3 space-y-8">
          <UserMessagesSection
            currentUserId={user.id}
            initialConversationId={conversation ?? null}
          />
        </div>
      </div>
    </main>
  )
}
