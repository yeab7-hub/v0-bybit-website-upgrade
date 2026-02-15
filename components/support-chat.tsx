"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Loader2, Minus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import useSWR, { mutate as globalMutate } from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function SupportChat() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [activeTicket, setActiveTicket] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user: u } }) => {
        if (u) setUser({ id: u.id, email: u.email ?? undefined })
      }).catch(() => {})
    } catch {
      // Supabase not configured
    }
  }, [])

  // Get or find existing "live_chat" ticket
  const { data: ticketsData } = useSWR(
    user && open ? "/api/support" : null, fetcher, { refreshInterval: 4000, dedupingInterval: 2000 }
  )

  useEffect(() => {
    const tickets = ticketsData?.tickets ?? []
    const liveChat = tickets.find((t: { category: string; status: string }) =>
      t.category === "live_chat" && t.status !== "closed"
    )
    if (liveChat) setActiveTicket(liveChat.id)
  }, [ticketsData])

  // Get messages for active ticket
  const { data: detailData } = useSWR(
    activeTicket ? `/api/support?ticket_id=${activeTicket}` : null, fetcher, { refreshInterval: 3000, dedupingInterval: 1500 }
  )
  const messages = detailData?.messages ?? []

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const [error, setError] = useState<string | null>(null)

  const startChat = async () => {
    if (!user) return
    if (!message.trim()) { setError("Please type a message"); return }
    setSending(true)
    setError(null)
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_ticket",
          subject: "Live Chat Support",
          category: "live_chat",
          priority: "high",
          message: message.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || "Failed to start chat")
      } else if (data.success) {
        setActiveTicket(data.ticket.id)
        setMessage("")
        globalMutate("/api/support")
      }
    } catch (e) {
      setError("Network error - please try again")
    }
    setSending(false)
  }

  const sendMessage = async () => {
    if (!message.trim() || !activeTicket) return
    const msgText = message.trim()
    setSending(true)
    setError(null)
    // Optimistic: clear input immediately
    setMessage("")
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", ticket_id: activeTicket, message: msgText }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || "Failed to send message")
        setMessage(msgText) // Restore message on error
      } else {
        // Revalidate messages
        globalMutate(`/api/support?ticket_id=${activeTicket}`)
      }
    } catch (e) {
      setError("Network error - please try again")
      setMessage(msgText) // Restore message on error
    }
    setSending(false)
  }

  const HeadphoneButton = ({ size = 56, onClick }: { size?: number; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full bg-[#f7a600] shadow-[0_4px_24px_rgba(247,166,0,0.4)] transition-all duration-200 hover:scale-110 hover:shadow-[0_6px_32px_rgba(247,166,0,0.5)] active:scale-95"
      style={{ width: size, height: size }}
      aria-label="Support Chat"
    >
      <svg width={size * 0.43} height={size * 0.43} viewBox="0 0 24 24" fill="none" stroke="#0a0e17" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    </button>
  )

  if (!user) {
    return <HeadphoneButton onClick={() => (window.location.href = "/login?redirect=" + window.location.pathname)} />
  }

  if (!open) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <HeadphoneButton onClick={() => setOpen(true)} />
        {messages.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow">
            !
          </span>
        )}
      </div>
    )
  }

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-[#f7a600] py-3 pl-4 pr-5 text-sm font-semibold text-[#0a0e17] shadow-[0_4px_24px_rgba(247,166,0,0.4)] transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0e17" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
        Live Chat
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#f7a600] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0e17]/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0e17" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-[#0a0e17]">Bybit Support</p>
            <p className="text-[10px] text-[#0a0e17]/70">We typically reply instantly</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(true)} className="rounded p-1 hover:bg-[#0a0e17]/10">
            <Minus className="h-4 w-4 text-[#0a0e17]" />
          </button>
          <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-[#0a0e17]/10">
            <X className="h-4 w-4 text-[#0a0e17]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {!activeTicket && messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7a600]/15">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f7a600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">Welcome to Bybit Support</p>
            <p className="text-xs text-muted-foreground">
              Send a message to start a live chat with our support team.
            </p>
          </div>
        )}
        {messages.map((msg: { id: string; sender_role: string; message: string; created_at: string }) => (
          <div key={msg.id} className={`flex ${msg.sender_role === "admin" ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                msg.sender_role === "admin"
                  ? "rounded-bl-sm bg-secondary text-foreground"
                  : "rounded-br-sm bg-[#f7a600] text-[#0a0e17]"
              }`}
            >
              {msg.sender_role === "admin" && (
                <p className="mb-0.5 text-[9px] font-semibold text-[#f7a600]">Bybit Support</p>
              )}
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{msg.message}</p>
              <p className={`mt-1 text-right text-[9px] ${msg.sender_role === "admin" ? "text-muted-foreground" : "text-[#0a0e17]/50"}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        {error && (
          <div className="mb-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                activeTicket ? sendMessage() : startChat()
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#f7a600]"
          />
          <button
            onClick={() => (activeTicket ? sendMessage() : startChat())}
            disabled={sending || !message.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7a600] text-[#0a0e17] transition-colors hover:bg-[#f7a600]/80 disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
