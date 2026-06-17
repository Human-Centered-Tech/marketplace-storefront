import { LoginForm } from "@/components/molecules"
import { UserNavigation } from "@/components/molecules/UserNavigation/UserNavigation"
import { OrderReturnRequests } from "@/components/sections/OrderReturnRequests/OrderReturnRequests"
import { retrieveCustomer } from "@/lib/data/customer"
import { getReturns, retrieveReturnReasons } from "@/lib/data/orders"

export default async function ReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string; return: string }>
}) {
  // Gate to login before hitting protected endpoints. getReturns() /
  // retrieveReturnReasons() throw (401 → medusaError) when unauthenticated,
  // which crashed the whole page's error boundary instead of showing login —
  // mirror the orders page which retrieves the customer first.
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const { order_return_requests } = await getReturns()
  const returnReasons = await retrieveReturnReasons()

  const { page, return: returnId } = await searchParams

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3">
          <h1 className="heading-md uppercase">Returns</h1>
          <OrderReturnRequests
            returns={order_return_requests.sort((a, b) => {
              // Guard against return requests with no line_items so a single
              // malformed record can't throw and crash the page.
              return (
                new Date(b.line_items?.[0]?.created_at ?? 0).getTime() -
                new Date(a.line_items?.[0]?.created_at ?? 0).getTime()
              )
            })}
            user={user}
            page={page}
            currentReturn={returnId || ""}
            returnReasons={returnReasons}
          />
        </div>
      </div>
    </main>
  )
}
