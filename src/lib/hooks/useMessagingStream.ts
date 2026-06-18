"use client"

import { useEffect, useRef } from "react"

export type StreamMessageCreated = {
  type: "message.created"
  conversation_id: string
  sender_id: string
  recipient_id: string
  message: {
    id: string
    conversation_id: string
    sender_id: string
    body: string
    created_at: string
  }
}

export type StreamRead = {
  type: "conversation.read"
  conversation_id: string
  reader_id: string
  recipient_id: string
}

export type StreamTyping = {
  type: "typing"
  conversation_id: string
  sender_id: string
  recipient_id: string
}

type Handlers = {
  onMessage?: (e: StreamMessageCreated) => void
  onRead?: (e: StreamRead) => void
  onTyping?: (e: StreamTyping) => void
}

/**
 * Subscribes to the realtime messaging stream (SSE via the same-origin proxy
 * at /api/messaging/stream). EventSource auto-reconnects on drop. Handlers are
 * read from a ref so callers don't need to memoize them.
 */
export function useMessagingStream(handlers: Handlers, enabled = true) {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    const es = new EventSource("/api/messaging/stream")

    const onCreated = (e: MessageEvent) => {
      try {
        ref.current.onMessage?.(JSON.parse(e.data))
      } catch {
        /* ignore malformed frame */
      }
    }
    const onRead = (e: MessageEvent) => {
      try {
        ref.current.onRead?.(JSON.parse(e.data))
      } catch {
        /* ignore */
      }
    }
    const onTyping = (e: MessageEvent) => {
      try {
        ref.current.onTyping?.(JSON.parse(e.data))
      } catch {
        /* ignore */
      }
    }

    es.addEventListener("message.created", onCreated)
    es.addEventListener("conversation.read", onRead)
    es.addEventListener("typing", onTyping)

    return () => {
      es.removeEventListener("message.created", onCreated)
      es.removeEventListener("conversation.read", onRead)
      es.removeEventListener("typing", onTyping)
      es.close()
    }
  }, [enabled])
}
