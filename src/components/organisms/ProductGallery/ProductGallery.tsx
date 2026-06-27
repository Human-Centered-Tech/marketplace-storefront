"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Dialog, DialogPanel } from "@headlessui/react"

export const ProductGallery = ({
  images,
  thumbnail,
}: {
  images: HttpTypes.StoreProduct["images"]
  thumbnail?: string | null
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  // Fall back to the product's thumbnail when no gallery images exist —
  // most imported products carry only a thumbnail, no rows in the image
  // table, so the gallery would otherwise render "No image available".
  const imageList =
    images && images.length > 0
      ? images
      : thumbnail
        ? [{ id: "thumbnail", url: thumbnail } as HttpTypes.StoreProductImage]
        : []
  const activeImage = imageList[activeIndex]
  const hasMultiple = imageList.length > 1

  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + imageList.length) % imageList.length)
  const goNext = () => setActiveIndex((i) => (i + 1) % imageList.length)

  // Click-to-enlarge lightbox. Opens a full-screen overlay showing the active
  // gallery image at full size; left/right arrow keys (and the on-screen
  // chevrons) step through, Esc / backdrop / × close it. The inline gallery
  // behavior above is left untouched.
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, imageList.length])

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-[#f4f4f0]">
        {activeImage ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Enlarge image"
            className="absolute inset-0 w-full h-full cursor-zoom-in"
          >
            <Image
              src={decodeURIComponent(activeImage.url)}
              alt={`Product image ${activeIndex + 1}`}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          </button>
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
            Vetted Merchant
          </span>
        </div>

        {/* Prev / next arrows — only when there's more than one photo.
            Minimalist, transparent: a faint frosted disc that firms up on
            hover, with a thin chevron. */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/40 hover:bg-white/80 backdrop-blur-sm text-[#001435] flex items-center justify-center transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/40 hover:bg-white/80 backdrop-blur-sm text-[#001435] flex items-center justify-center transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
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

      {/* Full-screen lightbox — accessible modal (Headless UI Dialog).
          Closes on Esc (built-in), backdrop click (built-in), or the × button;
          steps between images with the chevrons or arrow keys. */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        className="relative z-[100]"
      >
        <div className="fixed inset-0 bg-black/90" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
          <DialogPanel className="relative w-full max-w-5xl h-[85vh]">
            {activeImage && (
              <Image
                src={decodeURIComponent(activeImage.url)}
                alt={`Product image ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            )}

            {/* Close */}
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="absolute top-2 right-2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Prev / next + counter — only with multiple photos */}
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous image"
                  className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next image"
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-sans tracking-wide">
                  {activeIndex + 1} / {imageList.length}
                </div>
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}
