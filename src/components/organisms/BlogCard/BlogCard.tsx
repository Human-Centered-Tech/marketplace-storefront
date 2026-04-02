import Image from "next/image"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { BlogPost } from "@/types/blog"
import { cn } from "@/lib/utils"

interface BlogCardProps {
  post: BlogPost
  index: number
}

export function BlogCard({ post, index }: BlogCardProps) {
  return (
    <LocalizedClientLink
      href={post.href}
      className={cn(
        "group block rounded-sm overflow-hidden bg-[rgba(var(--neutral-0))]",
        index > 0 && "hidden lg:block"
      )}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <Image
          loading="lazy"
          sizes="(min-width: 1024px) 33vw, 100vw"
          src={decodeURIComponent(post.image)}
          alt={post.title}
          width={467}
          height={350}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-navy text-white text-[10px] font-semibold uppercase tracking-[0.12em] px-3 py-1 rounded-xs">
          {post.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-primary mb-2 group-hover:text-action transition-colors">
          {post.title}
        </h3>
        <p className="text-[13px] text-secondary leading-relaxed line-clamp-2 mb-3">
          {post.excerpt}
        </p>
        <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-action">
          Read More →
        </span>
      </div>
    </LocalizedClientLink>
  )
}
