"use client"

import { useState, useEffect, useRef } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import { Send, Loader2, MessageCircle, User, Clock, CheckCircle2, XCircle, Plus, X } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminChatPage() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // New conversation modal
  const [showNewMsg, setShowNewMsg] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newSubject, setNewSubject] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [startingConvo, setStartingConvo] = useState(false)
  const [newMsgError, setNewMsgError] = useState<string | null>(null)

  // Fetch all support tickets
  const { data: allTickets } = useSWR(
    "/api/admin/chat", fetcher, { refreshInterval: 3000 }
  )
  const tickets = allTickets?.tickets ?? []

  // Fetch messages for selected ticket
  const { data: detailData } = useSWR(
    selectedTicket ? `/api/support?ticket_id=${selectedTicket}` : null, fetcher, { refreshInterval: 2000 }
  )
  const currentTicket = detailData?.ticket
  const messages = detailData?.messages ?? []

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const sendReply = async () => {
    if (!reply.trim() || !selectedTicket) return
    setSending(true)
    try {
      await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", ticket_id: selectedTicket, message: reply }),
      })
      setReply("")
      globalMutate(`/api/support?ticket_id=${selectedTicket}`)
      globalMutate("/api/admin/chat")
    } catch { /* ignore */ }
    setSending(false)
  }

  const updateStatus = async (ticketId: string, status: string) => {
    await fetch("/api/admin/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", ticket_id: ticketId, status }),
    })
    globalMutate("/api/admin/chat")
    globalMutate(`/api/support?ticket_id=${ticketId}`)
  }

  const startConversation = async () => {
    if (!newEmail.trim() || !newMessage.trim()) return
    setStartingConvo(true)
    setNewMsgError(null)
    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start_conversation",
          user_email: newEmail.trim(),
          subject: newSubject.trim(),
          message: newMessage.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setNewMsgError(data.error || "Failed to send message")
        setStartingConvo(false)
        return
      }
      setShowNewMsg(false)
      setNewEmail("")
      setNewSubject("")
      setNewMessage("")
      globalMutate("/api/admin/chat")
      setSelectedTicket(data.ticket_id)
    } catch {
      setNewMsgError("Network error, please try again")
    }
    setStartingConvo(false)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Ticket list */}
      <div className="w-[320px] shrink-0 border-r border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">Live Chats & Tickets</h2>
              <p className="text-[10px] text-muted-foreground">{tickets.length} total</p>
            </div>
            <button
              onClick={() => setShowNewMsg(true)}
              className="flex items-center gap-1 rounded-md bg-[#f7a600] px-2.5 py-1.5 text-[10px] font-semibold text-[#0a0e17] hover:bg-[#f7a600]/80"
            >
              <Plus className="h-3 w-3" /> New Message
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground/20" />
                <p className="text-xs text-muted-foreground">No chats yet</p>
              </div>
            ) : (
              tickets.map((t: { id: string; subject: string; status: string; category: string; user_email?: string; created_at: string; updated_at: string }) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicket(t.id)}
                  className={`flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors hover:bg-secondary/30 ${
                    selectedTicket === t.id ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{t.subject}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                      t.status === "open" ? "bg-[#f7a600]/10 text-[#f7a600]"
                        : t.status === "in_progress" ? "bg-primary/10 text-primary"
                        : t.status === "resolved" ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{t.user_email || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(t.updated_at || t.created_at).toLocaleString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex flex-1 flex-col">
          {!selectedTicket ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <MessageCircle className="h-12 w-12 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">Select a chat to respond</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{currentTicket?.subject || "Chat"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {currentTicket?.category?.replace("_", " ")} -- {currentTicket?.user_email || "user"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(selectedTicket, "in_progress")}
                    className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/20"
                  >
                    <Clock className="h-3 w-3" /> In Progress
                  </button>
                  <button
                    onClick={() => updateStatus(selectedTicket, "resolved")}
                    className="flex items-center gap-1 rounded-md bg-success/10 px-2.5 py-1 text-[10px] font-medium text-success hover:bg-success/20"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Resolve
                  </button>
                  <button
                    onClick={() => updateStatus(selectedTicket, "closed")}
                    className="flex items-center gap-1 rounded-md bg-destructive/10 px-2.5 py-1 text-[10px] font-medium text-destructive hover:bg-destructive/20"
                  >
                    <XCircle className="h-3 w-3" /> Close
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((msg: { id: string; sender_role: string; message: string; created_at: string }) => (
                  <div key={msg.id} className={`flex ${msg.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.sender_role === "admin"
                          ? "rounded-br-sm bg-[#f7a600] text-[#0a0e17]"
                          : "rounded-bl-sm bg-secondary text-foreground"
                      }`}
                    >
                      <p className={`mb-0.5 text-[9px] font-bold ${msg.sender_role === "admin" ? "text-[#0a0e17]/60" : "text-muted-foreground"}`}>
                        {msg.sender_role === "admin" ? "You (Admin)" : "User"}
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                      <p className={`mt-1 text-right text-[9px] ${msg.sender_role === "admin" ? "text-[#0a0e17]/40" : "text-muted-foreground/60"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              {/* Reply */}
              {currentTicket?.status !== "closed" ? (
                <div className="border-t border-border p-4">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                      rows={2}
                      placeholder="Type admin reply..."
                      className="flex-1 resize-none rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#f7a600]"
                    />
                    <button
                      onClick={sendReply}
                      disabled={sending || !reply.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7a600] text-[#0a0e17] hover:bg-[#f7a600]/80 disabled:opacity-40"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-border p-4 text-center text-xs text-muted-foreground">Ticket closed</div>
              )}
            </>
          )}
        </div>

        {/* New conversation modal */}
        {showNewMsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Message a User</h3>
                <button onClick={() => setShowNewMsg(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-muted-foreground">User's Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#f7a600]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Subject (optional)</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Regarding your account"
                    className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#f7a600]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Message</label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    placeholder="Type your message..."
                    className="w-full resize-none rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#f7a600]"
                  />
                </div>
                {newMsgError && <p className="text-xs text-red-400">{newMsgError}</p>}
                <button
                  onClick={startConversation}
                  disabled={startingConvo || !newEmail.trim() || !newMessage.trim()}
                  className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#f7a600] py-2.5 text-sm font-semibold text-[#0a0e17] hover:bg-[#f7a600]/80 disabled:opacity-40"
                >
                  {startingConvo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
