import { Footer, Header } from "@/components/organisms"
import { retrieveCustomer } from "@/lib/data/customer"
import { getWishlistProductIds } from "@/lib/data/wishlist"
import { WishlistProvider } from "@/lib/context/WishlistContext"
import { checkRegion } from "@/lib/helpers/check-region"
import { Session } from "@talkjs/react"
import { redirect } from "next/navigation"

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const APP_ID = process.env.NEXT_PUBLIC_TALKJS_APP_ID
  const { locale } = await params

  const user = await retrieveCustomer()
  const regionCheck = await checkRegion(locale)

  if (!regionCheck) {
    return redirect("/")
  }

  // Seed the client wishlist context so listing-card hearts reflect saved
  // state (the auth cookie is only readable here, server-side).
  const wishlistIds = user ? await getWishlistProductIds() : []

  if (!APP_ID || !user)
    return (
      <WishlistProvider initialProductIds={wishlistIds} isLoggedIn={!!user}>
        <Header />
        {children}
        <Footer />
      </WishlistProvider>
    )

  return (
    <WishlistProvider initialProductIds={wishlistIds} isLoggedIn={!!user}>
      <Session appId={APP_ID} userId={user.id}>
        <Header />
        {children}
        <Footer />
      </Session>
    </WishlistProvider>
  )
}
