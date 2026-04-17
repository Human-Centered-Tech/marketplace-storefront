/**
 * Sentry server-side config — Route Handlers, Server Components,
 * Server Actions. Pairs with sentry.client.config.ts +
 * sentry.edge.config.ts.
 */
;(() => {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return

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
})()

export {}
