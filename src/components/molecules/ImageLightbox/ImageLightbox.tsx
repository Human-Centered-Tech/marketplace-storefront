"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogPanel } from "@headlessui/react"

export type LightboxImage = {
  url: string
  alt?: string
}

/**
 * Full-screen image lightbox — accessible modal (Headless UI Dialog, same
 * pattern as the ProductGallery enlarge view). Closes on Esc (built-in),
 * backdrop click (built-in), or the × button; steps between images with the
 * on-screen chevrons or arrow keys. Mount it conditionally when open — it
 * keeps its own index state, seeded from `initialIndex`.
 *
 * Uses a plain <img> (not next/image) on purpose: callers pass arbitrary
 * external/CDN URLs that aren't guaranteed to be in next.config remotePatterns.
 */
export const ImageLightbox = ({
  images,
  initialIndex = 0,
  onClose,
}: {
  images: LightboxImage[]
  initialIndex?: number
  onClose: () => void
}) => {
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0))
  )
  const hasMultiple = images.length > 1

  const goPrev = () =>
    setIndex((i) => (i - 1 + images.length) % images.length)
  const goNext = () => setIndex((i) => (i + 1) % images.length)

  // Lock the page behind the viewer. The Dialog's own scroll lock wasn't
  // holding on the listing page — the page kept scrolling under an open
  // photo (regimen: gallery lightbox). Restore whatever was there on close.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    if (!hasMultiple) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultiple, images.length])

  const current = images[index]
  if (!current) return null

  return (
    <Dialog open onClose={onClose} className="relative z-[100]">
      <div className="fixed inset-0 bg-black/90" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
        <DialogPanel className="relative w-full max-w-5xl h-[85vh]">
          <img
            src={current.url}
            alt={current.alt || `Photo ${index + 1}`}
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
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
                {index + 1} / {images.length}
              </div>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
