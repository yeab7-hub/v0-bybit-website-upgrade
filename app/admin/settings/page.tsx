"use client"

import { useState } from "react"
import useSWR from "swr"
import { Settings, Shield, Key, Bell, Globe, Loader2, Wallet, Plus, Pencil, Check, X, Trash2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface DepositAddr {
  id: string
  symbol: string
  name: string
  network: string
  address: string
  memo: string | null
  min_deposit: number
  confirmations: number
  active: boolean
}

export default function AdminSettingsPage() {
  const [promoteEmail, setPromoteEmail] = useState("")
  const [promoteLoading, setPromoteLoading] = useState(false)
  const [promoteMsg, setPromoteMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const supabase = createClient()

  const handlePromote = async () => {
    setPromoteLoading(true)
    setPromoteMsg(null)
    const { data: profile, error } = await supabase.from("profiles").update({ role: "admin" }).eq("email", promoteEmail).select().single()
    if (error || !profile) {
      setPromoteMsg({ type: "error", text: "User not found or update failed. Make sure the email is registered." })
    } else {
      setPromoteMsg({ type: "success", text: `${promoteEmail} has been promoted to admin.` })
      setPromoteEmail("")
    }
    setPromoteLoading(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border bg-card/50 px-4 py-5 md:px-8">
          <h1 className="text-xl font-bold text-foreground">Admin Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform configuration, wallet addresses, and management</p>
        </div>
        <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
          {/* Wallet Addresses Manager */}
          <WalletAddressManager />

          {/* Promote Admin */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div>
              <div>
                <h2 className="font-semibold text-foreground">Promote User to Admin</h2>
                <p className="text-xs text-muted-foreground">Grant admin access to a registered user by email</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <div className="flex flex-1 items-center rounded-lg border border-border bg-secondary/30 px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                <input type="email" value={promoteEmail} onChange={(e) => setPromoteEmail(e.target.value)} placeholder="user@example.com"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              </div>
              <Button onClick={handlePromote} disabled={!promoteEmail || promoteLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {promoteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Promote"}
              </Button>
            </div>
            {promoteMsg && (
              <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${promoteMsg.type === "success" ? "border border-green-500/30 bg-green-500/10 text-green-400" : "border border-destructive/30 bg-destructive/10 text-destructive"}`}>
                {promoteMsg.text}
              </div>
            )}
          </div>

          {/* Platform Settings */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Settings className="h-5 w-5 text-primary" /></div>
              <div>
                <h2 className="font-semibold text-foreground">Platform Settings</h2>
                <p className="text-xs text-muted-foreground">General configuration options</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {[
                { icon: Key, title: "Require KYC for Trading", desc: "Users must complete KYC before placing orders", on: true },
                { icon: Bell, title: "Email Notifications", desc: "Send email alerts for new KYC submissions", on: true },
                { icon: Globe, title: "Maintenance Mode", desc: "Temporarily disable the platform for all users", on: false },
              ].map((s) => (
                <div key={s.title} className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="flex items-center gap-3">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                  <button className={`relative h-6 w-11 rounded-full transition-colors ${s.on ? "bg-primary" : "bg-secondary"}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full transition-transform ${s.on ? "right-0.5 bg-primary-foreground" : "left-0.5 bg-muted-foreground"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ===== Wallet Address Manager ===== */
function WalletAddressManager() {
  const { data, mutate, isLoading } = useSWR<{ addresses: DepositAddr[] }>(
    "/api/admin/deposit-addresses", fetcher
  )
  const addrs = data?.addresses ?? []
  const [editing, setEditing] = useState<string | null>(null)
  const [editVal, setEditVal] = useState("")
  const [editMemo, setEditMemo] = useState("")
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newForm, setNewForm] = useState({ symbol: "", name: "", network: "", address: "", memo: "", min_deposit: "0.01", confirmations: "12" })
  const [addLoading, setAddLoading] = useState(false)

  const saveAddress = async (id: string) => {
    setSaving(true)
    await fetch("/api/deposit-addresses", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, address: editVal, memo: editMemo || null }),
    })
    setEditing(null)
    mutate()
    setSaving(false)
  }

  const toggleActive = async (id: string, active: boolean) => {
    await fetch("/api/deposit-addresses", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    })
    mutate()
  }

  const addNew = async () => {
    if (!newForm.symbol || !newForm.network || !newForm.address) return
    setAddLoading(true)
    await fetch("/api/deposit-addresses", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newForm,
        min_deposit: parseFloat(newForm.min_deposit) || 0.01,
        confirmations: parseInt(newForm.confirmations) || 12,
      }),
    })
    setNewForm({ symbol: "", name: "", network: "", address: "", memo: "", min_deposit: "0.01", confirmations: "12" })
    setShowAdd(false)
    mutate()
    setAddLoading(false)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f7a600]/10">
            <Wallet className="h-5 w-5 text-[#f7a600]" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Deposit Wallet Addresses</h2>
            <p className="text-xs text-muted-foreground">Manage wallet addresses users see on the deposit page</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1.5 bg-[#f7a600] text-[#0a0e17] hover:bg-[#f7a600]/90">
          <Plus className="h-3.5 w-3.5" /> Add New
        </Button>
      </div>

      {/* Add new form */}
      {showAdd && (
        <div className="mt-4 rounded-lg border border-[#f7a600]/30 bg-[#f7a600]/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Add New Deposit Address</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Symbol", key: "symbol", placeholder: "BTC" },
              { label: "Coin Name", key: "name", placeholder: "Bitcoin" },
              { label: "Network", key: "network", placeholder: "ERC20" },
              { label: "Address", key: "address", placeholder: "0x..." },
              { label: "Memo (optional)", key: "memo", placeholder: "Tag/Memo" },
              { label: "Min Deposit", key: "min_deposit", placeholder: "0.01" },
            ].map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-[10px] font-medium text-muted-foreground">{f.label}</label>
                <input
                  value={newForm[f.key as keyof typeof newForm]}
                  onChange={(e) => setNewForm({ ...newForm, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#f7a600]"
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" onClick={addNew} disabled={addLoading || !newForm.symbol || !newForm.address} className="bg-[#f7a600] text-[#0a0e17] hover:bg-[#f7a600]/90">
              {addLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add Address"}
            </Button>
          </div>
        </div>
      )}

      {/* Address list */}
      <div className="mt-4 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : addrs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No deposit addresses configured</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-[11px] text-muted-foreground">
                <th className="px-3 py-2.5 text-left font-medium">Coin</th>
                <th className="px-3 py-2.5 text-left font-medium">Network</th>
                <th className="px-3 py-2.5 text-left font-medium">Address</th>
                <th className="px-3 py-2.5 text-left font-medium">Memo</th>
                <th className="px-3 py-2.5 text-center font-medium">Status</th>
                <th className="px-3 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {addrs.map((a) => (
                <tr key={a.id} className={`border-b border-border/50 transition hover:bg-secondary/20 ${!a.active ? "opacity-50" : ""}`}>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f7a600]/10 text-[10px] font-bold text-[#f7a600]">{a.symbol.slice(0, 2)}</div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{a.symbol}</p>
                        <p className="text-[9px] text-muted-foreground">{a.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">{a.network}</span>
                  </td>
                  <td className="max-w-[200px] px-3 py-3">
                    {editing === a.id ? (
                      <input value={editVal} onChange={(e) => setEditVal(e.target.value)}
                        className="w-full rounded border border-[#f7a600] bg-background px-2 py-1 font-mono text-[10px] text-foreground outline-none" />
                    ) : (
                      <code className="break-all text-[10px] text-muted-foreground">{a.address}</code>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {editing === a.id ? (
                      <input value={editMemo} onChange={(e) => setEditMemo(e.target.value)} placeholder="Optional"
                        className="w-20 rounded border border-border bg-background px-2 py-1 text-[10px] text-foreground outline-none" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">{a.memo || "-"}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => toggleActive(a.id, a.active)}
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold transition ${a.active ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}>
                      {a.active ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-right">
                    {editing === a.id ? (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => saveAddress(a.id)} disabled={saving}
                          className="rounded p-1.5 text-green-400 transition hover:bg-green-500/10">
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => setEditing(null)} className="rounded p-1.5 text-muted-foreground transition hover:bg-secondary">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditing(a.id); setEditVal(a.address); setEditMemo(a.memo || "") }}
                        className="rounded p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
