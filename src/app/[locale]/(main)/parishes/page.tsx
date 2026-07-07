import { Metadata } from "next"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { retrieveCustomer } from "@/lib/data/customer"
import { getMyParishes } from "@/lib/data/parish-actions"
import { MyParishesManager } from "@/components/sections/MyParishesManager/MyParishesManager"
import { ParishFeed } from "@/components/sections/ParishFeed/ParishFeed"

export const metadata: Metadata = {
  title: "My Parishes | Catholic Owned®",
  description:
    "Follow your parishes and discover the Catholic-owned businesses, products, and Sacred Exchange listings connected to each one.",
}

// Membership state is per-user (cookie-auth) — never cache this page.
export const dynamic = "force-dynamic"

export default async function MyParishesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const customer = await retrieveCustomer()

  return (
    <main className="bg-[#faf9f5] min-h-screen">
      {/* Hero */}
      <section
        className="w-full py-14 lg:py-20 px-4 lg:px-8 relative overflow-hidden"
        style={{ backgroundColor: "#001435" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#BE9B32]/10 blur-[150px] rounded-full -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white">
            My Parishes
          </h1>
          <p className="text-white/80 mt-3 max-w-2xl">
            Your parish is the heart of your Catholic community. Follow yours
            to see the Catholic-owned businesses, marketplace products, and
            Sacred Exchange listings connected to it — all in one place.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-12">
        {!customer ? (
          <div className="rounded-2xl border border-[#BE9B32]/30 bg-white p-8 md:p-12 text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl font-semibold text-[#001435]">
              Sign in to follow your parishes
            </h2>
            <p className="text-sm text-secondary mt-2">
              Create a free account or sign in, then search for your parish by
              name, city, or ZIP.
            </p>
            <LocalizedClientLink
              href="/user"
              className="inline-block mt-6 rounded-full bg-[#BE9B32] px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-[#001435] hover:bg-[#F2CD69] transition-colors"
            >
              Sign In
            </LocalizedClientLink>
          </div>
        ) : (
          <MyParishesContent locale={locale} />
        )}
      </section>
    </main>
  )
}

async function MyParishesContent({ locale }: { locale: string }) {
  const { parishes, limit } = await getMyParishes()

  return (
    <>
      <MyParishesManager initialParishes={parishes} limit={limit} />
      {parishes.length === 0 ? (
        <p className="text-center text-secondary text-sm py-8">
          Search for your parish above to start building your parish page.
        </p>
      ) : (
        <div className="space-y-16">
          {parishes.map((p) => (
            <ParishFeed
              key={p.id}
              parishId={p.id}
              locale={locale}
              showParishName
            />
          ))}
        </div>
      )}
    </>
  )
}
