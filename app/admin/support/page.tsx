"use client"

import { useState, useEffect, useRef } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { createClient } from "@/lib/supabase/client"
import useSWR, { mutate as globalMutate } from "swr"
import {
  MessageCircle, Send, Clock, CheckCircle2, AlertTriangle,
  ArrowRight, Loader2, XCircle, RotateCcw, User,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  in_progress: "bg-chart-4/20 text-chart-4",
  resolved: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
}

const statusIcons: Record<string, typeof MessageCircle> = {
  open: AlertTriangle,
  in_progress: RotateCcw,
  resolved: CheckCircle2,
  closed: XCircle,
}

export default function AdminSupportPage() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [user, setUser] = useState<{ id: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: u } }) => { if (u) setUser({ id: u.id }) })
  }, [])

  const { data: ticketsData } = useSWR(user ? "/api/support?admin=true" : null, fetcher, { refreshInterval: 5000 })
  const { data: detailData } = useSWR(
    selectedTicket ? `/api/support?ticket_id=${selectedTicket}` : null, fetcher, { refreshInterval: 3000 }
  )

  const allTickets = ticketsData?.tickets ?? []
  const tickets = filter === "all" ? allTickets : allTickets.filter((t: { status: string }) => t.status === filter)
  const currentTicket = detailData?.ticket
  const messages = detailData?.messages ?? []

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return
    setSubmitting(true)
    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", ticket_id: selectedTicket, message: replyText }),
      })
      setReplyText("")
      globalMutate(`/api/support?ticket_id=${selectedTicket}`)
      globalMutate("/api/support?admin=true")
    } catch { /* ignore */ }
    setSubmitting(false)
  }

  const updateStatus = async (ticketId: string, status: string) => {
    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", ticket_id: ticketId, status }),
      })
      globalMutate(`/api/support?ticket_id=${ticketId}`)
      globalMutate("/api/support?admin=true")
    } catch { /* ignore */ }
  }

  const openCount = allTickets.filter((t: { status: string }) => t.status === "open").length
  const inProgressCount = allTickets.filter((t: { status: string }) => t.status === "in_progress").length

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-hidden">
        {/* Header bar */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Support Tickets</h1>
              <p className="text-xs text-muted-foreground">Manage user support requests</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1">
                <AlertTriangle className="h-3 w-3 text-destructive" />
                <span className="text-xs font-medium text-destructive">{openCount} open</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-chart-4/10 px-3 py-1">
                <RotateCcw className="h-3 w-3 text-chart-4" />
                <span className="text-xs font-medium text-chart-4">{inProgressCount} in progress</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Ticket list panel */}
          <div className="w-96 flex-shrink-0 border-r border-border overflow-y-auto">
            {/* Filter tabs */}
            <div className="flex items-center gap-1 border-b border-border px-3 py-2">
              {[
                { key: "all", label: "All" },
                { key: "open", label: "Open" },
                { key: "in_progress", label: "Active" },
                { key: "resolved", label: "Resolved" },
                { key: "closed", label: "Closed" },
              ].map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <MessageCircle className="mb-3 h-8 w-8 text-muted-foreground/20" />
                <p className="text-xs text-muted-foreground">No tickets</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {tickets.map((t: { id: string; subject: string; category: string; status: string; priority: string; created_at: string; profiles?: { full_name?: string; email?: string } }) => {
                  const StatusIcon = statusIcons[t.status] || MessageCircle
                  return (
                    <button key={t.id} onClick={() => setSelectedTicket(t.id)}
                      className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/30 ${selectedTicket === t.id ? "bg-secondary/50" : ""}`}>
                      <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${statusColors[t.status]}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">{t.subject}</span>
                          {t.priority === "urgent" && <span className="shrink-0 rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] text-destructive">URGENT</span>}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <User className="h-2.5 w-2.5" />
                          <span className="truncate">{t.profiles?.full_name || t.profiles?.email || "User"}</span>
                          <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Chat / Detail panel */}
          <div className="flex flex-1 flex-col">
            {!selectedTicket ? (
              <div className="flex flex-1 flex-col items-center justify-center">
                <MessageCircle className="mb-3 h-12 w-12 text-muted-foreground/15" />
                <p className="text-sm text-muted-foreground">Select a ticket to view</p>
              </div>
            ) : !currentTicket ? (
              <div className="flex flex-1 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <>
                {/* Ticket header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">{currentTicket.subject}</h2>
                    <span className="text-[10px] capitalize text-muted-foreground">{currentTicket.category.replace("_", " ")} - Priority: {currentTicket.priority}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {["open", "in_progress", "resolved", "closed"].map((s) => (
                      <button key={s} onClick={() => updateStatus(currentTicket.id, s)}
                        className={`rounded-md px-2.5 py-1 text-[10px] font-medium capitalize transition-colors ${currentTicket.status === s ? statusColors[s] : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                  {messages.map((msg: { id: string; sender_role: string; message: string; created_at: string }) => (
                    <div key={msg.id} className={`flex ${msg.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-xl px-4 py-3 ${msg.sender_role === "admin" ? "bg-primary/10 text-foreground" : "bg-secondary text-foreground"}`}>
                        <div className="mb-1 flex items-center gap-2">
                          <span className={`text-[10px] font-semibold ${msg.sender_role === "admin" ? "text-primary" : "text-muted-foreground"}`}>
                            {msg.sender_role === "admin" ? "Admin" : "User"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Admin reply */}
                <div className="border-t border-border p-4">
                  <div className="flex items-end gap-3">
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} placeholder="Reply as Bybit Support admin..."
                      className="flex-1 rounded-lg border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply() } }} />
                    <Button onClick={sendReply} disabled={submitting || !replyText.trim()} className="bg-primary text-primary-foreground">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
