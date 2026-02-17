"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search, TrendingUp, TrendingDown, X, MoreVertical, Edit3,
  XCircle, ChevronLeft, ChevronRight, Plus, Eye, RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Trade {
  id: string
  user_id: string
  pair: string
  side: string
  price: number
  amount: number
  total: number
  fee: number
  pnl: number
  created_at: string
  profiles?: { email: string; full_name: string }
}

interface Order {
  id: string
  user_id: string
  pair: string
  side: string
  order_type: string
  price: number
  stop_price: number | null
  amount: number
  filled: number
  total: number
  status: string
  created_at: string
  profiles?: { email: string; full_name: string }
}

export default function AdminTradesPage() {
  const [tab, setTab] = useState<"trades" | "orders">("trades")
  const [trades, setTrades] = useState<Trade[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  // Modals
  const [modifyOrder, setModifyOrder] = useState<Order | null>(null)
  const [modifyPrice, setModifyPrice] = useState("")
  const [modifyAmount, setModifyAmount] = useState("")
  const [modifyMsg, setModifyMsg] = useState("")

  const [openTradeModal, setOpenTradeModal] = useState(false)
  const [otUserId, setOtUserId] = useState("")
  const [otPair, setOtPair] = useState("BTC/USDT")
  const [otSide, setOtSide] = useState<"buy" | "sell">("buy")
  const [otAmount, setOtAmount] = useState("")
  const [otPrice, setOtPrice] = useState("")
  const [otMsg, setOtMsg] = useState("")
  const [otLoading, setOtLoading] = useState(false)

  // Users for the dropdown
  const [users, setUsers] = useState<{ id: string; email: string; full_name: string }[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [tRes, oRes] = await Promise.all([
        fetch(`/api/admin/trades?type=trades&search=${encodeURIComponent(search)}`),
        fetch(`/api/admin/trades?type=orders&search=${encodeURIComponent(search)}`),
      ])
      const tData = await tRes.json()
      const oData = await oRes.json()
      setTrades(tData.trades ?? [])
      setOrders(oData.orders ?? [])
    } catch (err) {
      console.error("Failed to fetch trades:", err)
    }
    setLoading(false)
  }, [search])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users?pageSize=500")
      const data = await res.json()
      setUsers((data.users ?? []).map((u: any) => ({ id: u.id, email: u.email, full_name: u.full_name })))
    } catch {}
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchUsers() }, [fetchUsers])

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Cancel this order?")) return
    const res = await fetch("/api/admin/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel_order", order_id: orderId }),
    })
    const data = await res.json()
    if (data.success) fetchData()
    else alert(data.error || "Failed to cancel")
  }

  const handleModifyOrder = async () => {
    if (!modifyOrder) return
    setModifyMsg("")
    const res = await fetch("/api/admin/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "modify_order",
        order_id: modifyOrder.id,
        new_price: modifyPrice || undefined,
        new_amount: modifyAmount || undefined,
      }),
    })
    const data = await res.json()
    if (data.success) {
      setModifyMsg("Order modified successfully")
      fetchData()
      setTimeout(() => setModifyOrder(null), 1000)
    } else {
      setModifyMsg(data.error || "Failed to modify")
    }
  }

  const handleOpenTrade = async () => {
    if (!otUserId || !otPair || !otAmount) return
    setOtLoading(true)
    setOtMsg("")
    const res = await fetch("/api/admin/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "open_trade",
        target_user_id: otUserId,
        pair: otPair,
        side: otSide,
        amount: parseFloat(otAmount),
        price: otPrice ? parseFloat(otPrice) : undefined,
      }),
    })
    const data = await res.json()
    if (data.success) {
      setOtMsg(data.message)
      fetchData()
      setTimeout(() => { setOpenTradeModal(false); setOtMsg("") }, 2000)
    } else {
      setOtMsg(data.error || "Failed to open trade")
    }
    setOtLoading(false)
  }

  const pairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "XRP/USDT", "ADA/USDT", "DOGE/USDT"]

  return (
    <div>
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-4 py-5 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Trade Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">View, modify, and manage all user trades and orders</p>
          </div>
          <Button
            onClick={() => { setOpenTradeModal(true); setOtMsg("") }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            size="sm"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Open Trade
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 lg:px-8">
        {/* Tabs + Search */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("trades")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "trades" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
            >
              Trade History
            </button>
            <button
              onClick={() => setTab("orders")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "orders" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
            >
              Open Orders
            </button>
            <button onClick={fetchData} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 focus-within:border-primary/50">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by email, name, or pair..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Trades Table */}
        {tab === "trades" && (
          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Pair</th>
                    <th className="px-4 py-3 font-medium">Side</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Fee</th>
                    <th className="px-4 py-3 font-medium">P&L</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">{loading ? "Loading..." : "No trades found"}</td></tr>
                  ) : (
                    trades.map((t) => (
                      <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-foreground">{t.profiles?.full_name || "Unknown"}</div>
                          <div className="text-[10px] text-muted-foreground">{t.profiles?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{t.pair}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs font-medium ${t.side === "buy" ? "text-success" : "text-destructive"}`}>
                            {t.side === "buy" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {t.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-foreground">${Number(t.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 font-mono text-sm text-foreground">{Number(t.amount).toFixed(6)}</td>
                        <td className="px-4 py-3 font-mono text-sm text-foreground">${Number(t.total).toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">${Number(t.fee).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`font-mono text-xs font-medium ${Number(t.pnl) >= 0 ? "text-success" : "text-destructive"}`}>
                            {Number(t.pnl) >= 0 ? "+" : ""}${Number(t.pnl).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {tab === "orders" && (
          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Pair</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Side</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Filled</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">{loading ? "Loading..." : "No orders found"}</td></tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-foreground">{o.profiles?.full_name || "Unknown"}</div>
                          <div className="text-[10px] text-muted-foreground">{o.profiles?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{o.pair}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{o.order_type}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${o.side === "buy" ? "text-success" : "text-destructive"}`}>
                            {o.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-foreground">${Number(o.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 font-mono text-sm text-foreground">{Number(o.amount).toFixed(6)}</td>
                        <td className="px-4 py-3 font-mono text-sm text-foreground">{Number(o.filled).toFixed(6)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            o.status === "open" ? "bg-primary/10 text-primary" :
                            o.status === "filled" ? "bg-success/10 text-success" :
                            o.status === "cancelled" ? "bg-secondary text-muted-foreground" :
                            "bg-yellow-500/10 text-yellow-500"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          {(o.status === "open" || o.status === "partially_filled") && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { setModifyOrder(o); setModifyPrice(String(o.price)); setModifyAmount(String(o.amount)); setModifyMsg("") }}
                                className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                title="Modify"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => cancelOrder(o.id)}
                                className="rounded-md p-1 text-destructive hover:bg-destructive/10"
                                title="Cancel"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modify Order Modal */}
      {modifyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setModifyOrder(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Modify Order</h3>
              <button onClick={() => setModifyOrder(null)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{modifyOrder.pair} - {modifyOrder.side.toUpperCase()} - {modifyOrder.profiles?.email}</p>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Price (USD)</label>
                <input
                  type="number"
                  value={modifyPrice}
                  onChange={(e) => setModifyPrice(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Amount</label>
                <input
                  type="number"
                  value={modifyAmount}
                  onChange={(e) => setModifyAmount(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>
            </div>

            <button onClick={handleModifyOrder} className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Save Changes
            </button>
            {modifyMsg && <p className={`mt-2 text-center text-xs ${modifyMsg.includes("success") ? "text-success" : "text-destructive"}`}>{modifyMsg}</p>}
          </div>
        </div>
      )}

      {/* Open Trade Modal */}
      {openTradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setOpenTradeModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Open Trade for User</h3>
              <button onClick={() => setOpenTradeModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">User</label>
                <select
                  value={otUserId}
                  onChange={(e) => setOtUserId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none"
                >
                  <option value="">Select user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name || u.email} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Pair</label>
                <select
                  value={otPair}
                  onChange={(e) => setOtPair(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none"
                >
                  {pairs.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Side</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOtSide("buy")}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${otSide === "buy" ? "bg-success/10 text-success ring-1 ring-success/30" : "bg-secondary text-muted-foreground"}`}
                  >
                    BUY
                  </button>
                  <button
                    onClick={() => setOtSide("sell")}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${otSide === "sell" ? "bg-destructive/10 text-destructive ring-1 ring-destructive/30" : "bg-secondary text-muted-foreground"}`}
                  >
                    SELL
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Amount</label>
                <input
                  type="number"
                  value={otAmount}
                  onChange={(e) => setOtAmount(e.target.value)}
                  placeholder="e.g. 0.5"
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Price (optional, uses market)</label>
                <input
                  type="number"
                  value={otPrice}
                  onChange={(e) => setOtPrice(e.target.value)}
                  placeholder="Leave empty for market price"
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <button
              onClick={handleOpenTrade}
              disabled={otLoading || !otUserId || !otAmount}
              className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {otLoading ? "Executing..." : `Execute ${otSide.toUpperCase()} Trade`}
            </button>
            {otMsg && <p className={`mt-2 text-center text-xs ${otMsg.includes("Error") || otMsg.includes("Insufficient") ? "text-destructive" : "text-success"}`}>{otMsg}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
