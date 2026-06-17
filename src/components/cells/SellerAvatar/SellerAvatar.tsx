"use client"

import Image from "next/image"
import { useState } from "react"

export const SellerAvatar = ({
  photo = "",
  size = 32,
  alt = "",
}: {
  photo?: string
  size?: number
  alt?: string
}) => {
  const [failed, setFailed] = useState(false)

  // Seller logos are arbitrary vendor-uploaded URLs that may live on hosts
  // not whitelisted in next.config images.remotePatterns (the optimizer 400s
  // those and renders a broken-image glyph). `unoptimized` serves the URL
  // directly, and onError falls back to the placeholder so a bad/unreachable
  // URL degrades gracefully instead of showing a broken image.
  return photo && !failed ? (
    <Image
      src={decodeURIComponent(photo)}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="object-contain"
      unoptimized
      onError={() => setFailed(true)}
    />
  ) : (
    <Image
      src="/images/placeholder.svg"
      alt={alt}
      className="opacity-30 w-8 h-8"
      width={32}
      height={32}
    />
  )
}
