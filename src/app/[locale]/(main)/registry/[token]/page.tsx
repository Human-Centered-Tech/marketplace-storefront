import { getSharedRegistry } from "@/lib/data/registry"
import type { Metadata } from "next"
import { MarkPurchasedButton } from "./MarkPurchasedButton"

type Props = {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const registry = await getSharedRegistry(token)
  return {
    title: registry?.title || "Gift Registry",
  }
}

const sacramentLabels: Record<string, string> = {
  wedding: "Wedding",
  baptism: "Baptism",
  first_communion: "First Communion",
  confirmation: "Confirmation",
  ordination: "Ordination",
  other: "Other",
}

export default async function SharedRegistryPage({ params }: Props) {
  const { token } = await params
  const registry = await getSharedRegistry(token)

  if (!registry) {
    return (
      <main className="container py-12 text-center">
        <h1 className="heading-xl text-primary mb-4">Registry Not Found</h1>
        <p className="text-secondary">
          This registry may have been removed or the link is invalid.
        </p>
      </main>
    )
  }

  return (
    <main className="container py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        {registry.cover_image_url && (
          <div className="aspect-[3/1] overflow-hidden rounded-sm mb-6">
            <img
              src={registry.cover_image_url}
              alt={registry.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className="heading-xl text-primary">{registry.title}</h1>
        <p className="text-sm text-secondary mt-2">
          {sacramentLabels[registry.sacrament_type] || registry.sacrament_type}
          {registry.event_date &&
            ` | ${new Date(registry.event_date).toLocaleDateString()}`}
        </p>
        {registry.description && (
          <p className="text-secondary mt-4 max-w-2xl mx-auto">
            {registry.description}
          </p>
        )}
      </div>

      {/* Status */}
      {registry.status !== "active" && (
        <div className="bg-gray-100 border rounded-sm p-4 text-center mb-6">
          <p className="text-secondary text-sm">
            This registry is currently{" "}
            <span className="font-medium">{registry.status}</span>.
          </p>
        </div>
      )}

      {/* Items */}
      <div>
        <h2 className="heading-md text-primary mb-4">
          Gift Items ({registry.items?.length || 0})
        </h2>

        {registry.items?.length > 0 ? (
          <div className="space-y-3">
            {registry.items.map((item) => {
              const fulfilled =
                item.quantity_purchased >= item.quantity_desired
              const remaining =
                item.quantity_desired - item.quantity_purchased

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border rounded-sm p-4"
                >
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_title}
                      className="w-20 h-20 object-cover rounded-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-primary">
                      {item.product_title}
                    </h3>
                    {item.note && (
                      <p className="text-xs text-secondary mt-0.5">
                        {item.note}
                      </p>
                    )}
                    <p className="text-xs text-secondary mt-1">
                      {item.quantity_purchased} of {item.quantity_desired}{" "}
                      purchased
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    {fulfilled ? (
                      <span className="text-xs px-3 py-1.5 bg-green-100 text-green-800 rounded border border-green-300">
                        Fulfilled
                      </span>
                    ) : registry.status === "active" ? (
                      <MarkPurchasedButton
                        token={token}
                        itemId={item.id}
                        remaining={remaining}
                      />
                    ) : (
                      <span className="text-xs px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
                        {remaining} needed
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-secondary border rounded-sm p-6 text-center">
            No items have been added to this registry yet.
          </p>
        )}
      </div>
    </main>
  )
}
