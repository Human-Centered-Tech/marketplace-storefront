/**
 * Sentry server-side config. Loaded by Next.js when @sentry/nextjs is
 * present. Pairs with sentry.client.config.ts — server-side
 * exceptions (Route Handlers, Server Components, Server Actions) flow
 * through here.
 */

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require("@sentry/nextjs") as any
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.05,
    })
  } catch {
    // @sentry/nextjs not installed — no-op
  }
}
