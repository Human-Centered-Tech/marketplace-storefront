"use client"

import {
  Badge,
  Divider,
  LogoutButton,
  NavigationItem,
} from "@/components/atoms"
import { Dropdown } from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ProfileIcon } from "@/icons"
import { HttpTypes } from "@medusajs/types"
import { useUnreadMessages } from "@/lib/hooks/useUnreadMessages"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export const UserDropdown = ({
  user,
  isVendor = false,
}: {
  user: HttpTypes.StoreCustomer | null
  isVendor?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const unreadCount = useUnreadMessages()

  // Touch devices at desktop widths (iPad landscape ≥ lg) fire mouseover on
  // tap but never mouseleave, so the hover menu stuck open — e.g. over the
  // account page's own side nav ("two menus", Matteo 7/3). Close it whenever
  // the route changes and on any tap outside.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div
      ref={containerRef}
      // lg-only `relative`: on mobile the Dropdown must position against the
      // sticky header (nearest positioned ancestor), not this icon wrapper.
      className="lg:relative"
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
    >
      <LocalizedClientLink
        href="/user"
        className="relative"
        aria-label="Go to user profile"
      >
        <ProfileIcon size={20} />
      </LocalizedClientLink>
      {/* Desktop-only: this is a hover menu with no touch dismissal (closes on
          mouseleave), so on mobile it opened full-width over the page and stuck
          there (Matteo 7/3). On phones the profile icon just navigates to
          /user, which lists the same destinations. */}
      <Dropdown show={open} className="max-lg:hidden">
        {user ? (
          <div className="p-1">
            <div className="lg:w-[200px]">
              <h3 className="uppercase heading-xs border-b p-4">
                Your account
              </h3>
            </div>
            <NavigationItem href="/user">My Account</NavigationItem>
            <NavigationItem href="/user/orders">Orders</NavigationItem>
            <NavigationItem href="/user/messages" className="relative">
              Messages
              {unreadCount > 0 && (
                <Badge className="absolute top-3 left-24 w-4 h-4 p-0">
                  {unreadCount}
                </Badge>
              )}
            </NavigationItem>
            <NavigationItem href="/user/returns">Returns</NavigationItem>
            <NavigationItem href="/user/addresses">Addresses</NavigationItem>
            <NavigationItem href="/user/reviews">Reviews</NavigationItem>
            <NavigationItem href="/user/wishlist">Wishlist</NavigationItem>
            <NavigationItem href="/user/registry">My Registries</NavigationItem>
            <Divider />
            <NavigationItem href="/user/settings">Settings</NavigationItem>
            {isVendor ? (
              <a
                href="/api/vendor-handoff"
                className="label-md uppercase px-4 py-3 my-3 md:my-0 flex items-center justify-between"
              >
                Merchant Dashboard
              </a>
            ) : (
              <NavigationItem href="/sell">
                Become a Merchant
              </NavigationItem>
            )}
            <Divider />
            <LogoutButton />
          </div>
        ) : (
          <div className="p-1">
            <NavigationItem href="/user">Login</NavigationItem>
            <NavigationItem href="/user/register">Register</NavigationItem>
          </div>
        )}
      </Dropdown>
    </div>
  )
}
