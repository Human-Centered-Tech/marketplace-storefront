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
