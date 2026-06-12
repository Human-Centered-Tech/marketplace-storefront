import { ProductDetails, ProductGallery } from "@/components/organisms"
import { SocialProofBadges } from "@/components/cells/SocialProofBadges/SocialProofBadges"
import { getProductSocialCounts } from "@/lib/data/social-counts"
import { listProducts } from "@/lib/data/products"
import { listProductVendorTags } from "@/lib/data/vendor-tags"
import { retrieveVendorStatus } from "@/lib/data/vendor"
import NotFound from "@/app/not-found"
import { ProductDetailsTabs } from "./ProductDetailsTabs"
import { ProductTagsRow } from "./ProductTagsRow"
import { RelatedProducts } from "./RelatedProducts"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const ProductDetailsPage = async ({
  handle,
  locale,
  previewRequested = false,
}: {
  handle: string
  locale: string
  // ?preview=1 was set on the URL. We still verify ownership server-side
  // before treating the product as previewable.
  previewRequested?: boolean
}) => {
  // First pass: with the public filter, to see if this product is publicly
  // visible. If not and preview was requested, do an owner-verified second
  // pass that skips the store_status filter.
  let prod = await listProducts({
    countryCode: locale,
    queryParams: { handle: [handle], limit: 1 },
    forceCache: false,
  }).then(({ response }) => response.products[0])

  let isOwnerPreview = false
  if (!prod && previewRequested) {
    const ownerProd = await listProducts({
      countryCode: locale,
      queryParams: { handle: [handle], limit: 1 },
      forceCache: false,
      ownerPreview: true,
    }).then(({ response }) => response.products[0])

    if (ownerProd) {
      const vendor = await retrieveVendorStatus()
      const sellerHandle = (ownerProd as any).seller?.handle
      if (
        vendor.isVendor &&
        vendor.sellerHandle &&
        sellerHandle &&
        vendor.sellerHandle === sellerHandle
      ) {
        prod = ownerProd
        isOwnerPreview = true
      }
    }
  }

  const vendorTags = prod ? await listProductVendorTags(prod.id) : []

  if (!prod) {
    return (
      <div className="text-center py-20">
        <p className="font-serif text-2xl text-[#001435]">Product not found</p>
        <p className="text-[#75777f] mt-2">This product may no longer be available.</p>
      </div>
    )
  }

  // Only ACTIVE stores are visible. INACTIVE = vendor still in draft (no
  // payment / not gone live yet); SUSPENDED = admin-blocked. Either way,
  // the product's PDP shouldn't be reachable — unless this is the owning
  // seller previewing their own draft (verified above).
  if (prod.seller?.store_status !== "ACTIVE" && !isOwnerPreview) {
    return NotFound()
  }

  const categoryName = (prod as any).categories?.[0]?.name || "Shop"

  // Social-proof engagement counts (active carts / wishlists / registries).
  // Fails open to zeros; the badge row hides itself when nothing qualifies.
  const socialCounts = await getProductSocialCounts(prod.id)

  return (
    <>
      {isOwnerPreview && (
        <div className="mb-6 -mx-4 lg:-mx-8 bg-amber-50 border-y border-amber-300 text-amber-900 px-4 py-2 text-center text-sm">
          🚧 Previewing your draft product. Shoppers don't see this view.
        </div>
      )}
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
          <ProductGallery
            images={prod?.images || []}
            thumbnail={prod?.thumbnail}
          />
        </div>

        {/* Right column: Details (5 cols) */}
        <div className="lg:col-span-5">
          <div className="mb-4">
            <SocialProofBadges counts={socialCounts} />
          </div>
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
