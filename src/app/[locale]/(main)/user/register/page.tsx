import { RegisterForm } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { redirect } from "next/navigation"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ vendor?: string }>
}) {
  const user = await retrieveCustomer()
  const { vendor } = await searchParams

  if (user) {
    redirect(vendor === "true" ? "/user/become-vendor" : "/user")
  }

  return <RegisterForm vendorFlow={vendor === "true"} />
}
