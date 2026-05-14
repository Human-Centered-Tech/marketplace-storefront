import { NextResponse } from "next/server"
import { retrieveVendorStatus } from "@/lib/data/vendor"

/**
 * Thin wrapper around retrieveVendorStatus so client components can
 * verify vendor status against the backend (not just cookie state).
 * Used by UserNavigation's useIsVendor hook to avoid showing the
 * "Merchant Dashboard" link to non-vendors whose stale `_is_vendor`
 * cookie would otherwise lie.
 */
export async function GET() {
  const status = await retrieveVendorStatus()
  return NextResponse.json({ is_vendor: status.isVendor })
}
