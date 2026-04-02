import { BlogPost } from "@/types/blog"
import { BlogCard } from "@/components/organisms"

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "The Art of the Beeswax Candle: A Sacred Craft",
    excerpt:
      "Discover the liturgical significance and artisanal tradition behind pure beeswax candles in Catholic worship.",
    image: "/images/blog/post-1.jpg",
    category: "TRADITION",
    href: "#",
  },
  {
    id: 2,
    title: "Cultivating Your Home Oratory for Advent",
    excerpt:
      "Preparing the home sanctuary with a focus on the coming season of prayer and reflection.",
    image: "/images/blog/post-2.jpg",
    category: "FAITH & HOME",
    href: "#",
  },
  {
    id: 3,
    title: "Heirloom Rosaries: Beads for Generations",
    excerpt:
      "A profile of the artisans who craft handmade rosaries designed to be passed down through families.",
    image: "/images/blog/post-3.jpg",
    category: "ARTISAN SPOTLIGHT",
    href: "#",
  },
]

export function BlogSection() {
  return (
    <section className="py-16 lg:py-20 w-full" style={{ backgroundColor: "#001435" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="font-sans text-[12px] uppercase tracking-[0.15em] text-[#F2CD69] mb-2">
              The Marketplace Journal
            </p>
            <h2 className="font-serif text-3xl font-bold text-white">
              Stories of Faith &amp; Craft
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <BlogCard key={post.id} index={index} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
