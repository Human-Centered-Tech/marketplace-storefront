import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

import { CartDropdown, MobileNavbar } from "@/components/cells"
import { HeartIcon } from "@/icons"
import { SearchBar } from "@/components/molecules/SearchBar/SearchBar"
import { listCategories } from "@/lib/data/categories"
import { PARENT_CATEGORIES } from "@/const"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import { retrieveCustomer } from "@/lib/data/customer"
import { retrieveVendorStatus } from "@/lib/data/vendor"
import { getUserWishlists } from "@/lib/data/wishlist"
import { Wishlist } from "@/types/wishlist"
import { Badge } from "@/components/atoms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { MessageButton } from "@/components/molecules/MessageButton/MessageButton"

export const Header = async () => {
  const user = await retrieveCustomer()
  const vendorStatus = user ? await retrieveVendorStatus() : null
  const isVendor = vendorStatus?.isVendor ?? false
  let wishlist: Wishlist[] = []
  if (user) {
    try {
      const response = await getUserWishlists()
      wishlist = response.wishlists
    } catch {
      // Wishlist service unavailable — continue without it
    }
  }

  const wishlistCount = wishlist?.[0]?.products.length || 0

  const { categories, parentCategories } = (await listCategories({
    headingCategories: PARENT_CATEGORIES,
  })) as {
    categories: HttpTypes.StoreProductCategory[]
    parentCategories: HttpTypes.StoreProductCategory[]
  }

  return (
    <header className="border-b border-[rgba(var(--neutral-100))] bg-[rgba(var(--neutral-0),0.95)] backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center py-3 lg:px-8 px-4">
        {/* Left — Logo */}
        <div className="flex items-center lg:w-1/4">
          <MobileNavbar
            parentCategories={parentCategories}
            childrenCategories={categories}
          />
          <LocalizedClientLink href="/" className="flex items-center">
            <Image
              src="/Logo.png"
              width={140}
              height={70}
              alt="Catholic Owned"
              priority
            />
          </LocalizedClientLink>
        </div>

        {/* Center — Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-8 flex-1">
          <LocalizedClientLink
            href="/categories"
            className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary hover:text-action transition-colors"
          >
            Shop
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/directory"
            className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary hover:text-action transition-colors"
          >
            Directory
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/networking"
            className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary hover:text-action transition-colors"
          >
            Events
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/barter"
            className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary hover:text-action transition-colors"
          >
            About
          </LocalizedClientLink>
        </nav>

        {/* Right — Actions */}
        <div className="flex items-center justify-end gap-3 lg:gap-4 lg:w-1/4">
          <SearchBar variant="header" placeholder="Search curated goods..." />
          <CartDropdown />
          {user && (
            <LocalizedClientLink href="/user/wishlist" className="relative">
              <HeartIcon size={20} />
              {Boolean(wishlistCount) && (
                <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0">
                  {wishlistCount}
                </Badge>
              )}
            </LocalizedClientLink>
          )}
          {user && <MessageButton />}
          <UserDropdown user={user} isVendor={isVendor} />
          {!user && (
            <LocalizedClientLink
              href="/user/register"
              className="hidden lg:inline-flex items-center px-5 py-2.5 bg-navy text-white text-[12px] font-semibold uppercase tracking-[0.1em] rounded-xs hover:bg-navy-dark transition-colors"
            >
              Join the Economy
            </LocalizedClientLink>
          )}
        </div>
      </div>
    </header>
  )
}
