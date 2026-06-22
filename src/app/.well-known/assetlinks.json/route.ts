// Android App Links digital asset link for the Catholic Owned Android app.
// Two fingerprints, because the cert the INSTALLED app carries depends on how
// it was distributed:
//   - 9E:95:A7:... = the upload key (credentials/upload-keystore.jks, the key
//     EAS signs with). Matches sideloaded / internal-distribution builds.
//   - DE:2F:6C:... = the Google Play App Signing key (Play re-signs store
//     downloads with this). Matches builds installed from Google Play.
// Both are needed so App Links verify regardless of install path.
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
          // Upload key (EAS-signed internal builds)
          "9E:95:A7:3F:31:0F:26:28:E3:0F:25:89:5B:FA:85:66:0B:FA:BF:13:D6:58:44:BC:C0:2F:1F:19:0E:6C:B9:53",
          // Google Play App Signing key (Play Store installs)
          "DE:2F:6C:31:14:2F:F7:05:AB:EC:B9:4E:7F:DB:C2:83:ED:5B:6E:4F:AB:39:E1:AE:86:3D:88:50:92:DA:1B:02",
        ],
      },
    },
  ])
}
