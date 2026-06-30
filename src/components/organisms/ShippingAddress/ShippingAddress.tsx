import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/atoms"
import AddressSelect from "@/components/cells/AddressSelect/AddressSelect"
import CountrySelect from "@/components/cells/CountrySelect/CountrySelect"
import { usePathname } from "next/navigation"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const pathname = usePathname()

  const locale = pathname.split("/")[1]
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code":
      cart?.shipping_address?.country_code || locale,
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  // check if customer has saved addresses that are in the current region.
  // Optional-chain `addresses` too — Medusa doesn't always eagerly load
  // it, and the downstream usages already handle undefined.
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses?.filter(
        (a) => a.country_code && a.country_code === locale
      ),
    [customer?.addresses]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || locale,
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    // Logged-in shopper: the checkout email is ALWAYS the account email (the
    // field below is locked). Forcing it here means a stale/mismatched cart
    // email can never reach the order — pairs with the backend cart-identity
    // guard so a logged-in checkout can't detach to a guest under a typed email.
    if (customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart, customer?.email])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-0">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4">
            <AddressSelect
              addresses={addressesInRegion || []}
              addressInput={
                mapKeys(formData, (_, key) =>
                  key.replace("shipping_address.", "")
                ) as HttpTypes.StoreCartAddress
              }
              onSelect={setFormAddress}
            />
          </div>
        </Container>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Input
          label="First name"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Last name"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
        <Input
          label="Address"
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="shipping-address-input"
        />
        <Input
          label="Company"
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
        />
        <Input
          label="Postal code"
          name="shipping_address.postal_code"
          autoComplete="postal-code"
          value={formData["shipping_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-postal-code-input"
        />
        <Input
          label="City"
          name="shipping_address.city"
          autoComplete="address-level2"
          value={formData["shipping_address.city"]}
          onChange={handleChange}
          required
          data-testid="shipping-city-input"
        />
        <CountrySelect
          name="shipping_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["shipping_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-country-select"
        />
        <Input
          label="State / Province"
          name="shipping_address.province"
          autoComplete="address-level1"
          value={formData["shipping_address.province"]}
          onChange={handleChange}
          data-testid="shipping-province-input"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 my-4">
        <Input
          label={customer ? "Email (your account)" : "Email"}
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          value={customer?.email ?? formData.email}
          onChange={handleChange}
          required
          // Logged in → lock to the account email (readOnly keeps it in the
          // submitted FormData, unlike disabled). Guests must type a valid one.
          readOnly={!!customer}
          data-testid="shipping-email-input"
        />
        <Input
          label="Phone"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          data-testid="shipping-phone-input"
        />
      </div>
      {/* Marketing opt-in — per 3/24 decision, default checked on guest
          checkout. Only shown when customer is null (guest). */}
      {!customer && (
        <div className="mb-2">
          <label className="flex items-start gap-2 text-sm text-secondary">
            <input
              type="checkbox"
              name="marketing_opt_in"
              defaultChecked
              className="mt-1"
            />
            <span>
              Keep me posted on new Catholic Owned products, seasonal gift
              guides, and upcoming networking events. You can unsubscribe
              any time.
            </span>
          </label>
        </div>
      )}
    </>
  )
}

export default ShippingAddress
