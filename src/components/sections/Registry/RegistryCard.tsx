"use client"

import { GiftRegistry } from "@/types/registry"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

const sacramentLabels: Record<string, string> = {
  wedding: "Wedding",
  baptism: "Baptism",
  first_communion: "First Communion",
  confirmation: "Confirmation",
  ordination: "Ordination",
  other: "Other",
}

const statusBadgeStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-300",
  closed: "bg-gray-100 text-gray-800 border-gray-300",
  archived: "bg-yellow-100 text-yellow-800 border-yellow-300",
}

export const RegistryCard = ({ registry }: { registry: GiftRegistry }) => {
  const itemCount = registry.items?.length ?? 0
  const purchasedCount =
    registry.items?.filter((i) => i.quantity_purchased >= i.quantity_desired)
      .length ?? 0

  return (
    <LocalizedClientLink
      href={`/user/registry/${registry.id}`}
      className="block border rounded-sm hover:shadow-md transition-shadow"
    >
      {registry.cover_image_url ? (
        <div className="aspect-[16/9] overflow-hidden rounded-t-sm">
          <img
            src={registry.cover_image_url}
            alt={registry.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gray-100 rounded-t-sm flex items-center justify-center">
          <span className="text-gray-400 text-lg">
            {sacramentLabels[registry.sacrament_type] || "Registry"}
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="heading-xs text-primary line-clamp-1">
            {registry.title}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${
              statusBadgeStyles[registry.status] || statusBadgeStyles.active
            }`}
          >
            {registry.status}
          </span>
        </div>

        <p className="label-sm text-secondary mb-1">
          {sacramentLabels[registry.sacrament_type] || registry.sacrament_type}
        </p>

        {registry.event_date && (
          <p className="text-xs text-secondary mb-1">
            Event: {new Date(registry.event_date).toLocaleDateString()}
          </p>
        )}

        {registry.description && (
          <p className="text-sm text-secondary line-clamp-2 mb-2">
            {registry.description}
          </p>
        )}

        <p className="text-xs text-secondary">
          {purchasedCount}/{itemCount} items fulfilled
        </p>
      </div>
    </LocalizedClientLink>
  )
}
