"use client"

/**
 * Social sign-in buttons. Kicks off Medusa's built-in OAuth flow for
 * Google; Apple is a stub until we wire a custom provider. Each
 * provider only renders when NEXT_PUBLIC_*_ENABLED is truthy so we
 * don't show buttons that would error on click.
 *
 * Per 3/31 decision: Google + Apple SSO, with additional info collected
 * via onboarding after first sign-in. Medusa redirects back to the
 * storefront with a token; we exchange it for a session on return.
 */

const googleEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_SSO_ENABLED === "true" ||
  !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const appleEnabled =
  process.env.NEXT_PUBLIC_APPLE_SSO_ENABLED === "true"

export const SocialSignIn = () => {
  if (!googleEnabled && !appleEnabled) return null

  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""

  const startGoogle = () => {
    // Medusa's Google auth provider exposes /auth/customer/google which
    // returns a redirect URL; easier to navigate directly.
    window.location.href = `${backendUrl}/auth/customer/google`
  }

  return (
    <>
      <div className="relative flex items-center my-6">
        <div className="flex-grow border-t border-[rgba(var(--neutral-100))]" />
        <span className="px-3 text-[11px] text-secondary uppercase tracking-wider">
          or
        </span>
        <div className="flex-grow border-t border-[rgba(var(--neutral-100))]" />
      </div>

      <div className="space-y-2">
        {googleEnabled && (
          <button
            type="button"
            onClick={startGoogle}
            className="w-full flex items-center justify-center gap-3 border border-[rgba(var(--neutral-200))] rounded-sm py-3 hover:bg-[rgba(var(--neutral-50))] transition-colors text-[14px] font-medium"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.57 2.69-3.87 2.69-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.35-1.59-5.06-3.72H.93v2.33A9 9 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.94 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.97H.93A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.03l3-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.97l3 2.33C4.65 5.17 6.65 3.58 9 3.58z"
              />
            </svg>
            Continue with Google
          </button>
        )}
        {appleEnabled && (
          <button
            type="button"
            disabled
            title="Apple sign-in coming soon"
            className="w-full flex items-center justify-center gap-3 border border-[rgba(var(--neutral-200))] rounded-sm py-3 opacity-50 cursor-not-allowed text-[14px] font-medium"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <path
                fill="currentColor"
                d="M14.25 9.47c-.02-2.09 1.7-3.09 1.78-3.14-.97-1.42-2.48-1.62-3.02-1.64-1.29-.13-2.51.76-3.16.76-.65 0-1.66-.74-2.73-.72-1.41.02-2.7.82-3.42 2.08-1.45 2.51-.37 6.23 1.05 8.27.7 1 1.52 2.12 2.6 2.08 1.05-.04 1.44-.68 2.7-.68s1.62.68 2.73.66c1.13-.02 1.84-1.01 2.53-2.01.8-1.16 1.12-2.29 1.14-2.35-.03-.01-2.19-.84-2.2-3.3zM12.36 3.43c.58-.7.97-1.67.86-2.64-.83.03-1.84.56-2.44 1.26-.54.62-1.01 1.62-.88 2.57.93.07 1.88-.47 2.46-1.19z"
              />
            </svg>
            Continue with Apple
          </button>
        )}
      </div>
    </>
  )
}
