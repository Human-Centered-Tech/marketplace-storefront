import type { Metadata } from "next"
import { EB_Garamond, DM_Sans } from "next/font/google"
import "./globals.css"
import { Toaster } from "@medusajs/ui"
import { retrieveCart } from "@/lib/data/cart"
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics"
import { Providers } from "./providers"

// Brand title/serif font (Brooke 3/2026 direction): EB Garamond replaces
// Cormorant Garamond as the platform serif. The --font-serif variable is the
// single swap point — every `font-serif` class picks this up. Prefer
// Medium/SemiBold weights for headings (no thin weights).
const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

// Body/UI sans. DM Sans is the free near-match for Nourd (Brooke's licensed
// brand sans, which we're not buying); it's the single platform sans, shared
// with mobile. Swap the family here if Nourd is ever licensed.
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${
      process.env.NEXT_PUBLIC_SITE_NAME ||
      "Catholic Owned®"
    }`,
    default:
      process.env.NEXT_PUBLIC_SITE_NAME ||
      "Catholic Owned®",
  },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "A Catholic marketplace and business directory supporting Catholic-owned businesses",
  // Site-wide default social preview. Pages that set their own openGraph
  // (product, category, directory, seller, trade, networking) override this;
  // anything else falls back to the brand image so shared links still look
  // branded. Relative path resolves against `metadataBase` below.
  openGraph: {
    type: "website",
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Catholic Owned®",
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
      "A Catholic marketplace and business directory supporting Catholic-owned businesses",
    images: [
      {
        url: "/B2C_Storefront_Open_Graph.png",
        width: 1200,
        height: 630,
        alt: process.env.NEXT_PUBLIC_SITE_NAME || "Catholic Owned®",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/B2C_Storefront_Open_Graph.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  alternates: {
    // Every page self-canonicalizes to its own path on metadataBase ("./" is
    // resolved per-route by Next). Without this, only the homepage had a
    // canonical, so Google treated the v3 mirror + query variants as
    // duplicates with no user-selected canonical (Search Console 7/3).
    canonical: "./",
    languages: {
      "x-default": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    },
  },
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const cart = await retrieveCart()

  const ALGOLIA_APP = process.env.NEXT_PUBLIC_ALGOLIA_ID
  const htmlLang = locale || "en"

  return (
    <html lang={htmlLang} className="">
      {/* App Router uses a native <head>; the previous `<Head>` from
          next/head is the Pages Router pattern and was silently a no-op,
          which is why preconnects (and the Material Symbols stylesheet)
          weren't actually being emitted to the rendered HTML. */}
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* Material Symbols icon font — used by directory/checkout,
            directory/success, barter, and other pages that render
            inline icons via <span class="material-symbols-outlined">.
            Loaded once globally so the icons don't fall back to literal
            text on routes that forgot to include the <link>. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link
          rel="preconnect"
          href="https://i.imgur.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://i.imgur.com" />
        {ALGOLIA_APP && (
          <>
            <link
              rel="preconnect"
              href="https://algolia.net"
              crossOrigin="anonymous"
            />
            <link
              rel="preconnect"
              href="https://algolianet.com"
              crossOrigin="anonymous"
            />
            <link rel="dns-prefetch" href="https://algolia.net" />
            <link rel="dns-prefetch" href="https://algolianet.com" />
          </>
        )}
        {/* Image origins for faster LCP */}
        <link
          rel="preconnect"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://s3.eu-central-1.amazonaws.com" />
        <link
          rel="preconnect"
          href="https://api.mercurjs.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://api.mercurjs.com" />
      </head>
      <body
        className={`${dmSans.variable} ${ebGaramond.variable} font-sans antialiased bg-primary text-secondary relative`}
      >
        <Providers cart={cart}>{children}</Providers>
        <Toaster position="top-right" />
        {/* GA4 — renders nothing unless NEXT_PUBLIC_GA_ID is set. */}
        <GoogleAnalytics />
      </body>
    </html>
  )
}
