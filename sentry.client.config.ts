/**
 * Sentry browser-side config. Loaded by Next.js when @sentry/nextjs is
 * present. Activates automatically once NEXT_PUBLIC_SENTRY_DSN is set.
 *
 * Matching server + edge configs live in sentry.server.config.ts and
 * sentry.edge.config.ts. Each is wrapped in an IIFE so the three files
 * can coexist without colliding in the project-level type scope.
 */
;(() => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn || typeof window === "undefined") return

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require("@sentry/nextjs") as any
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.05,
      // Replay is valuable for prod bug reports but heavy for our volume;
      // opt in per-incident by setting NEXT_PUBLIC_SENTRY_REPLAYS.
      replaysSessionSampleRate: process.env.NEXT_PUBLIC_SENTRY_REPLAYS
        ? 0.01
        : 0,
      replaysOnErrorSampleRate: process.env.NEXT_PUBLIC_SENTRY_REPLAYS
        ? 1.0
        : 0,
      ignoreErrors: [
        // Transient Next.js chunk-load errors after deploys
        /ChunkLoadError/,
        /Loading chunk \d+ failed/,
        // Expected 429 from our rate limiter
        /RATE_LIMITED/i,
      ],
    })
  } catch {
    // @sentry/nextjs not installed — no-op
  }
})()

export {}
