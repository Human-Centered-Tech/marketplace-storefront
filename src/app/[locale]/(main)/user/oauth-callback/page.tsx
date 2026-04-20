import { redirect } from "next/navigation"
import { completeOAuthSignIn } from "@/lib/data/customer"

type Props = {
  searchParams: Promise<{
    token?: string
    error?: string
    return_to?: string
    provider?: string
  }>
}

/**
 * OAuth return handler. Medusa's Google auth provider redirects here
 * after successful consent with a ?token=<medusa-jwt> query param. We
 * exchange it for a Medusa customer session and forward the user on.
 *
 * Per 3/31 decision: Google sign-in collects email + profile pic;
 * additional info (phone, preferences, etc.) is gathered via a
 * subsequent onboarding step — for now we drop new SSO users straight
 * into /user, which renders the profile completion UI when fields
 * are missing.
 */
export default async function OAuthCallbackPage({ searchParams }: Props) {
  const { token, error, return_to } = await searchParams

  if (error) {
    redirect(`/user?sso_error=${encodeURIComponent(error)}`)
  }

  if (!token) {
    redirect("/user?sso_error=missing-token")
  }

  const ok = await completeOAuthSignIn(token)
  if (!ok) {
    redirect("/user?sso_error=exchange-failed")
  }

  const safeReturn =
    return_to && return_to.startsWith("/") ? return_to : "/user"
  redirect(safeReturn)
}
