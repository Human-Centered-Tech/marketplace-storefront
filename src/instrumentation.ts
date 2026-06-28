import * as Sentry from "@sentry/nextjs"

// Server/edge Sentry init. Next.js auto-loads this `register()` hook. The
// storefront's own SSR/server-action errors flow here. Gated on the DSN so
// it's a no-op when unset (e.g. local dev without a DSN).
const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

export async function register() {
  if (!dsn) return
  if (
    process.env.NEXT_RUNTIME === "nodejs" ||
    process.env.NEXT_RUNTIME === "edge"
  ) {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.05,
    })
  }
}

// Captures errors thrown in React Server Components / server-side rendering.
export const onRequestError = Sentry.captureRequestError
