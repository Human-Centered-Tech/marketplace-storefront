import {
  ProductPostedDate,
  ProductReportButton,
  ProductTags,
} from "@/components/molecules"
import { HttpTypes } from "@medusajs/types"

/**
 * NOTE (9/7 audit): this cell is exported but not currently mounted by
 * ProductDetailsPage — the live "Report listing" affordance on a product page
 * is ProductReportRow. Kept because it is the tags+posted+report footer the
 * design still calls for; it now passes a real report target through so it
 * cannot silently regress to the console.log form again.
 */
export const ProductDetailsFooter = ({
  tags = [],
  posted,
  productId,
  productTitle,
  productHandle,
}: {
  tags?: HttpTypes.StoreProductTag[]
  posted: HttpTypes.StoreProduct["created_at"]
  productId: string
  productTitle: string
  productHandle: string
}) => {
  return (
    <>
      <div className="p-4 border rounded-sm">
        <ProductTags tags={tags} />
        <div className="flex justify-between items-center mt-4">
          <ProductPostedDate posted={posted} />
          <ProductReportButton
            productId={productId}
            productTitle={productTitle}
            productHandle={productHandle}
          />
        </div>
      </div>
    </>
  )
}
