"use client"

import { useState } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import {
  Settings, Shield, Key, Bell, Globe, Loader2, Wallet, Plus, Pencil,
  Check, X, UserMinus, UserPlus, Lock, Mail, Eye, EyeOff, Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketAsset } from "@/components/market-asset"

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface DepositAddr {
  id: string; symbol: string; name: string; network: string
  address: string; memo: string | null; min_deposit: number
  confirmations: number; is_active: boolean
}

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="border-b border-border bg-card/50 px-4 py-5 lg:px-8">
        <h1 className="text-xl font-bold text-foreground">Admin Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Admin management, wallet addresses, and platform configuration</p>
      </div>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-8">
        <AdminManagement />
        <WalletAddressManager />
        <PlatformSettings />
      </div>
    </div>
  )
}

/* ===== Admin Management (God Mode) ===== */
function AdminManagement() {
  const { data, mutate } = useSWR("/api/admin/manage", fetcher)
  const admins = data?.admins ?? []
  const users = data?.users ?? []

  const [promoteEmail, setPromoteEmail] = useState("")
  const [promoteLoading, setPromoteLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Password change
  const [newPassword, setNewPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Email change
  const [newEmail, setNewEmail] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handlePromote = async () => {
    if (!promoteEmail.trim()) return
    setPromoteLoading(true); setMsg(null)
    const res = await fetch("/api/admin/manage", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "promote", email: promoteEmail.trim() }),
    })
    const d = await res.json()
    if (d.success) {
      setMsg({ type: "success", text: d.message })
      setPromoteEmail("")
      mutate()
    } else {
      setMsg({ type: "error", text: d.error })
    }
    setPromoteLoading(false)
  }

  const handleDemote = async (targetId: string, email: string) => {
    if (!confirm(`Demote ${email} from admin?`)) return
    const res = await fetch("/api/admin/manage", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "demote", target_id: targetId }),
    })
    const d = await res.json()
    if (d.success) { mutate() }
    else { alert(d.error) }
  }

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) { setPwMsg({ type: "error", text: "Min 6 characters" }); return }
    setPwLoading(true); setPwMsg(null)
    const res = await fetch("/api/admin/manage", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_password", new_password: newPassword }),
    })
    const d = await res.json()
    setPwMsg({ type: d.success ? "success" : "error", text: d.success ? d.message : d.error })
    if (d.success) setNewPassword("")
    setPwLoading(false)
  }

  const handleEmailChange = async () => {
    if (!newEmail.trim()) return
    setEmailLoading(true); setEmailMsg(null)
    const res = await fetch("/api/admin/manage", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_email", new_email: newEmail.trim() }),
    })
    const d = await res.json()
    setEmailMsg({ type: d.success ? "success" : "error", text: d.success ? d.message : d.error })
    if (d.success) setNewEmail("")
    setEmailLoading(false)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f7a600]/10">
          <Shield className="h-5 w-5 text-[#f7a600]" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Admin Management</h2>
          <p className="text-xs text-muted-foreground">Control admin accounts, passwords, and access</p>
        </div>
      </div>

      {/* Current Admins List */}
      <div className="mt-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Users className="h-4 w-4 text-muted-foreground" /> Current Admins
        </h3>
        <div className="flex flex-col gap-2">
          {admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No admins found</p>
          ) : admins.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7a600]/10 text-xs font-bold text-[#f7a600]">
                  {(a.full_name || a.email)?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{a.email}</p>
                  <p className="text-[10px] text-muted-foreground">{a.full_name || "No name"} -- since {new Date(a.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => handleDemote(a.id, a.email)}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[10px] font-medium text-red-400 transition hover:bg-red-500/10"
                title="Remove admin access">
                <UserMinus className="h-3 w-3" /> Demote
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Promote New Admin */}
      <div className="mt-5 rounded-lg border border-dashed border-border bg-secondary/10 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <UserPlus className="h-4 w-4 text-green-400" /> Promote User to Admin
        </h3>
        <div className="flex gap-3">
          <div className="flex flex-1 items-center rounded-lg border border-border bg-background px-3 py-2.5 focus-within:border-[#f7a600]/50">
            <input type="email" value={promoteEmail} onChange={(e) => setPromoteEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          </div>
          <Button onClick={handlePromote} disabled={promoteLoading || !promoteEmail.trim()}
            className="gap-1.5 bg-[#f7a600] text-[#0a0e17] hover:bg-[#f7a600]/90">
            {promoteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
            Promote
          </Button>
        </div>
        {msg && (
          <p className={`mt-2 text-xs ${msg.type === "success" ? "text-green-400" : "text-red-400"}`}>{msg.text}</p>
        )}
      </div>

      {/* Change Password */}
      <div className="mt-5 rounded-lg border border-dashed border-border bg-secondary/10 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Lock className="h-4 w-4 text-muted-foreground" /> Change My Password
        </h3>
        <div className="flex gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 focus-within:border-[#f7a600]/50">
            <input type={showPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
            <button onClick={() => setShowPw(!showPw)} className="text-muted-foreground">
              {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Button onClick={handlePasswordChange} disabled={pwLoading || !newPassword}
            className="gap-1.5 bg-[#f7a600] text-[#0a0e17] hover:bg-[#f7a600]/90">
            {pwLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Update"}
          </Button>
        </div>
        {pwMsg && (
          <p className={`mt-2 text-xs ${pwMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>{pwMsg.text}</p>
        )}
      </div>

      {/* Change Email */}
      <div className="mt-5 rounded-lg border border-dashed border-border bg-secondary/10 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Mail className="h-4 w-4 text-muted-foreground" /> Change My Email
        </h3>
        <div className="flex gap-3">
          <div className="flex flex-1 items-center rounded-lg border border-border bg-background px-3 py-2.5 focus-within:border-[#f7a600]/50">
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          </div>
          <Button onClick={handleEmailChange} disabled={emailLoading || !newEmail.trim()}
            className="gap-1.5 bg-[#f7a600] text-[#0a0e17] hover:bg-[#f7a600]/90">
            {emailLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Update"}
          </Button>
        </div>
        {emailMsg && (
          <p className={`mt-2 text-xs ${emailMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>{emailMsg.text}</p>
        )}
      </div>
    </div>
  )
}

/* ===== Wallet Address Manager ===== */
function WalletAddressManager() {
  const { data, mutate, isLoading } = useSWR<{ addresses: DepositAddr[] }>("/api/admin/deposit-addresses", fetcher)
  const addrs = data?.addresses ?? []

  const [editing, setEditing] = useState
