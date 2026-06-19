"use client"

import { useCallback, useEffect, useState } from "react"
import { getUnreadCount } from "@/lib/data/messaging"
import { useMessagingStream } from "./useMessagingStream"

/**
 * Live unread-message count for the current customer. Fetches an initial
 * count and refreshes on realtime events. Self-gating: getUnreadCount returns
 * null for guests (backend 401), so the realtime stream only opens once we
 * know the user is authenticated. Returns 0 for guests.
 */
export function useUnreadMessages(): number {
  const [count, setCount] = useState(0)
  const [enabled, setEnabled] = useState(false)

  const refresh = useCallback(() => {
    getUnreadCount()
      .then((d) => {
        if (d) {
          setEnabled(true)
          setCount(d.unread_messages)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useMessagingStream({ onMessage: refresh, onRead: refresh }, enabled)

  return count
}
