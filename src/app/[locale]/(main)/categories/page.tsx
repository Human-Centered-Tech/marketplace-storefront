import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { Suspense } from "react"

import { Breadcrumbs } from "@/components/atoms"
import { AlgoliaProductsListing, ProductListing } from "@/components/sections"
import { SearchBar } from "@/components/molecules/SearchBar/SearchBar"
import { getRegion } from "@/lib/data/regions"
import isBot from "@/lib/helpers/isBot"
import { headers } from "next/headers"
import type { Metadata } from "next"
import Script from "next/script"
import { listRegions } from "@/lib/data/regions"
import { listProducts } from "@/lib/data/products"
import { toHreflang } from "@/lib/helpers/hreflang"

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  let languages: Record<string, string> = {}
  try {
    const regions = await listRegions()
    const locales = Array.from(
      new Set(
        (regions || []).flatMap((r) => r.countries?.map((c) => c.iso_2) || [])
      )
    ) as string[]
    languages = locales.reduce<Record<string, string>>((acc, code) => {
      acc[toHreflang(code)] = `${baseUrl}/${code}/categories`
      return acc
    }, {})
  } catch {
    languages = { [toHreflang(locale)]: `${baseUrl}/${locale}/categories` }
  }

  const title = "All Products"
  const description = `Browse all products on ${
    process.env.NEXT_PUBLIC_SITE_NAME || "our store"
  }`
  const canonical = `${baseUrl}/${locale}/categories`

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { ...languages, "x-default": `${baseUrl}/categories` },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME || "Storefront"}`,
      description,
      url: canonical,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Storefront",
      type: "website",
    },
  }
}

const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY

async function AllCategories({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; category_id?: string; max_price?: string; sort?: string; seller_id?: string }>
}) {
  const { locale } = await params
  const { q, category_id, max_price, sort, seller_id } = await searchParams

  const ua = (await headers()).get("user-agent") || ""
  const bot = isBot(ua)

  const breadcrumbsItems = [
    {
      path: "/",
      label: "All Products",
    },
  ]

  const currency_code = (await getRegion(locale))?.currency_code || "usd"

  // Fetch a small cached list for ItemList JSON-LD
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const {
    response: { products: jsonLdProducts },
  } = await listProducts({
    countryCode: locale,
    queryParams: { limit: 8, order: "created_at", fields: "id,title,handle" },
  })

  const itemList = jsonLdProducts.slice(0, 8).map((p, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    url: `${baseUrl}/${locale}/products/${p.handle}`,
    name: p.title,
  }))

  return (
    <main>
      <Script
        id="ld-breadcrumbs-categories"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "The Marketplace",
                item: `${baseUrl}/${locale}/categories`,
              },
            ],
          }),
        }}
      />
      <Script
        id="ld-itemlist-categories"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: itemList,
          }),
        }}
      />
      {/* Hero Search Section */}
      <section
        className="relative w-full py-14 lg:py-20 flex flex-col items-center justify-center border-b border-[#c5c6cf]/10"
        style={{
          backgroundColor: "#f4f4f0",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c1.3 5.4 4 10.3 8 14.3s8.9 6.7 14.3 8c-5.4 1.3-10.3 4-14.3 8s-6.7 8.9-8 14.3c-1.3-5.4-4-10.3-8-14.3s-8.9-6.7-14.3-8c5.4-1.3 10.3-4 14.3-8s6.7-8.9 8-14.3z' fill='%2317294a' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      >
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-[0.15em] uppercase text-[#001435] font-bold mb-6 text-center">
          The Marketplace
        </h1>
        <SearchBar variant="hero" />
      </section>

      <div className="w-full" style={{ backgroundColor: "#faf9f5" }}>
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-12">
          <Suspense fallback={<ProductListingSkeleton />}>
            {bot || !ALGOLIA_ID || !ALGOLIA_SEARCH_KEY ? (
              <ProductListing
                showSidebar
                locale={locale}
                searchQuery={q}
                category_id={category_id}
                maxPrice={max_price ? parseInt(max_price) : undefined}
                sortBy={sort}
                seller_id={seller_id}
              />
            ) : (
              <AlgoliaProductsListing
                locale={locale}
                currency_code={currency_code}
              />
            )}
          </Suspense>
        </div>
      </div>
    </main>
  )
}

export default AllCategories
