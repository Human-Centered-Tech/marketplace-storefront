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
      // In-app browsers (Facebook, Instagram, …) inject a native JS bridge and
      // then tear down the Java object behind it while their own beforeunload
      // handler is still firing. Nothing to do with our page — see denyUrls.
      /Java object is gone/i,
    ],
    // Third-party scripts injected into our origin whose crashes we can't fix.
    // Google Translate's proxy (…translate.goog) injects translate_http/…
    // element scripts that throw null.setAttribute on its own popup widget
    // (Sentry JAVASCRIPT-NEXTJS-19, /sell/onboarding via a Polish reader).
    //
    // `app://` is the scheme Android in-app browsers use for the scripts they
    // inject into whatever page you opened from their feed. Facebook's
    // navigation_performance_logger_android throws "Java object is gone" from
    // its own beforeunload handler when the user leaves the page and the
    // native bridge has already been collected (Sentry JAVASCRIPT-NEXTJS-2P,
    // homepage, Facebook 572 on Android 16). The user is mid-exit and sees
    // nothing; we cannot fix or influence code we do not ship. Denying the
    // whole scheme covers every in-app browser, not just this one.
    denyUrls: [
      /\/translate_http\//,
      /translate\.googleapis\.com/,
      /^app:\/\//,
    ],
  })
}

// Instruments client-side navigations so route changes are traced.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
