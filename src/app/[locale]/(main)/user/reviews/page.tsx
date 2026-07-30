import { LoginForm, UserNavigation } from "@/components/molecules"
import { ReviewsToWrite } from "@/components/organisms"
import { retrieveCustomer } from "@/lib/data/customer"
import { listOrders } from "@/lib/data/orders"
import { pendingReviewTargets } from "@/lib/review-targets"

export default async function Page() {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const orders = await listOrders()

  if (!orders) return null

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        {/* An order stays here while ANY of its targets is unreviewed — the
            seller plus each distinct product. The old test was
            `order.reviews.length === 0`, which dropped the whole order the
            moment one review was written, so per-product reviews were
            unreachable on web. */}
        <ReviewsToWrite
          orders={orders.filter(
            (order) => pendingReviewTargets(order).length > 0
          )}
        />
      </div>
    </main>
  )
}
