import type { NextConfig } from "next"

// CJS require to match this file's `module.exports` style. withSentryConfig
// wires source-map/build support around the runtime SDK (instrumentation*.ts).
// Without a SENTRY_AUTH_TOKEN it simply skips source-map upload (warns, does
// not fail the build).
const { withSentryConfig } = require("@sentry/nextjs")

function backendImageHost() {
  const url =
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (!url) return null
  try {
    const u = new URL(url)
    return {
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
    }
  } catch {
    return null
  }
}

const nextConfig: NextConfig = {
  // Keep jsdom (pulled in by isomorphic-dompurify, used to sanitize product
  // descriptions server-side) OUT of the server bundle. When Next bundles it,
  // jsdom's relative asset path (browser/default-stylesheet.css) breaks and
  // `next build` fails during static generation with ENOENT. Loading it from
  // node_modules keeps its assets intact.
  serverExternalPackages: ["jsdom", "isomorphic-dompurify"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: false,
  reactStrictMode: true,
  /**
   * Security response headers (9/7 audit). Verified live that day: the
   * storefront sent NO Content-Security-Policy, NO Strict-Transport-Security,
   * NO X-Frame-Options and NO X-Content-Type-Options — so /cart, /user/login
   * and the whole checkout were embeddable in a third-party iframe, i.e. a
   * clickjackable real card form.
   *
   * These carry no compatibility risk for how this app actually works:
   * nothing in src renders an <iframe> (every frame on the site is created by
   * Stripe INSIDE our page, which X-Frame-Options does not touch — that
   * header governs who may frame US), and the third-party handoffs (Stripe
   * Checkout, Stripe Connect onboarding, Google/Apple OAuth, the vendor
   * panel) are all top-level `window.location` navigations, which none of
   * these headers restrict.
   *
   * HSTS: `includeSubDomains` reaches every *.catholicowned.com host — www,
   * v3, members (vendor panel) and the Railway backend are HTTPS-only, so it
   * is safe today. `preload` is deliberately NOT set: that is a one-way door
   * (browser-baked, slow to undo) and belongs to a human decision, not a
   * config change. If a plain-HTTP subdomain is ever needed, drop
   * `includeSubDomains` BEFORE this ships.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // SAMEORIGIN rather than DENY: nothing frames us today, but our own
          // future embeds (a preview pane) shouldn't be pre-broken.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Full URL same-origin, bare origin cross-site. Google Maps' browser
          // key is referrer-restricted and only needs the origin, so this does
          // not break the directory maps.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Only capabilities nothing uses. Geolocation is deliberately NOT
          // denied (src/hooks/useUserLocation.tsx uses it for directory
          // "near me"), and `payment` is left alone so Stripe keeps its
          // wallet flows.
          { key: "Permissions-Policy", value: "camera=(), microphone=()" },
        ],
      },
    ]
  },
  // "Gift Guides" feature renamed to "Guides" (2026-06-24). Keep old /gifts
  // links alive (old app builds open the web guide, plus shared URLs / SEO)
  // by redirecting them to the new /guides path.
  async redirects() {
    return [
      { source: "/gifts", destination: "/guides", permanent: true },
      { source: "/gifts/:path*", destination: "/guides/:path*", permanent: true },
      { source: "/:locale/gifts", destination: "/:locale/guides", permanent: true },
      {
        source: "/:locale/gifts/:path*",
        destination: "/:locale/guides/:path*",
        permanent: true,
      },
      // /landing circulates externally as the business signup link, but the
      // sales page shipped at /sell (the interim /for-business page was
      // removed as redundant). Keep those shared links working instead of
      // 404ing (Sentry JAVASCRIPT-NEXTJS-M).
      { source: "/landing", destination: "/sell", permanent: true },
      { source: "/:locale/landing", destination: "/:locale/sell", permanent: true },
      // Google Play's Data-Safety form pointed at /support_page for years —
      // Google's compliance crawler 404'd on it 7/10 ("Invalid account
      // deletion link", fix-by 7/24). The real fix is updating the form to
      // /account-deletion; these keep any stale references working forever.
      { source: "/support_page", destination: "/account-deletion", permanent: true },
      {
        source: "/:locale/support_page",
        destination: "/:locale/account-deletion",
        permanent: true,
      },
    ]
  },
  experimental: {
    serverActions: {
      // Directory-listing images are uploaded through a server action
      // (uploadDirectoryImage), and Next's default body cap is 1MB — which
      // rejects ordinary phone photos with a 413 before they ever reach the
      // backend. Raise to 10MB to match the backend route's own MAX_BYTES.
      // Images are resized/compressed server-side before storage, so this
      // gate does not translate into 10MB objects in the bucket.
      bodySizeLimit: "10mb",
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "mercur-connect.s3.eu-central-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "api.mercurjs.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "192.168.86.70",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api-sandbox.mercurjs.com",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "s3.eu-central-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // Shopify-hosted product images from CSV imports (Pax Rosa etc.) —
      // thumbnails in the DB/Algolia point straight at Shopify's CDN.
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      // Etsy-hosted product images (merchants reusing their Etsy listing
      // photos) — 20 in the catalog as of 7/3; cards rendered blank without
      // this. Full-catalog host sweep 7/3: v3-cdn + shopify + etsy only.
      {
        protocol: "https",
        hostname: "i.etsystatic.com",
      },
      ...(process.env.NEXT_PUBLIC_MINIO_ENDPOINT ? [{
        protocol: "https" as const,
        hostname: process.env.NEXT_PUBLIC_MINIO_ENDPOINT,
      }] : []),
      ...(backendImageHost() ? [backendImageHost()!] : []),
      // Railway-generated subdomains for any service (e.g. the auto-assigned
      // bucket domain). Existing image URLs in the DB may reference these
      // even after a custom CDN domain is wired up.
      {
        protocol: "https",
        hostname: "**.up.railway.app",
      },
    ],
  },
}

module.exports = withSentryConfig(nextConfig, {
  // No tunnelRoute: the storefront uses /[locale] routing + middleware, and a
  // tunnel path would risk colliding with it. Errors send directly to Sentry.
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  telemetry: false,
})
