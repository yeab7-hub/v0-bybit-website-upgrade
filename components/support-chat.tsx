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
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser({ id: u.id, email: u.email ?? undefined })
    })
  }, [])

  // Get or find existing "live_chat" ticket
  const { data: ticketsData } = useSWR(
    user && open ? "/api/support" : null, fetcher, { refreshInterval: 3000 }
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
    activeTicket ? `/api/support?ticket_id=${activeTicket}` : null, fetcher, { refreshInterval: 2000 }
  )
  const messages = detailData?.messages ?? []

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const startChat = async () => {
    if (!user) return
    setSending(true)
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_ticket",
          subject: "Live Chat Support",
          category: "live_chat",
          priority: "high",
          message: message || "Hi, I need help.",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setActiveTicket(data.ticket.id)
        setMessage("")
        globalMutate("/api/support")
      }
    } catch { /* ignore */ }
    setSending(false)
  }

  const sendMessage = async () => {
    if (!message.trim() || !activeTicket) return
    setSending(true)
    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", ticket_id: activeTicket, message }),
      })
      setMessage("")
      globalMutate(`/api/support?ticket_id=${activeTicket}`)
    } catch { /* ignore */ }
    setSending(false)
  }

  if (!user) {
    return (
      <button
        onClick={() => (window.location.href = "/login?redirect=" + window.location.pathname)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl transition-transform hover:scale-110"
        aria-label="Support Chat"
      >
        <img src="/images/support-icon.png" alt="Support" className="h-full w-full" />
      </button>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl transition-transform hover:scale-110"
        aria-label="Support Chat"
      >
        <img src="/images/support-icon.png" alt="Support" className="h-full w-full" />
        {messages.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#f7a600] text-[9px] font-bold text-[#0a0e17]">
            !
          </span>
        )}
      </button>
    )
  }

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#f7a600] px-5 py-3 text-sm font-semibold text-[#0a0e17] shadow-2xl transition-transform hover:scale-105"
      >
        <img src="/images/support-icon.png" alt="" className="h-6 w-6" />
        Live Chat
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#f7a600] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img src="/images/support-icon.png" alt="" className="h-8 w-8" />
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
            <img src="/images/support-icon.png" alt="" className="h-12 w-12 opacity-60" />
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
