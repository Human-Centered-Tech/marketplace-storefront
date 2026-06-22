// Apple App Site Association for the Catholic Owned iOS app
// (Team ID W33AF4DBM3, bundle com.catholicowned.catholicowned). Serving this
// at the domain root lets the app open catholicowned.com reset-password and
// verify-email links natively via iOS Universal Links.
import { NextResponse } from "next/server"

export const dynamic = "force-static"

export async function GET() {
  return NextResponse.json({
    applinks: {
      apps: [],
      details: [
        {
          appID: "W33AF4DBM3.com.catholicowned.catholicowned",
          paths: [
            "/reset-password",
            "/verify-email",
            "/*/reset-password",
            "/*/verify-email",
          ],
        },
      ],
    },
  })
}
