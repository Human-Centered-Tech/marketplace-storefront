import { HttpTypes } from "@medusajs/types"
import { CategoryNavbar, NavbarSearch } from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const Navbar = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) => {
  return (
    <div className="flex border py-4 justify-between px-6">
      <div className="hidden md:flex items-center">
        <CategoryNavbar categories={categories} />
        <LocalizedClientLink
          href="/directory"
          className="label-md uppercase px-4 flex items-center"
        >
          Directory
        </LocalizedClientLink>
      </div>

      <NavbarSearch />
    </div>
  )
}
