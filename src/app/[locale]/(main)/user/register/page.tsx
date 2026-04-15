import { RegisterForm } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { redirect } from "next/navigation"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ vendor?: string; return_to?: string }>
}) {
  const user = await retrieveCustomer()
  const { vendor, return_to } = await searchParams

  if (user) {
    if (vendor === "true") {
      redirect("/user/become-vendor")
    }
    redirect(return_to && return_to.startsWith("/") ? return_to : "/user")
  }

  return <RegisterForm vendorFlow={vendor === "true"} />
}
