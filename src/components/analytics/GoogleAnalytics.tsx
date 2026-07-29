"use client"

import Script from "next/script"
import { Suspense } from "react"

import { useConsent } from "@/components/consent/ConsentProvider"
import { EEA_REGION_CODES } from "@/lib/consent"

import { PageViewTracker } from "./PageViewTracker"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

/**
 * Google Analytics 4 (gtag.js) integration.
 *
 * Gated twice over:
 *
 * 1. `NEXT_PUBLIC_GA_ID` — unset/empty renders NOTHING, so this ships dormant
 *    and is safe to deploy before the measurement id exists.
 * 2. Cookie consent — for visitors who look EEA/UK, nothing here renders until
 *    they click Accept. Everyone else loads GA immediately, as before.
 *
 * Belt and braces on top of (2): the init script declares Google Consent Mode
 * v2 defaults, denied for the EEA/UK region list and granted elsewhere. That
 * uses Google's own IP geolocation, so a European visitor our time-zone
 * heuristic misclassifies still gets a cookieless, default-denied tag rather
 * than silent tracking.
 *
 * Note ad_storage/ad_user_data/ad_personalization stay denied everywhere — we
 * run analytics only, no ads or remarketing. If Google Ads tags are ever added,
 * they need their own opt-in here and a CONSENT_VERSION bump to re-prompt.
 */
export default function GoogleAnalytics() {
  const { analyticsAllowed, analyticsExplicitlyGranted } = useConsent()

  if (!GA_ID || !analyticsAllowed) {
    return null
  }

  const eeaRegions = JSON.stringify(EEA_REGION_CODES)

  return (
    <>
      {/* Init first: `consent default` must be queued onto dataLayer ahead of
          `config`. Both commands live in this one inline script, so their
          relative order holds regardless of when gtag.js finishes loading. */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted',
            region: ${eeaRegions},
            wait_for_update: 500
          });
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted',
            functionality_storage: 'granted',
            security_storage: 'granted'
          });
          ${
            analyticsExplicitlyGranted
              ? `gtag('consent', 'update', { analytics_storage: 'granted' });`
              : ``
          }
          gtag('js', new Date());
          // send_page_view:false — the client PageViewTracker fires every
          // page_view (including the initial load) so App Router client-side
          // navigations are counted and the first view isn't double-sent.
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
      <Script
        id="ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      {/* useSearchParams() must live inside a Suspense boundary. */}
      <Suspense fallback={null}>
        <PageViewTracker gaId={GA_ID} />
      </Suspense>
    </>
  )
}
