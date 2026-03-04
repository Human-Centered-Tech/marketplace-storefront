"use client"

import { useState } from "react"

export const ShareRegistryButton = ({ token }: { token: string }) => {
  const [copied, setCopied] = useState(false)

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/registry/${token}`
      : `/registry/${token}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input")
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={shareUrl}
        readOnly
        className="border rounded-sm px-3 py-2 text-sm text-secondary flex-1 bg-gray-50"
      />
      <button
        onClick={handleCopy}
        className="bg-primary text-white px-4 py-2 rounded-sm text-sm uppercase font-medium whitespace-nowrap"
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  )
}
