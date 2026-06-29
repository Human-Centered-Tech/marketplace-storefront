import { Footer, Header } from "@/components/organisms"
import { LaunchBanner } from "@/components/molecules/LaunchBanner/LaunchBanner"
import { retrieveCustomer } from "@/lib/data/customer"
import { getWishlistProductIds } from "@/lib/data/wishlist"
import { WishlistProvider } from "@/lib/context/WishlistContext"
import { checkRegion } from "@/lib/helpers/check-region"
import { redirect } from "next/navigation"

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  const user = await retrieveCustomer()
  const regionCheck = await checkRegion(locale)

  if (!regionCheck) {
    return redirect("/")
  }

  // Seed the client wishlist context so listing-card hearts reflect saved
  // state (the auth cookie is only readable here, server-side).
  const wishlistIds = user ? await getWishlistProductIds() : []

  return (
    <WishlistProvider initialProductIds={wishlistIds} isLoggedIn={!!user}>
      <LaunchBanner />
      <Header />
      {children}
      <Footer />
    </WishlistProvider>
  )
}
