"use client"

import { usePathname } from "next/navigation"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

/**
 * "For Businesses" CTA button shown in the storefront Header for
 * logged-out visitors, on phones as well as desktop. Click destination is
 * path-aware:
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
      // Shown at every width (Liam 9/7: Brooke wants the sell CTA reachable
      // from a phone; the hamburger menu has no For Businesses entry).
      // Compact below lg so it fits beside the cart and account icons; under
      // 360px it would squeeze the logo to a sliver, so it drops out there.
      className="hidden min-[360px]:inline-flex items-center whitespace-nowrap px-3 py-2 text-[11px] tracking-[0.06em] lg:px-5 lg:py-2.5 lg:text-[12px] lg:tracking-[0.1em] bg-navy text-white font-semibold uppercase rounded-xs hover:bg-navy-dark transition-colors"
    >
      For Businesses
    </LocalizedClientLink>
  )
}
