"use client"

import { GiftRegistryItem } from "@/types/registry"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const RegistryItemRow = ({
  item,
  onDelete,
  isOwner = false,
}: {
  item: GiftRegistryItem
  onDelete?: (itemId: string) => void
  isOwner?: boolean
}) => {
  const fulfilled = item.quantity_purchased >= item.quantity_desired

  return (
    <div className="flex items-center gap-4 border rounded-sm p-4">
      {item.product_image ? (
        <img
          src={item.product_image}
          alt={item.product_title}
          className="w-16 h-16 object-cover rounded-sm flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0">
          <span className="text-gray-400 text-xs">No img</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-navy-dark truncate">
          {item.product_id ? (
            <LocalizedClientLink
              href={`/products/${item.product_id}`}
              className="hover:text-gold-dark underline underline-offset-2 decoration-gold/30 transition-colors"
            >
              {item.product_title}
            </LocalizedClientLink>
          ) : (
            item.product_title
          )}
        </h4>
        {item.note && (
          <p className="text-xs text-secondary mt-0.5 line-clamp-1">
            {item.note}
          </p>
        )}
        <p className="text-xs text-secondary mt-1">
          {item.quantity_purchased} / {item.quantity_desired} purchased
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {fulfilled ? (
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded border border-green-300">
            Fulfilled
          </span>
        ) : (
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
            {item.quantity_desired - item.quantity_purchased} needed
          </span>
        )}

        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(item.id)}
            className="text-red-600 hover:text-red-800 text-xs underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
