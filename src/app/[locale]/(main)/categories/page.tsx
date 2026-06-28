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
  searchParams: Promise<{ q?: string; category_id?: string; max_price?: string; sort?: string; seller_id?: string; page?: string }>
}) {
  const { locale } = await params
  const { q, category_id, max_price, sort, seller_id, page: pageParam } =
    await searchParams
  const page = Math.max(1, parseInt(pageParam || "1") || 1)

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
      {/* Hero Search Section — shared flat-hero pattern (eyebrow → display H1 →
          lead), matched to the Directory/Networking heroes. The band fades to
          cream (not navy) so the navy text stays legible to the bottom edge. */}
      <section className="relative w-full py-16 lg:py-24 px-4 text-center overflow-hidden bg-gradient-to-b from-white to-[#faf9f5]">
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="label-sm text-gold-dark tracking-[0.3em] mb-4 font-bold opacity-80">
            Building the New Catholic Economy&reg;
          </p>
          <h1 className="display-md text-navy-dark mb-6 tracking-tight">
            The Marketplace
          </h1>
          <p className="font-serif text-xl italic text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
            Discover and support Catholic-owned businesses across the marketplace.
          </p>
          <SearchBar variant="hero" placeholder="Search products" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gold/30" />
      </section>

      <div className="w-full" style={{ backgroundColor: "#faf9f5" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
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
                page={page}
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
