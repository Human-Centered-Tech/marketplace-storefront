"use client"

import { usePathname } from "next/navigation"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

/**
 * "For Businesses" CTA button shown in the storefront Header for
 * logged-out visitors. Click destination is path-aware:
 *   - From any page that is NOT the sales page → /sell (the pitch page)
 *   - From the sales page itself → /sell/onboarding (skip the pitch,
 *     drop straight into the funnel)
 *
 * Encoded as a client component so we can read usePathname() — the
 * Header that hosts this is an async server component.
 */
export const ForBusinessLink = () => {
  const pathname = usePathname() || ""
  // Locale prefix is part of the path (e.g. `/us/sell`); accept any
  // locale by checking for a `/sell` segment that isn't already
  // pointing at onboarding.
  const onSellPage =
    /^\/[a-z]{2}\/sell\/?$/i.test(pathname) || pathname === "/sell"
  const href = onSellPage ? "/sell/onboarding" : "/sell"

  return (
    <LocalizedClientLink
      href={href}
      className="hidden lg:inline-flex items-center px-5 py-2.5 bg-navy text-white text-[12px] font-semibold uppercase tracking-[0.1em] rounded-xs hover:bg-navy-dark transition-colors"
    >
      For Businesses
    </LocalizedClientLink>
  )
}
