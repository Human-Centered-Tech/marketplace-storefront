// Android App Links digital asset link for the Catholic Owned Android app.
// The fingerprint below is the EAS upload/signing certificate, which is correct
// for internal / direct-APK distribution.
// IMPORTANT: if/when the app ships via Google Play with Play App Signing, the
// Play Console "App signing key certificate" SHA-256 must ALSO be added to this
// array (Play re-signs the app, so its certificate differs from this one).
import { NextResponse } from "next/server"

export const dynamic = "force-static"

export async function GET() {
  return NextResponse.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.catholicowned.catholicowned",
        sha256_cert_fingerprints: [
          "9E:95:A7:3F:31:0F:26:28:E3:0F:25:89:5B:FA:85:66:0B:FA:BF:13:D6:58:44:BC:C0:2F:1F:19:0E:6C:B9:53",
        ],
      },
    },
  ])
}
