"use client"

import Image from "next/image"
import { useState } from "react"
import { HttpTypes } from "@medusajs/types"

export const ProductGallery = ({
  images,
}: {
  images: HttpTypes.StoreProduct["images"]
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const imageList = images || []
  const activeImage = imageList[activeIndex]

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-[#f4f4f0]">
        {activeImage ? (
          <Image
            src={decodeURIComponent(activeImage.url)}
            alt={`Product image ${activeIndex + 1}`}
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#75777f] text-sm">No image available</span>
          </div>
        )}

        {/* Vetted Vendor badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#755b00]"
          >
            <path
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#755b00]">
            Vetted Vendor
          </span>
        </div>
      </div>

      {/* Thumbnail strip — up to 5 columns */}
      {imageList.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {imageList.slice(0, 5).map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                index === activeIndex
                  ? "border-2 border-[#755b00] ring-1 ring-[#755b00]/20"
                  : "border-2 border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={decodeURIComponent(image.url)}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
