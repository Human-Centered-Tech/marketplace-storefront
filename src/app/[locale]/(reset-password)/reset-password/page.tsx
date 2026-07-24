import { Card } from "@/components/atoms"
import { ProfilePasswordForm } from "@/components/molecules/ProfilePasswordForm/ProfilePasswordForm"
import { RequestPasswordResetForm } from "@/components/molecules/RequestPasswordResetForm/RequestPasswordResetForm"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token: string; setup?: string }>
}) {
  const { token, setup } = await searchParams

  return (
    <main className="container flex justify-center">
      <Card className="w-full max-w-lg">
        {/* With a token (arrived from the reset email) the user sets a new
            password. Without one ("Forgot Password?" link), they request a
            reset email first. setup=1 means this is the "add a password to an
            OAuth-only account" link, which links a new email+password login to
            the existing account rather than resetting an existing password. */}
        {token ? (
          <ProfilePasswordForm token={token} setup={setup === "1"} />
        ) : (
          <RequestPasswordResetForm />
        )}
      </Card>
    </main>
  )
}
