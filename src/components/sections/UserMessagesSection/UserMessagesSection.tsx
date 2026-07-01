"use client"

import { useEffect, useState, useRef } from "react"
import type {
  Conversation,
  Message,
  MessageAttachment,
} from "@/lib/data/messaging"
import {
  getConversation,
  listConversations,
  markConversationRead,
  sendMessage,
  uploadMessageAttachment,
  notifyTyping,
} from "@/lib/data/messaging"
import { useMessagingStream } from "@/lib/hooks/useMessagingStream"

type ConversationWithMessages = Conversation & { messages: Message[] }

export const UserMessagesSection = ({
  currentUserId,
  initialConversationId = null,
}: {
  currentUserId: string
  initialConversationId?: string | null
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId
  )
  const [selected, setSelected] = useState<ConversationWithMessages | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState("")
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [attachError, setAttachError] = useState("")
  const [typingFrom, setTypingFrom] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingSent = useRef(0)

  useEffect(() => {
    listConversations()
      .then((data) => setConversations(data?.conversations || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setSelected(null)
      return
    }
    getConversation(selectedId).then((data) => {
      if (data?.conversation) {
        setSelected(data.conversation)
        markConversationRead(selectedId)
      }
    })
  }, [selectedId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selected?.messages?.length, typingFrom])

  // Realtime: live messages, read receipts, typing. Handlers read the latest
  // selectedId/selected via closure (the hook re-reads handlers each event).
  useMessagingStream({
    onMessage: (e) => {
      if (e.conversation_id === selectedId) {
        setSelected((prev) => {
          if (!prev || prev.id !== e.conversation_id) return prev
          if (prev.messages.some((m) => m.id === e.message.id)) return prev
          return {
            ...prev,
            messages: [...prev.messages, { ...e.message, read_at: null }],
          }
        })
        if (e.sender_id !== currentUserId) {
          markConversationRead(e.conversation_id)
        }
      }
      // Keep the sidebar fresh (preview, ordering, brand-new conversations).
      listConversations().then((data) =>
        setConversations(data?.conversations || [])
      )
    },
    onRead: (e) => {
      if (e.conversation_id === selectedId && e.reader_id !== currentUserId) {
        setSelected((prev) => {
          if (!prev || prev.id !== e.conversation_id) return prev
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.sender_id === currentUserId && !m.read_at
                ? { ...m, read_at: new Date().toISOString() }
                : m
            ),
          }
        })
      }
    },
    onTyping: (e) => {
      if (e.conversation_id === selectedId && e.sender_id !== currentUserId) {
        setTypingFrom(e.sender_id)
        if (typingTimer.current) clearTimeout(typingTimer.current)
        typingTimer.current = setTimeout(() => setTypingFrom(null), 4000)
      }
    },
  })

  const handleDraftChange = (value: string) => {
    setDraft(value)
    if (!selectedId) return
    const now = Date.now()
    if (now - lastTypingSent.current > 2000) {
      lastTypingSent.current = now
      notifyTyping(selectedId)
    }
  }

  const handleAttachFiles = async (files: FileList | null) => {
    if (!files || !files.length) return
    setAttachError("")
    setUploading(true)
    try {
      for (const file of Array.from(files).slice(0, 5)) {
        const fd = new FormData()
        fd.append("file", file)
        const res = await uploadMessageAttachment(fd)
        if (res.ok) {
          setPendingAttachments((prev) => [...prev, res.attachment])
        } else {
          setAttachError(res.error)
          break
        }
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId || (!draft.trim() && pendingAttachments.length === 0)) return
    setSending(true)
    const res = await sendMessage(
      selectedId,
      draft,
      pendingAttachments.length ? pendingAttachments : undefined
    )
    setSending(false)
    if (res?.message && selected) {
      setSelected({
        ...selected,
        messages: [...selected.messages, res.message],
      })
      setDraft("")
      setPendingAttachments([])
      // Refresh list so the latest-activity sort updates
      listConversations().then((data) =>
        setConversations(data?.conversations || [])
      )
    }
  }

  // Who the other participant is. Prefer the backend-resolved name (store name
  // for a seller, person's name for a buyer); never fall back to the raw id.
  const counterpartyName = (c: Conversation) => {
    const name = c.counterparty_name?.trim()
    if (name) return name
    return c.context_type === "product" || c.context_type === "storefront"
      ? "Seller"
      : "Member"
  }

  const contextLabel = (c: Conversation) => {
    switch (c.context_type) {
      case "product":
        return "Product inquiry"
      case "barter_listing":
        return "Trade listing"
      case "storefront":
        return "Storefront"
      default:
        return "Conversation"
    }
  }

  // Prefer the specific product / trade title when the backend resolved it,
  // otherwise the generic context label.
  const contextHeading = (c: Conversation) =>
    c.context_title?.trim() || contextLabel(c)

  if (loading) {
    return (
      <div className="border border-[#d6d0c4]/40 rounded-xl bg-white p-8 text-center text-secondary">
        Loading conversations...
      </div>
    )
  }

  return (
    <div className="border border-[#d6d0c4]/40 rounded-xl bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-[600px]">
      {/* Sidebar: conversation list */}
      <aside className="border-r border-[#d6d0c4]/40 overflow-y-auto">
        <div className="p-4 border-b border-[#d6d0c4]/40">
          <h2 className="font-serif text-lg font-semibold text-[#17294A]">
            Messages
          </h2>
        </div>
        {conversations.length === 0 ? (
          <div className="p-6 text-sm text-secondary text-center">
            No conversations yet.
          </div>
        ) : (
          <ul className="divide-y divide-[#d6d0c4]/30">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-4 hover:bg-[#faf9f5] transition-colors ${
                    selectedId === c.id ? "bg-[#faf9f5]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold tracking-widest text-[#BE9B32] uppercase truncate">
                      {contextHeading(c)}
                    </span>
                    {c.last_message_at && (
                      <span className="text-[10px] text-secondary">
                        {new Date(c.last_message_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-sm text-[#17294A] truncate">
                    {counterpartyName(c)}
                  </p>
                  {c.last_message_preview && (
                    <p className="text-xs text-secondary truncate mt-1">
                      {c.last_message_preview}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Main: selected conversation */}
      <section className="flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-secondary text-sm italic">
            Select a conversation to begin
          </div>
        ) : (
          <>
            <header className="p-4 border-b border-[#d6d0c4]/40">
              <p className="text-[10px] font-bold tracking-widest text-[#BE9B32] uppercase mb-1">
                {contextHeading(selected)}
              </p>
              <h3 className="font-serif text-lg font-semibold text-[#17294A]">
                {counterpartyName(selected)}
              </h3>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {selected.messages.length === 0 ? (
                <p className="text-sm text-secondary italic text-center mt-8">
                  No messages yet. Send the first one below.
                </p>
              ) : (
                selected.messages.map((m) => {
                  const mine = m.sender_id === currentUserId
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${
                          mine
                            ? "bg-[#17294A] text-white"
                            : "bg-[#faf9f5] text-[#17294A] border border-[#d6d0c4]/40"
                        }`}
                      >
                        {m.body && (
                          <p className="whitespace-pre-wrap">{m.body}</p>
                        )}
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mt-2 flex flex-col gap-2">
                            {m.attachments.map((a, i) =>
                              a.type === "application/pdf" ? (
                                <a
                                  key={i}
                                  href={a.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 underline text-xs"
                                >
                                  <span className="material-symbols-outlined text-base">
                                    description
                                  </span>
                                  {a.name || "Attachment.pdf"}
                                </a>
                              ) : (
                                <a
                                  key={i}
                                  href={a.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={a.url}
                                    alt={a.name || "attachment"}
                                    className="max-w-[220px] max-h-[220px] rounded-lg"
                                  />
                                </a>
                              )
                            )}
                          </div>
                        )}
                        <p
                          className={`text-[10px] mt-1 ${
                            mine ? "text-white/60" : "text-secondary"
                          }`}
                        >
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          {mine && m.read_at ? " · Read" : ""}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              {typingFrom && (
                <div className="flex justify-start">
                  <div className="rounded-xl px-4 py-2 text-sm bg-[#faf9f5] text-secondary border border-[#d6d0c4]/40 italic">
                    typing…
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="p-4 border-t border-[#d6d0c4]/40 flex flex-col gap-2"
            >
              {(pendingAttachments.length > 0 || attachError) && (
                <div className="flex flex-wrap items-center gap-2">
                  {pendingAttachments.map((a, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-[#faf9f5] border border-[#d6d0c4]/60 rounded px-2 py-1 text-xs"
                    >
                      {a.type === "application/pdf" ? "📄" : "🖼️"}
                      <span className="max-w-[120px] truncate">
                        {a.name || "attachment"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingAttachments((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                        className="text-red-600"
                        aria-label="Remove attachment"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {attachError && (
                    <span className="text-xs text-red-600">{attachError}</span>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => handleAttachFiles(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || sending}
                  aria-label="Attach a file"
                  className="px-3 rounded-lg border border-[#d6d0c4]/60 text-[#17294A] hover:bg-[#faf9f5] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">
                    {uploading ? "hourglass_empty" : "attach_file"}
                  </span>
                </button>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => handleDraftChange(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 border border-[#d6d0c4]/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#BE9B32]"
                />
                <button
                  type="submit"
                  disabled={
                    sending ||
                    uploading ||
                    (!draft.trim() && pendingAttachments.length === 0)
                  }
                  className="bg-[#17294A] text-white px-5 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider hover:bg-[#0d1a38] transition-colors disabled:opacity-50"
                >
                  {sending ? "…" : "Send"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
