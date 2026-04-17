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
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  read_at: string | null
  created_at: string
}

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
  recipient_id: string
  context_type?: "product" | "barter_listing" | "storefront" | "general"
  context_id?: string
  initial_message?: string
}) {
  return authedFetch<{ conversation: Conversation }>(
    "/store/messaging/conversations",
    {
      method: "POST",
      body: JSON.stringify(args),
    }
  )
}

export async function sendMessage(conversationId: string, body: string) {
  return authedFetch<{ message: Message }>(
    `/store/messaging/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    }
  )
}

export async function markConversationRead(conversationId: string) {
  return authedFetch<{ marked_read: number }>(
    `/store/messaging/conversations/${conversationId}/read`,
    { method: "POST" }
  )
}
