import { HttpTypes } from "@medusajs/types"
import { Metadata } from "next"
import { headers } from "next/headers"

// Brand default Open Graph image (1200×630, lives in /public). Used as the
// site-wide fallback in the root layout and whenever an entity page has no
// image of its own, so every shared link previews with branding. The relative
// path is resolved against `metadataBase` (set in the root layout).
export const DEFAULT_OG_IMAGE = "/B2C_Storefront_Open_Graph.png"

/**
 * Build OpenGraph + Twitter image metadata for an entity page. Pass the
 * entity's primary image when available; falls back to the brand default so
 * shared links always preview with an image. Spread the result into a page's
 * `generateMetadata` return value (alongside `title` / `description`).
 */
export const buildSocialMetadata = ({
  title,
  description,
  image,
}: {
  title?: string
  description?: string
  image?: string | null
}): Metadata => {
  const ogImage = image && image.trim() ? image : DEFAULT_OG_IMAGE

  return {
    openGraph: {
      title,
      description,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export const generateProductMetadata = async (
  product: HttpTypes.StoreProduct
): Promise<Metadata> => {
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"

  return {
    title: product?.title,
    description: `${product?.title} - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    robots: "index, follow",
    metadataBase: new URL(`${protocol}://${host}/products/${product?.handle}`),

    openGraph: {
      title: product?.title,
      description: `${product?.title} - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      url: `${protocol}://${host}/products/${product?.handle}`,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      images: [
        {
          url:
            product?.thumbnail ||
            `${protocol}://${host}/images/placeholder.svg`,
          width: 1200,
          height: 630,
          alt: product?.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product?.title,
      description: `${product?.title} - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      images: [
        product?.thumbnail || `${protocol}://${host}/images/placeholder.svg`,
      ],
    },
  }
}

export const generateCategoryMetadata = async (
  category: HttpTypes.StoreProductCategory
) => {
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"

  return {
    robots: "index, follow",
    metadataBase: new URL(
      `${protocol}://${host}/categories/${category.handle}`
    ),
    title: `${category.name} Category`,
    description: `${category.name} Category - ${process.env.NEXT_PUBLIC_SITE_NAME}`,

    openGraph: {
      title: category.name,
      description: `${category.name} Category - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      url: `${protocol}://${host}/categories/${category.handle}`,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      images: [
        {
          url:
            `${protocol}://${host}/images/categories/${category.handle}.png` ||
            `${protocol}://${host}/images/placeholder.svg`,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description: `${category.name} Category - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      images: [
        `${protocol}://${host}/images/categories/${category.handle}.png` ||
          `${protocol}://${host}/images/placeholder.svg`,
      ],
    },
  }
}
