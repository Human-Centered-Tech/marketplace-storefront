import { ProductDetails, ProductGallery } from "@/components/organisms"
import { listProducts } from "@/lib/data/products"
import { listProductVendorTags } from "@/lib/data/vendor-tags"
import NotFound from "@/app/not-found"
import { ProductDetailsTabs } from "./ProductDetailsTabs"
import { ProductTagsRow } from "./ProductTagsRow"
import { RelatedProducts } from "./RelatedProducts"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const ProductDetailsPage = async ({
  handle,
  locale,
}: {
  handle: string
  locale: string
}) => {
  const prod = await listProducts({
    countryCode: locale,
    queryParams: { handle: [handle], limit: 1 },
    forceCache: false,
  }).then(({ response }) => response.products[0])

  const vendorTags = prod ? await listProductVendorTags(prod.id) : []

  if (!prod) {
    return (
      <div className="text-center py-20">
        <p className="font-serif text-2xl text-[#001435]">Product not found</p>
        <p className="text-[#75777f] mt-2">This product may no longer be available.</p>
      </div>
    )
  }

  if (prod.seller?.store_status === "SUSPENDED") {
    return NotFound()
  }

  const categoryName = (prod as any).categories?.[0]?.name || "Shop"

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-[#75777f]">
          <li>
            <LocalizedClientLink
              href="/categories"
              className="hover:text-[#755b00] transition-colors"
            >
              Marketplace
            </LocalizedClientLink>
          </li>
          <li aria-hidden="true" className="select-none">/</li>
          <li>
            <LocalizedClientLink
              href="/categories"
              className="hover:text-[#755b00] transition-colors"
            >
              {categoryName}
            </LocalizedClientLink>
          </li>
          <li aria-hidden="true" className="select-none">/</li>
          <li className="text-[#001435] font-semibold truncate max-w-[200px]">
            {prod.title}
          </li>
        </ol>
      </nav>

      {/* Main product area — 12-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left column: Gallery (7 cols) */}
        <div className="lg:col-span-7">
          <ProductGallery images={prod?.images || []} />
        </div>

        {/* Right column: Details (5 cols) */}
        <div className="lg:col-span-5">
          <ProductDetails product={prod} locale={locale} />
        </div>
      </div>

      {/* Gold divider */}
      <hr className="my-12 border-[#755b00] opacity-30" />

      {/* Tabbed section */}
      <ProductDetailsTabs
        description={prod?.description || ""}
        shippingInfo=""
        attributes={(prod as any)?.attribute_values || []}
      />

      {vendorTags.length > 0 && <ProductTagsRow tags={vendorTags} />}

      {/* Related Products */}
      {prod.seller?.products && prod.seller.products.length > 0 && (
        <RelatedProducts
          products={prod.seller.products}
          locale={locale}
          currentProductId={prod.id}
        />
      )}
    </>
  )
}
