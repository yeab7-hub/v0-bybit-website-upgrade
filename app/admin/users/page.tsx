"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search, UserCheck, UserX, Shield, Ban, MoreVertical,
  ChevronLeft, ChevronRight, Wallet, Plus, Minus, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  role: string
  kyc_status: string
  is_banned: boolean
  created_at: string
}

interface UserBalance {
  asset: string
  available: number
  in_order: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [callerRole, setCallerRole] = useState<string>("admin")
  const [search, setSearch] = useState("")
  const [filterKYC, setFilterKYC] = useState<string>("all")
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const [balanceUser, setBalanceUser] = useState<UserProfile | null>(null)
  const [balances, setBalances] = useState<UserBalance[]>([])
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [adjustAsset, setAdjustAsset] = useState("")
  const [adjustAmount, setAdjustAmount] = useState("")
  const [adjustAction, setAdjustAction] = useState<"add" | "subtract">("add")
  const [adjustMsg, setAdjustMsg] = useState("")

  const pageSize = 15

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (filterKYC !== "all") params.set("kyc_status", filterKYC)
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (data.users) setUsers(data.users)
      if (data.total !== undefined) setTotal(data.total)
      if (data.callerRole) setCallerRole(data.callerRole)
    } catch (err) {
      console.error("Failed to fetch users:", err)
    }
  }, [page, filterKYC, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Filter out super_admin from non-super_admin view
  const visibleUsers = callerRole === "super_admin"
    ? users
    : users.filter((u) => u.role !== "super_admin")

  const updateUserRole = async (userId: string, role: string) => {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_role", user_id: userId, role }),
    })
    setActiveMenu(null)
    fetchUsers()
  }

  const toggleBan = async (userId: string, isBanned: boolean) => {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_ban", user_id: userId, is_banned: !isBanned }),
    })
    setActiveMenu(null)
    fetchUsers()
  }

  const openBalanceModal = async (user: UserProfile) => {
    setBalanceUser(user)
    setBalanceLoading(true)
    setAdjustAsset("USDT")
    setAdjustAmount("")
    setAdjustAction("add")
    setAdjustMsg("")

    try {
      const res = await fetch(`/api/admin/users?action=balances&user_id=${user.id}`)
      const data = await res.json()
      setBalances(data.balances ?? [])
    } catch {
      setBalances([])
    }
    setBalanceLoading(false)
  }

  const handleAdjustBalance = async () => {
    if (!balanceUser || !adjustAsset || !adjustAmount) return
    const amount = parseFloat(adjustAmount)
    if (isNaN(amount) || amount <= 0) { setAdjustMsg("Enter a valid positive number"); return }

    setBalanceLoading(true)
    setAdjustMsg("")

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust_balance",
          user_id: balanceUser.id,
          asset: adjustAsset,
          amount,
          adjust_action: adjustAction,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setAdjustMsg(`Error: ${data.error}`)
      } else {
        setAdjustMsg(`${adjustAction === "add" ? "Added" : "Subtracted"} ${amount} ${adjustAsset} successfully`)
        setAdjustAmount("")
      }

      // Refresh balances
      const bRes = await fetch(`/api/admin/users?action=balances&user_id=${balanceUser.id}`)
      const bData = await bRes.json()
      setBalances(bData.balances ?? [])
    } catch {
      setAdjustMsg("Error: Failed to adjust balance")
    }
    setBalanceLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
      approved: { cls: "bg-success/10 text-success", icon: <UserCheck className="h-3 w-3" />, label: "Approved" },
      pending: { cls: "bg-yellow-500/10 text-yellow-500", icon: <Shield className="h-3 w-3" />, label: "Pending" },
      rejected: { cls: "bg-destructive/10 text-destructive", icon: <UserX className="h-3 w-3" />, label: "Rejected" },
    }
    const s = map[status]
    if (!s) return <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">None</span>
    return <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.cls}`}>{s.icon} {s.label}</span>
  }

  const getRoleBadge = (role: string) => {
    if (role === "super_admin") return <span className="rounded-full bg-[#f7a600]/10 px-2 py-0.5 text-[10px] font-medium text-[#f7a600]">Master</span>
    if (role === "admin") return <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Admin</span>
    return <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">User</span>
  }

  const totalPages = Math.ceil(total / pageSize)
  const assets = ["USDT", "BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE"]

  return (
    <div>
      <div className="border-b border-border bg-card/50 px-4 py-5 lg:px-8">
        <h1 className="text-xl font-bold text-foreground">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">View, search, and manage all platform users</p>
      </div>

      <div className="px-4 py-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className="w-64 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            {["all", "none", "pending", "approved", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => { setFilterKYC(f); setPage(0) }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filterKYC === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">KYC</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">No users found</td>
                  </tr>
                ) : (
                  visibleUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                            {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-foreground">{u.full_name || "Unnamed"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3">{getRoleBadge(u.role)}</td>
                      <td className="px-5 py-3">{getStatusBadge(u.kyc_status)}</td>
                      <td className="px-5 py-3">
                        {u.is_banned
                          ? <span className="flex items-center gap-1 text-xs text-destructive"><Ban className="h-3 w-3" /> Banned</span>
                          : <span className="text-xs text-success">Active</span>}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        {u.role === "super_admin" ? (
                          <span className="text-[10px] text-muted-foreground">Protected</span>
                        ) : (
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenu(activeMenu === u.id ? null : u.id)}
                              className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {activeMenu === u.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card p-1 shadow-xl">
                                  <button
                                    onClick={() => { openBalanceModal(u); setActiveMenu(null) }}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                                  >
                                    <Wallet className="h-3.5 w-3.5" /> Manage Balance
                                  </button>
                                  {callerRole === "super_admin" && (
                                    u.role !== "admin" ? (
                                      <button
                                        onClick={() => updateUserRole(u.id, "admin")}
                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                                      >
                                        <Shield className="h-3.5 w-3.5" /> Make Admin
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => updateUserRole(u.id, "user")}
                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                                      >
                                        <UserCheck className="h-3.5 w-3.5" /> Remove Admin
                                      </button>
                                    )
                                  )}
                                  <button
                                    onClick={() => toggleBan(u.id, u.is_banned)}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                                  >
                                    <Ban className="h-3.5 w-3.5" /> {u.is_banned ? "Unban User" : "Ban User"}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="text-xs text-muted-foreground">{total} total users - Page {page + 1} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="h-8 w-8 p-0 text-muted-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="h-8 w-8 p-0 text-muted-foreground">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Balance Management Modal */}
      {balanceUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setBalanceUser(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Manage Balance</h3>
                <p className="text-xs text-muted-foreground">{balanceUser.full_name || balanceUser.email}</p>
              </div>
              <button onClick={() => setBalanceUser(null)} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-secondary/10 p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Balances</h4>
              {balances.length === 0 ? (
                <p className="text-sm text-muted-foreground">No balances found</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {balances.map((b) => (
                    <div key={b.asset} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                      <span className="text-sm font-semibold text-foreground">{b.asset}</span>
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-foreground">{Number(b.available).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p>
                        {Number(b.in_order) > 0 && (
                          <p className="font-mono text-[10px] text-muted-foreground">In order: {Number(b.in_order).toLocaleString(undefined, { maximumFractionDigits: 8 })}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-border p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Adjust Balance</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setAdjustAction("add")}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${adjustAction === "add" ? "bg-success/10 text-success ring-1 ring-success/30" : "bg-secondary text-muted-foreground"}`}
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
                <button
                  onClick={() => setAdjustAction("subtract")}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${adjustAction === "subtract" ? "bg-destructive/10 text-destructive ring-1 ring-destructive/30" : "bg-secondary text-muted-foreground"}`}
                >
                  <Minus className="h-4 w-4" /> Subtract
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <select
                  value={adjustAsset}
                  onChange={(e) => setAdjustAsset(e.target.value)}
                  className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none"
                >
                  {assets.map((a) => (<option key={a} value={a}>{a}</option>))}
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={handleAdjustBalance}
                disabled={balanceLoading || !adjustAmount}
                className={`mt-3 w-full rounded-xl py-2.5 text-sm font-semibold transition ${adjustAction === "add" ? "bg-success text-success-foreground hover:bg-success/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"} disabled:opacity-50`}
              >
                {balanceLoading ? "Processing..." : `${adjustAction === "add" ? "Add" : "Subtract"} ${adjustAmount || "0"} ${adjustAsset}`}
              </button>
              {adjustMsg && (
                <p className={`mt-2 text-center text-xs ${adjustMsg.startsWith("Error") ? "text-destructive" : "text-success"}`}>{adjustMsg}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
