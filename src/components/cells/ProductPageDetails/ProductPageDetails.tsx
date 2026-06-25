import { ProductPageAccordion } from "@/components/molecules"
import { sanitizeHtml } from "@/lib/util/sanitize-html"

export const ProductPageDetails = ({ details }: { details: string }) => {
  if (!details) return null

  return (
    <ProductPageAccordion heading="Product details" defaultOpen={false}>
      <div
        className="product-details"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(details),
        }}
      />
    </ProductPageAccordion>
  )
}
