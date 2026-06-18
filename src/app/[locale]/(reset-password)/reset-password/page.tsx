import { Card } from "@/components/atoms"
import { ProfilePasswordForm } from "@/components/molecules/ProfilePasswordForm/ProfilePasswordForm"
import { RequestPasswordResetForm } from "@/components/molecules/RequestPasswordResetForm/RequestPasswordResetForm"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>
}) {
  const { token } = await searchParams

  return (
    <main className="container flex justify-center">
      <Card className="w-full max-w-lg">
        {/* With a token (arrived from the reset email) the user sets a new
            password. Without one ("Forgot Password?" link), they request a
            reset email first. */}
        {token ? (
          <ProfilePasswordForm token={token} />
        ) : (
          <RequestPasswordResetForm />
        )}
      </Card>
    </main>
  )
}
