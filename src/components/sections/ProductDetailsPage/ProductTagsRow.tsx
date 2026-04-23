import { VendorTag } from "@/lib/data/vendor-tags"

export const ProductTagsRow = ({ tags }: { tags: VendorTag[] }) => {
  return (
    <div className="mt-10 border-t border-[#755b00] border-opacity-30 pt-6">
      <p className="font-sans text-[10px] uppercase tracking-widest text-[#75777f] mb-3">
        Tags
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center rounded-full border border-[#755b00] border-opacity-30 bg-white px-3 py-1 text-xs font-sans text-[#001435]"
          >
            {tag.label || tag.value}
          </span>
        ))}
      </div>
    </div>
  )
}
