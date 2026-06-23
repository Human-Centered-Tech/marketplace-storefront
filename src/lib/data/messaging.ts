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

const ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "application/pdf",
]
const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024

// Upload a single message attachment (image/PDF). Reuses the customer-authed
// /store/directory/uploads endpoint (base64). Returns the stored URL + meta.
export async function uploadMessageAttachment(
  formData: FormData
): Promise<
  { ok: true; attachment: MessageAttachment } | { ok: false; error: string }
> {
  const file = formData.get("file") as File | null
  if (!file) return { ok: false, error: "No file selected" }
  if (!ATTACHMENT_TYPES.includes(file.type)) {
    return { ok: false, error: "Only images or PDFs are allowed" }
  }
  if (file.size > ATTACHMENT_MAX_BYTES) {
    return { ok: false, error: "File too large (max 10MB)" }
  }
  const data_base64 = Buffer.from(await file.arrayBuffer()).toString("base64")
  const res = await authedFetch<{ url: string }>("/store/directory/uploads", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type,
      data_base64,
    }),
  })
  if (!res?.url) return { ok: false, error: "Upload failed" }
  return {
    ok: true,
    attachment: { url: res.url, type: file.type, name: file.name, size: file.size },
  }
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
  return authedFetch<{ conversation: Conversation }>(
    "/store/messaging/conversations",
    {
      method: "POST",
      body: JSON.stringify(args),
    }
  )
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
