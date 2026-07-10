import * as Sentry from "@sentry/nextjs"

// Browser-side Sentry init. In Next.js 15 this file (instrumentation-client.ts)
// is what actually loads the client SDK — the old sentry.client.config.ts is
// no longer auto-loaded, which is why client errors were invisible before.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.05,
    // Session Replay — records the user's actual session (incl. rage clicks /
    // dead clicks) so we can see what a frustrated user was doing. Capture a
    // sample of all sessions + 100% of sessions that hit an error. Text and
    // media are masked for privacy (this is a marketplace with PII).
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    ignoreErrors: [
      // Transient Next.js chunk-load errors after a deploy
      /ChunkLoadError/,
      /Loading chunk \d+ failed/,
      // Expected 429 from our own rate limiter
      /RATE_LIMITED/i,
      // Crypto-wallet browser extensions probing pages we don't integrate with
      /Failed to connect to MetaMask/i,
    ],
    // Third-party scripts injected into our origin whose crashes we can't fix.
    // Google Translate's proxy (…translate.goog) injects translate_http/…
    // element scripts that throw null.setAttribute on its own popup widget
    // (Sentry JAVASCRIPT-NEXTJS-19, /sell/onboarding via a Polish reader).
    denyUrls: [/\/translate_http\//, /translate\.googleapis\.com/],
  })
}

// Instruments client-side navigations so route changes are traced.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
