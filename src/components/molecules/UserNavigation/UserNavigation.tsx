"use client"
import {
  Badge,
  Card,
  Divider,
  LogoutButton,
  NavigationItem,
} from "@/components/atoms"
import { useUnreads } from "@talkjs/react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const VENDOR_URL = process.env.NEXT_PUBLIC_VENDOR_URL || "/vendor"

function useIsVendor(): boolean {
  const [isVendor, setIsVendor] = useState(false)
  useEffect(() => {
    setIsVendor(document.cookie.includes("_is_vendor=true"))
  }, [])
  return isVendor
}

const navigationItems = [
  {
    label: "Orders",
    href: "/user/orders",
  },
  {

    label: "Messages",
    href: "/user/messages",
  },
  {
    label: "Returns",
    href: "/user/returns",
  },
  {
    label: "Addresses",
    href: "/user/addresses",
  },
  {
    label: "Reviews",
    href: "/user/reviews",
  },
  {
    label: "Wishlist",
    href: "/user/wishlist",
  },
  {
    label: "My Directory",
    href: "/user/directory",
  },
  {
    label: "My Registries",
    href: "/user/registry",
  },
]

export const UserNavigation = () => {
  const unreads = useUnreads()
  const path = usePathname()
  const isVendor = useIsVendor()

  return (
    <Card className="h-min">
      {navigationItems.map((item) => (
        <NavigationItem
          key={item.label}
          href={item.href}
          active={path === item.href}
          className="relative"
        >
          {item.label}
          {item.label === "Messages" && Boolean(unreads?.length) && (
            <Badge className="absolute top-3 left-24 w-4 h-4 p-0">
              {unreads?.length}
            </Badge>
          )}
        </NavigationItem>
      ))}
      <Divider className="my-2" />
      <NavigationItem
        href={"/user/settings"}
        active={path === "/user/settings"}
      >
        Settings
      </NavigationItem>
      {isVendor ? (
        <a
          href={VENDOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-4 py-2 text-sm text-primary hover:bg-[rgba(var(--neutral-50))] transition-colors"
        >
          Vendor Dashboard
        </a>
      ) : (
        <NavigationItem
          href="/user/become-vendor"
          active={path === "/user/become-vendor"}
        >
          Become a Vendor
        </NavigationItem>
      )}
      <LogoutButton className="w-full text-left" />
    </Card>
  )
}
