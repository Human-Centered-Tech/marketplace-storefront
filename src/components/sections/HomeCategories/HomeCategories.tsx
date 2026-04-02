import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import Image from "next/image"

export const categories: { id: number; name: string; handle: string; icon: string }[] = [
  { id: 1, name: "Sacred Art", handle: "sacred-art", icon: "🎨" },
  { id: 2, name: "Rosaries", handle: "rosaries", icon: "📿" },
  { id: 3, name: "Education", handle: "catholic-books", icon: "📚" },
  { id: 4, name: "Candles", handle: "artisan-candles", icon: "🕯" },
  { id: 5, name: "Vestments", handle: "liturgical-vestments", icon: "⛪" },
  { id: 6, name: "Jewelry", handle: "jewelry", icon: "💍" },
  { id: 7, name: "Home", handle: "home-goods", icon: "🏠" },
  { id: 8, name: "Gifts", handle: "gifts", icon: "🎁" },
]

export const HomeCategories = async ({ heading }: { heading: string }) => {
  return (
    <section className="py-6 w-full">
      <div className="bg-white rounded-sm shadow-sm border border-[rgba(var(--neutral-100))] px-6 py-6">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <LocalizedClientLink
              key={category.id}
              href={`/categories/${category.handle}`}
              className="flex flex-col items-center gap-2 min-w-[80px] group"
            >
              <div className="w-16 h-16 rounded-full bg-[#faf9f5] border border-[rgba(var(--neutral-100))] flex items-center justify-center text-2xl group-hover:border-[#F2CD69] group-hover:shadow-md transition-all">
                {category.icon}
              </div>
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.06em] text-[#1b1c1a] whitespace-nowrap group-hover:text-[#001435] transition-colors">
                {category.name}
              </span>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
