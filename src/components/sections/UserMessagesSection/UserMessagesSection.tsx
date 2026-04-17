"use client"

import { useEffect, useState, useRef } from "react"
import type {
  Conversation,
  Message,
} from "@/lib/data/messaging"
import {
  getConversation,
  listConversations,
  markConversationRead,
  sendMessage,
} from "@/lib/data/messaging"

type ConversationWithMessages = Conversation & { messages: Message[] }

export const UserMessagesSection = ({
  currentUserId,
}: {
  currentUserId: string
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<ConversationWithMessages | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

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
  }, [selected?.messages?.length])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId || !draft.trim()) return
    setSending(true)
    const res = await sendMessage(selectedId, draft)
    setSending(false)
    if (res?.message && selected) {
      setSelected({
        ...selected,
        messages: [...selected.messages, res.message],
      })
      setDraft("")
      // Refresh list so the latest-activity sort updates
      listConversations().then((data) =>
        setConversations(data?.conversations || [])
      )
    }
  }

  const otherParticipantId = (c: Conversation) =>
    c.participant_a_id === currentUserId
      ? c.participant_b_id
      : c.participant_a_id

  const contextLabel = (c: Conversation) => {
    switch (c.context_type) {
      case "product":
        return "Product inquiry"
      case "barter_listing":
        return "Barter listing"
      case "storefront":
        return "Storefront"
      default:
        return "Conversation"
    }
  }

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
                    <span className="text-[10px] font-bold tracking-widest text-[#BE9B32] uppercase">
                      {contextLabel(c)}
                    </span>
                    {c.last_message_at && (
                      <span className="text-[10px] text-secondary">
                        {new Date(c.last_message_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-sm text-[#17294A] truncate">
                    {otherParticipantId(c).slice(0, 16)}…
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
                {contextLabel(selected)}
              </p>
              <h3 className="font-serif text-lg font-semibold text-[#17294A]">
                {otherParticipantId(selected).slice(0, 16)}…
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
                        <p className="whitespace-pre-wrap">{m.body}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            mine ? "text-white/60" : "text-secondary"
                          }`}
                        >
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="p-4 border-t border-[#d6d0c4]/40 flex gap-2"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1 border border-[#d6d0c4]/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#BE9B32]"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="bg-[#17294A] text-white px-5 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider hover:bg-[#0d1a38] transition-colors disabled:opacity-50"
              >
                {sending ? "…" : "Send"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
