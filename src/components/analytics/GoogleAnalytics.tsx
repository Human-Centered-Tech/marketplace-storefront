import Script from "next/script"
import { Suspense } from "react"

import { PageViewTracker } from "./PageViewTracker"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

/**
 * Google Analytics 4 (gtag.js) integration.
 *
 * Entirely gated on NEXT_PUBLIC_GA_ID (e.g. "G-XXXXXXX"): if the env var is
 * unset/empty this renders NOTHING, so it ships dormant and is safe to deploy
 * before the measurement id exists.
 *
 * NOTE (consent): the storefront has no cookie-consent / privacy banner at the
 * moment, so GA is only env-gated here. If/when a consent mechanism is added,
 * gate the render below (and the PageViewTracker) on the consent flag so this
 * non-essential analytics only loads after the user opts in.
 */
export default function GoogleAnalytics() {
  if (!GA_ID) {
    return null
  }

  return (
    <>
      <Script
        id="ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          // send_page_view:false — the client PageViewTracker fires every
          // page_view (including the initial load) so App Router client-side
          // navigations are counted and the first view isn't double-sent.
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
      {/* useSearchParams() must live inside a Suspense boundary. */}
      <Suspense fallback={null}>
        <PageViewTracker gaId={GA_ID} />
      </Suspense>
    </>
  )
}
