"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import useSWR, { mutate as globalMutate } from "swr"
import {
  MessageCircle, Plus, Send, ArrowLeft, Clock, CheckCircle2,
  AlertCircle, HelpCircle, CreditCard, Shield, Settings, Loader2, ChevronRight,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const categories = [
  { key: "account", label: "Account & Security", icon: Shield },
  { key: "deposit_withdrawal", label: "Deposit / Withdrawal", icon: CreditCard },
  { key: "trading", label: "Trading Issues", icon: AlertCircle },
  { key: "kyc", label: "KYC / Verification", icon: CheckCircle2 },
  { key: "general", label: "General Inquiry", icon: HelpCircle },
  { key: "technical", label: "Technical Support", icon: Settings },
]

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  in_progress: "bg-chart-4/20 text-chart-4",
  resolved: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
}

export default function SupportPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [view, setView] = useState<"list" | "new" | "detail">("list")
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [newSubject, setNewSubject] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [newCategory, setNewCategory] = useState("general")
  const [newPriority, setNewPriority] = useState("medium")
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser({ id: u.id, email: u.email ?? undefined })
    })
  }, [])

  const { data: ticketsData } = useSWR(user ? "/api/support" : null, fetcher, { refreshInterval: 5000 })
  const { data: detailData } = useSWR(
    selectedTicket ? `/api/support?ticket_id=${selectedTicket}` : null, fetcher, { refreshInterval: 3000 }
  )
  const tickets = ticketsData?.tickets ?? []
  const currentTicket = detailData?.ticket
  const messages = detailData?.messages ?? []

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const createTicket = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_ticket", subject: newSubject, category: newCategory, priority: newPriority, message: newMessage }),
      })
      const data = await res.json()
      if (data.success) {
        setNewSubject(""); setNewMessage(""); setNewCategory("general"); setNewPriority("medium")
        setSelectedTicket(data.ticket.id); setView("detail")
        globalMutate("/api/support")
      }
    } catch { /* ignore */ }
    setSubmitting(false)
  }

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
    } catch { /* ignore */ }
    setSubmitting(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-32">
          <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">Support Center</h1>
          <p className="mb-6 text-sm text-muted-foreground">Please log in to create and view support tickets.</p>
          <Button asChild className="bg-primary text-primary-foreground"><a href="/login?redirect=/support">Log In</a></Button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            {view !== "list" && (
              <button onClick={() => { setView("list"); setSelectedTicket(null) }} className="mb-2 flex items-center gap-1 text-xs text-primary hover:underline">
                <ArrowLeft className="h-3 w-3" /> Back to tickets
              </button>
            )}
            <h1 className="text-2xl font-bold text-foreground">
              {view === "list" ? "Support Center" : view === "new" ? "New Ticket" : currentTicket?.subject || "Ticket"}
            </h1>
          </div>
          {view === "list" && (
            <Button onClick={() => setView("new")} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> New Ticket
            </Button>
          )}
        </div>

        {/* Ticket List */}
        {view === "list" && (
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20">
                <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No support tickets yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Click "New Ticket" to get help</p>
              </div>
            ) : (
              tickets.map((t: { id: string; subject: string; category: string; status: string; priority: string; created_at: string; updated_at: string }) => (
                <button key={t.id} onClick={() => { setSelectedTicket(t.id); setView("detail") }}
                  className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{t.subject}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[t.status] || statusColors.open}`}>
                        {t.status.replace("_", " ")}
                      </span>
                      {t.priority === "urgent" && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">Urgent</span>}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{t.category.replace("_", " ")}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        )}

        {/* New Ticket Form */}
        {view === "new" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-foreground">Category</label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {categories.map((cat) => (
                  <button key={cat.key} onClick={() => setNewCategory(cat.key)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${newCategory === cat.key ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                    <cat.icon className="h-4 w-4" />{cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-foreground">Priority</label>
              <div className="flex gap-2">
                {["low", "medium", "high", "urgent"].map((p) => (
                  <button key={p} onClick={() => setNewPriority(p)}
                    className={`rounded-md px-4 py-1.5 text-xs font-medium capitalize transition-colors ${newPriority === p ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-foreground">Subject</label>
              <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Brief description of your issue"
                className="w-full rounded-lg border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-foreground">Message</label>
              <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={6} placeholder="Describe your issue in detail..."
                className="w-full rounded-lg border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" />
            </div>
            <Button onClick={createTicket} disabled={submitting || !newSubject.trim() || !newMessage.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit Ticket
            </Button>
          </div>
        )}

        {/* Ticket Detail / Chat */}
        {view === "detail" && currentTicket && (
          <div className="flex flex-col rounded-xl border border-border bg-card">
            {/* Ticket header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[currentTicket.status] || statusColors.open}`}>
                    {currentTicket.status.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-muted-foreground capitalize">{currentTicket.category.replace("_", " ")}</span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">ID: {currentTicket.id.slice(0, 8)}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4" style={{ maxHeight: "500px" }}>
              {messages.map((msg: { id: string; sender_role: string; message: string; created_at: string }) => (
                <div key={msg.id} className={`flex ${msg.sender_role === "admin" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[75%] rounded-xl px-4 py-3 ${msg.sender_role === "admin" ? "bg-primary/10 text-foreground" : "bg-secondary text-foreground"}`}>
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`text-[10px] font-semibold ${msg.sender_role === "admin" ? "text-primary" : "text-muted-foreground"}`}>
                        {msg.sender_role === "admin" ? "Tryd Support" : "You"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            {currentTicket.status !== "closed" && (
              <div className="border-t border-border p-4">
                <div className="flex items-end gap-3">
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={2} placeholder="Type your reply..."
                    className="flex-1 rounded-lg border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply() } }} />
                  <Button onClick={sendReply} disabled={submitting || !replyText.trim()} className="bg-primary text-primary-foreground">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
            {currentTicket.status === "closed" && (
              <div className="border-t border-border p-4 text-center text-xs text-muted-foreground">This ticket has been closed.</div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
