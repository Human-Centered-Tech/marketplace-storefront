import { ProductDetailsPage } from "@/components/sections"
import { listProducts } from "@/lib/data/products"
import { generateProductMetadata } from "@/lib/helpers/seo"
import { TrackPageView } from "@/components/sections/Analytics/TrackPageView"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle, locale } = await params

  try {
    const prod = await listProducts({
      countryCode: locale,
      queryParams: { handle: [handle], limit: 1 },
      forceCache: false,
    }).then(({ response }) => response.products[0])

    if (!prod) return { title: "Product Not Found" }

    return generateProductMetadata(prod)
  } catch {
    return { title: "Product" }
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <TrackPageView entity_type="product" entity_id={handle} />
      <ProductDetailsPage handle={handle} locale={locale} />
    </main>
  )
}
