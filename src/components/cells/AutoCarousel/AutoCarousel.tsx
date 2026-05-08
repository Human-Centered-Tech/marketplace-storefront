"use client"

import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons"

type Props = {
  items: React.ReactNode[]
  autoplayMs?: number
  // Tailwind flex-basis classes per breakpoint; controls how many slides are
  // visible (and therefore the size of the "peek" of the next slide).
  // Default: 1.2 cards on mobile, 2.2 on tablet, ~3.5 on desktop.
  slideWidthClass?: string
  ariaLabel?: string
  // Color the edge-fade overlays bleed into. Should match the parent section
  // background so the carousel appears to merge into the page rather than
  // being clipped by a hard rectangle.
  fadeColor?: string
}

export const AutoCarousel = ({
  items,
  autoplayMs = 5000,
  slideWidthClass = "flex-[0_0_82%] sm:flex-[0_0_46%] lg:flex-[0_0_30%] xl:flex-[0_0_28%]",
  ariaLabel,
  fadeColor = "#ffffff",
}: Props) => {
  // loop:true makes scrollNext()/scrollPrev() wrap around at the ends, so the
  // autoplay tick never stalls. containScroll is forced to false internally
  // when loop is on — explicit here for clarity.
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
    containScroll: false,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const pausedRef = useRef(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("reInit", onSelect).on("select", onSelect)
    return () => {
      emblaApi.off("reInit", onSelect)
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  // Autoplay. Pauses while pausedRef is true (set on hover or user pointer
  // interaction). Restarts cleanly on every dependency change so the interval
  // doesn't leak across renders.
  useEffect(() => {
    if (!emblaApi || autoplayMs <= 0 || items.length <= 1) return
    const id = setInterval(() => {
      if (pausedRef.current) return
      emblaApi.scrollNext()
    }, autoplayMs)
    return () => clearInterval(id)
  }, [emblaApi, autoplayMs, items.length])

  // Pause on hover (desktop) and on user pointer-down (touch + mouse drag).
  useEffect(() => {
    if (!emblaApi) return
    const root = emblaApi.rootNode()
    const onEnter = () => {
      pausedRef.current = true
    }
    const onLeave = () => {
      pausedRef.current = false
    }
    root.addEventListener("mouseenter", onEnter)
    root.addEventListener("mouseleave", onLeave)
    root.addEventListener("pointerdown", onEnter)
    root.addEventListener("pointerup", onLeave)
    return () => {
      root.removeEventListener("mouseenter", onEnter)
      root.removeEventListener("mouseleave", onLeave)
      root.removeEventListener("pointerdown", onEnter)
      root.removeEventListener("pointerup", onLeave)
    }
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  )

  if (!items.length) return null

  // Embla's loop needs ~2x viewport worth of slide width to wrap seamlessly.
  // For short lists (e.g., 4 featured guides at 30% width = 120% of viewport)
  // the wrap stalls — autoplay reaches the last snap and feels like it stops.
  // Duplicating items past the threshold gives Embla enough DOM to clone for
  // a smooth wrap. Users don't notice the repeats because each duplicate is
  // many positions away from the original.
  const MIN_LOOP_ITEMS = 8
  const renderedItems =
    items.length >= MIN_LOOP_ITEMS
      ? items.map((node, i) => ({ node, key: `i-${i}` }))
      : Array.from(
          { length: Math.ceil(MIN_LOOP_ITEMS / items.length) },
          (_, cycle) =>
            items.map((node, i) => ({ node, key: `c${cycle}-i${i}` }))
        ).flat()

  // Edge-fade overlays. Each side is a thin band that:
  //   - Fades from the section bg color to transparent (color blend).
  //   - Backdrop-blurs whatever slide is poking through.
  // The mask-image gradient makes both effects strongest at the outer edge
  // and graduate to nothing toward the carousel center, so peek-cards aren't
  // washed out — only the cut-off sliver is softened.
  const fadeBase: React.CSSProperties = {
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  }

  return (
    <div
      className="relative w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -mx-2">
          {renderedItems.map(({ node, key }, i) => (
            <div
              key={key}
              className={`min-w-0 px-2 ${slideWidthClass}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${(i % items.length) + 1} of ${items.length}`}
            >
              {node}
            </div>
          ))}
        </div>
      </div>

      {/* Left edge fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-16 lg:w-20 z-10"
        style={{
          ...fadeBase,
          background: `linear-gradient(to right, ${fadeColor} 30%, transparent 100%)`,
          maskImage: "linear-gradient(to right, black 30%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, black 30%, transparent 100%)",
        }}
      />

      {/* Right edge fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-16 lg:w-20 z-10"
        style={{
          ...fadeBase,
          background: `linear-gradient(to left, ${fadeColor} 30%, transparent 100%)`,
          maskImage: "linear-gradient(to left, black 30%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to left, black 30%, transparent 100%)",
        }}
      />

      {/* Desktop arrows */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={scrollPrev}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md items-center justify-center hover:bg-white transition disabled:opacity-30"
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={scrollNext}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md items-center justify-center hover:bg-white transition disabled:opacity-30"
          >
            <ArrowRightIcon />
          </button>
        </>
      )}

      {/* Dots (mobile + tablet). Show one dot per unique item even if we
          duplicated slides for loop smoothness; highlight is modulo'd. */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4 md:hidden">
          {Array.from({ length: items.length }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === selectedIndex % items.length
                  ? "w-6 bg-[#BE9B32]"
                  : "w-1.5 bg-[#001435]/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
