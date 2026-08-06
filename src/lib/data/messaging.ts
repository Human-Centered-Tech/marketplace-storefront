"use server"

import { getAuthHeaders } from "./cookies"

const backendUrl = () =>
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

const publishableKey = () =>
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function authedFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T | null> {
  const headers = {
    "Content-Type": "application/json",
    "x-publishable-api-key": publishableKey(),
    ...(await getAuthHeaders()),
    ...(init.headers || {}),
  }

  try {
    const res = await fetch(`${backendUrl()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/**
 * Like authedFetch, but keeps the server's error message instead of collapsing
 * every failure to null.
 *
 * The plain helper returns null on any non-2xx, so a caller can't tell "you
 * can't message yourself" from "this seller has no account" from a network
 * blip. That's how a merchant previewing their own shop got told their shop
 * couldn't receive messages — two support reports before anyone realised the
 * backend had been sending the real reason all along.
 */
async function authedFetchWithError<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  const headers = {
    "Content-Type": "application/json",
    "x-publishable-api-key": publishableKey(),
    ...(await getAuthHeaders()),
    ...(init.headers || {}),
  }

  try {
    const res = await fetch(`${backendUrl()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    })
    const body = await res.json().catch(() => null)
    if (!res.ok) {
      return { data: null, error: (body as any)?.message ?? null }
    }
    return { data: body as T, error: null }
  } catch {
    return { data: null, error: null }
  }
}

export type Conversation = {
  id: string
  context_type: "product" | "barter_listing" | "storefront" | "general"
  context_id: string | null
  participant_a_id: string
  participant_b_id: string
  last_message_at: string | null
  last_message_preview: string | null
  created_at: string
  updated_at: string
  // Backend-resolved display fields (relative to the viewer). Optional because
  // older backends / fail-soft responses may omit them; the UI falls back.
  counterparty_name?: string | null
  context_title?: string | null
}

export type MessageAttachment = {
  url: string
  type: string
  name?: string
  size?: number
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  attachments?: MessageAttachment[] | null
  read_at: string | null
  created_at: string
}

// NOTE: message attachments deliberately do NOT go through a server action.
// `uploadMessageAttachment` used to live here and took a FormData carrying the
// raw File — the same pattern whose multipart parsing dies mid-stream with
// "Unexpected end of form" (Sentry; fixed for barter 7/2 and directory 7/10).
// Files now go through the /api/messaging/upload route handler; see
// @/lib/helpers/messaging-upload for the client helper. Don't reintroduce it.

export async function listConversations() {
  return authedFetch<{ conversations: Conversation[]; count: number }>(
    "/store/messaging/conversations"
  )
}

export async function getConversation(id: string) {
  return authedFetch<{ conversation: Conversation & { messages: Message[] } }>(
    `/store/messaging/conversations/${id}`
  )
}

export async function startConversation(args: {
  // Provide exactly one of: recipient_id (a customer), seller_id, or
  // product_id. seller_id/product_id are resolved to the owning customer
  // server-side (the storefront can't see a seller's customer id).
  recipient_id?: string
  seller_id?: string
  product_id?: string
  context_type?: "product" | "barter_listing" | "storefront" | "general"
  context_id?: string
  initial_message?: string
}) {
  const { data, error } = await authedFetchWithError<{
    conversation: Conversation
  }>("/store/messaging/conversations", {
    method: "POST",
    body: JSON.stringify(args),
  })

  return { conversation: data?.conversation, error }
}

export async function getUnreadCount() {
  return authedFetch<{
    unread_messages: number
    unread_conversations: number
  }>("/store/messaging/unread-count")
}

export async function sendMessage(
  conversationId: string,
  body: string,
  attachments?: MessageAttachment[]
) {
  return authedFetch<{ message: Message }>(
    `/store/messaging/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body, attachments }),
    }
  )
}

export async function markConversationRead(conversationId: string) {
  return authedFetch<{ marked_read: number }>(
    `/store/messaging/conversations/${conversationId}/read`,
    { method: "POST" }
  )
}

export async function notifyTyping(conversationId: string) {
  return authedFetch<unknown>(
    `/store/messaging/conversations/${conversationId}/typing`,
    { method: "POST" }
  )
}
