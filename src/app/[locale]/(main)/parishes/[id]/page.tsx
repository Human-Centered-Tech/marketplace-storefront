import { Metadata } from "next"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getParish } from "@/lib/data/parishes"
import { ParishFeed } from "@/components/sections/ParishFeed/ParishFeed"

// Public, shareable parish page: one parish's directory / marketplace /
// Sacred Exchange feed. "My Parishes" (/parishes) composes these per
// followed parish; this standalone route makes a parish linkable from
// anywhere (and indexable).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const parish = await getParish(id)
  if (!parish) return { title: "Parish | Catholic Owned®" }
  const loc = [parish.city, parish.state].filter(Boolean).join(", ")
  return {
    title: `${parish.name}${loc ? ` — ${loc}` : ""} | Catholic Owned®`,
    description: `Catholic-owned businesses, products, and Sacred Exchange listings connected to ${parish.name}${loc ? ` in ${loc}` : ""}.`,
  }
}

export default async function ParishPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const parish = await getParish(id)
  if (!parish) notFound()

  const loc = [parish.city, parish.state].filter(Boolean).join(", ")

  return (
    <main className="bg-[#faf9f5] min-h-screen">
      <section
        className="w-full py-14 lg:py-20 px-4 lg:px-8 relative overflow-hidden"
        style={{ backgroundColor: "#001435" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#BE9B32]/10 blur-[150px] rounded-full -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#F2CD69]">
            Parish Community
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white mt-2">
            {parish.name}
          </h1>
          <p className="text-white/80 mt-2">
            {loc}
            {parish.diocese ? ` · ${parish.diocese}` : ""}
          </p>
          <LocalizedClientLink
            href="/parishes"
            className="inline-block mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#F2CD69] hover:text-white transition-colors underline decoration-[#BE9B32] underline-offset-8"
          >
            Follow this parish on My Parishes →
          </LocalizedClientLink>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <ParishFeed parishId={id} locale={locale} />
      </section>
    </main>
  )
}
