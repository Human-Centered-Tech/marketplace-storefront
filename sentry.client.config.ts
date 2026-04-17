/**
 * Sentry browser-side config. Loaded by Next.js when @sentry/nextjs is
 * present. Activates automatically once someone runs
 * `pnpm add @sentry/nextjs` and sets NEXT_PUBLIC_SENTRY_DSN.
 * Until then the file is a no-op.
 *
 * Matching server + edge configs live in sentry.server.config.ts and
 * sentry.edge.config.ts.
 */

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn && typeof window !== "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require("@sentry/nextjs") as any
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.05,
      // Replay is valuable for production bug reports but too heavy
      // for our volume; flip on per-incident by setting the env var.
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
}
