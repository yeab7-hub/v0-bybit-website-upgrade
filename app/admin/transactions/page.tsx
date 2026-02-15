"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  CheckCircle2, XCircle, Clock, ArrowDownLeft, ArrowUpRight,
  ArrowLeftRight, MessageSquare, Loader2, User, Search, X,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AdminTransactionsPage() {
  const [filter, setFilter] = useState("pending")
  const [typeFilter, setTypeFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [processing, setProcessing] = useState<string | null>(null)
  const [noteId, setNoteId] = useState<string | null>(null)
  const [note, setNote] = useState("")

  const { data: txs, mutate } = useSWR("/api/admin/transactions", fetcher, { refreshInterval: 5000 })

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessing(id)
    await fetch("/api/admin/transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, admin_note: note || (action === "approve" ? "Approved" : "Rejected") }),
    })
    setNoteId(null)
    setNote("")
    setProcessing(null)
    mutate()
  }

  const allTxs: any[] = Array.isArray(txs) ? txs : []
  const filtered = allTxs.filter(t => {
    if (filter !== "all" && t.status !== filter) return false
    if (typeFilter !== "all" && t.type !== typeFilter) return false
    if (search) {
      const s = search.toLowerCase()
      const email = t.profiles?.email?.toLowerCase() || ""
      const name = t.profiles?.full_name?.toLowerCase() || ""
      if (!email.includes(s) && !name.includes(s) && !t.asset.toLowerCase().includes(s) && !t.id.includes(s)) return false
    }
    return true
  })

  const pendingCount = allTxs.filter(t => t.status === "pending").length

  const statusBadge = (s: string) => {
    if (s === "completed") return <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success"><CheckCircle2 className="h-3 w-3" />Completed</span>
    if (s === "rejected") return <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive"><XCircle className="h-3 w-3" />Rejected</span>
    return <span className="flex items-center gap-1 rounded-full bg-[#f7a600]/10 px-2 py-0.5 text-[10px] font-semibold text-[#f7a600]"><Clock className="h-3 w-3" />Pending</span>
  }

  const typeIcon = (t: string) => {
    if (t === "deposit") return <ArrowDownLeft className="h-4 w-4 text-success" />
    if (t === "withdrawal") return <ArrowUpRight className="h-4 w-4 text-destructive" />
    return <ArrowLeftRight className="h-4 w-4 text-primary" />
  }

  return (
    <div>
      <div className="border-b border-border bg-card/50 px-4 py-5 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Transactions</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage deposits, withdrawals, and transfers</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-[#f7a600]/10 px-4 py-2">
              <Clock className="h-4 w-4 text-[#f7a600]" />
              <span className="text-sm font-semibold text-[#f7a600]">{pendingCount} pending</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-6 lg:px-8">
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            {["pending", "all", "completed", "rejected"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? "bg-[#f7a600] text-[#0a0e17]" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {f}{f === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {["all", "deposit", "withdrawal", "transfer"].map(f => (
              <button key={f} onClick={() => setTypeFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${typeFilter === f ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {f}
              </button>
            ))}
            <div className="relative ml-2">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user or coin..."
                className="rounded-lg border border-border bg-background py-1.5 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#f7a600] focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Coin</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Network</th>
                  <th className="px-4 py-3 text-left font-medium">Address</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">No transactions found</td></tr>
                ) : filtered.map((t: any) => (
                  <tr key={t.id} className="border-b border-border/50 transition hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {typeIcon(t.type)}
                        <span className="text-xs font-medium capitalize text-foreground">{t.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary"><User className="h-3 w-3 text-muted-foreground" /></div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{t.profiles?.full_name || "User"}</p>
                          <p className="text-[10px] text-muted-foreground">{t.profiles?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{t.asset}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{t.amount}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.network || "-"}</td>
                    <td className="px-4 py-3">
                      {t.address ? (
                        <code className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-foreground">{t.address.slice(0, 8)}...{t.address.slice(-6)}</code>
                      ) : <span className="text-xs text-muted-foreground">-</span>}
                    </td>
                    <td className="px-4 py-3">{statusBadge(t.status)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {t.status === "pending" ? (
                        <div className="flex items-center justify-center gap-1">
                          {noteId === t.id ? (
                            <div className="flex items-center gap-1">
                              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note..."
                                className="w-24 rounded border border-border bg-background px-2 py-1 text-[10px] text-foreground focus:outline-none" />
                              <button onClick={() => handleAction(t.id, "approve")} disabled={processing === t.id}
                                className="rounded bg-success/10 p-1.5 text-success hover:bg-success/20 disabled:opacity-50">
                                {processing === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                              </button>
                              <button onClick={() => handleAction(t.id, "reject")} disabled={processing === t.id}
                                className="rounded bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20 disabled:opacity-50">
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => { setNoteId(null); setNote("") }} className="rounded p-1.5 text-muted-foreground hover:bg-secondary">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <button onClick={() => handleAction(t.id, "approve")} disabled={processing === t.id}
                                className="rounded bg-success/10 px-2.5 py-1 text-[10px] font-semibold text-success hover:bg-success/20">Approve</button>
                              <button onClick={() => handleAction(t.id, "reject")} disabled={processing === t.id}
                                className="rounded bg-destructive/10 px-2.5 py-1 text-[10px] font-semibold text-destructive hover:bg-destructive/20">Reject</button>
                              <button onClick={() => setNoteId(t.id)} className="rounded bg-secondary p-1 text-muted-foreground hover:text-foreground">
                                <MessageSquare className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-center text-[10px] text-muted-foreground">{t.notes || "-"}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
