// Apple App Site Association for the Catholic Owned iOS app
// (Team ID W33AF4DBM3, bundle com.catholicowned.catholicowned). Serving this
// at the domain root lets the app open catholicowned.com links natively via
// iOS Universal Links: auth links (reset-password/verify-email) plus shared
// content (directory listings, products, events, sellers, registries, guides,
// trade). Path mapping web->app screens lives in the mobile repo's
// app/+native-intent.ts. Apple caches this file via its CDN — changes can take
// up to a day to reach devices.
import { NextResponse } from "next/server"

export const dynamic = "force-static"

// Bare + locale-prefixed ("/us/...") variants of every claimed section.
const CLAIMED_SECTIONS = [
  "reset-password",
  "verify-email",
  "directory",
  "products",
  "networking",
  "sellers",
  "registry",
  "guides",
  "trade",
]

export async function GET() {
  return NextResponse.json({
    applinks: {
      apps: [],
      details: [
        {
          appID: "W33AF4DBM3.com.catholicowned.catholicowned",
          paths: CLAIMED_SECTIONS.flatMap((s) => [
            `/${s}`,
            `/${s}/*`,
            `/*/${s}`,
            `/*/${s}/*`,
          ]),
        },
      ],
    },
  })
}
