"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { useState, useEffect } from "react"
import { X, Loader2, TrendingUp, TrendingDown, Clock, CheckCircle2, ArrowUpDown, Info, CircleDot } from "lucide-react"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function OpenOrders() {
  const [tab, setTab] = useState<"orders" | "trades" | "balances">("orders")
  const { data: ordersData, mutate: mutOrders } = useSWR("/api/trade?type=orders", fetcher, { refreshInterval: 3000 })
  const { data: tradesData, mutate: mutTrades } = useSWR("/api/trade?type=trades", fetcher, { refreshInterval: 3000 })
  const { data: balData } = useSWR("/api/trade?type=balances", fetcher, { refreshInterval: 3000 })
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [lastTradeCount, setLastTradeCount] = useState(0)
  const [flashTrade, setFlashTrade] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedTrade, setSelectedTrade] = useState<any>(null)

  const { crypto } = useLivePrices(3000)

  const orders = ordersData?.orders ?? []
  const trades = tradesData?.trades ?? []
  const balances = balData?.balances ?? []

  // Periodically check if open limit orders should be filled
  useEffect(() => {
    if (orders.length === 0) return
    const checkFills = async () => {
      try {
        const res = await fetch("/api/trade/fill")
        const data = await res.json()
        if (data.filled > 0) {
          // Orders were filled! Refresh everything
          globalMutate("/api/trade?type=orders")
          globalMutate("/api/trade?type=trades")
          globalMutate("/api/trade?type=balances")
        }
      } catch { /* ignore */ }
    }
    checkFills() // Check immediately
    const iv = setInterval(checkFills, 8000) // Then every 8s
    return () => clearInterval(iv)
  }, [orders.length])

  // Flash new trades - switch to trades tab and highlight
  useEffect(() => {
    if (trades.length > 0 && trades.length > lastTradeCount && lastTradeCount > 0) {
      setTab("trades")
      setFlashTrade(trades[0]?.id)
      setTimeout(() => setFlashTrade(null), 2000)
    }
    setLastTradeCount(trades.length)
  }, [trades.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const cancelOrder = async (orderId: string) => {
    setCancelling(orderId)
    try {
      await fetch(`/api/trade?id=${orderId}`, { method: "DELETE" })
      globalMutate("/api/trade?type=orders")
      globalMutate("/api/trade?type=balances")
    } catch { /* ignore */ }
    setCancelling(null)
  }

  const totalPnl = trades.reduce((sum: number, t: { pnl: number }) => sum + (Number(t.pnl) || 0), 0)

  // Calculate live unrealized P&L for open orders
  const unrealizedPnl = orders.reduce((sum: number, o: { pair: string; side: string; price: number; amount: number; filled: number }) => {
    const baseAsset = o.pair.split("/")[0]
    const currentPrice = crypto.find((c) => c.symbol === baseAsset)?.price ?? 0
    if (currentPrice > 0 && o.side === "buy") {
      return sum + (currentPrice - Number(o.price)) * Number(o.amount - o.filled)
    }
    if (currentPrice > 0 && o.side === "sell") {
      return sum + (Number(o.price) - currentPrice) * Number(o.amount - o.filled)
    }
    return sum
  }, 0)

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center gap-4 border-b border-border px-4">
        <button onClick={() => setTab("orders")} className={`relative py-2.5 text-xs font-medium transition-colors ${tab === "orders" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          Open Orders ({orders.length})
          {tab === "orders" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button onClick={() => setTab("trades")} className={`relative py-2.5 text-xs font-medium transition-colors ${tab === "trades" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          Trade History ({trades.length})
          {tab === "trades" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button onClick={() => setTab("balances")} className={`relative py-2.5 text-xs font-medium transition-colors ${tab === "balances" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          Balances
          {tab === "balances" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>

        {/* P&L summary on the right */}
        <div className="ml-auto flex items-center gap-3">
          {trades.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Realized:</span>
              <span className={`font-mono text-xs font-semibold ${totalPnl >= 0 ? "text-success" : "text-destructive"}`}>
                {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)}
              </span>
            </div>
          )}
          {orders.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Unrealized:</span>
              <span className={`font-mono text-xs font-semibold ${unrealizedPnl >= 0 ? "text-success" : "text-destructive"}`}>
                {unrealizedPnl >= 0 ? "+" : ""}{unrealizedPnl.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {tab === "orders" ? (
          orders.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-12">
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/20" />
              <p className="text-xs text-muted-foreground">No open orders</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">Pair</th>
                  <th className="px-2 py-2 text-left font-medium">Type</th>
                  <th className="px-2 py-2 text-left font-medium">Side</th>
                  <th className="px-2 py-2 text-right font-medium">Price</th>
                  <th className="px-2 py-2 text-right font-medium">Current</th>
                  <th className="px-2 py-2 text-right font-medium">Amount</th>
                  <th className="px-2 py-2 text-right font-medium">Filled</th>
                  <th className="px-2 py-2 text-right font-medium">Unreal. P&L</th>
                  <th className="px-4 py-2 text-right font-medium">Cancel</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: { id: string; pair: string; order_type: string; side: string; price: number; amount: number; filled: number; total: number }) => {
                  const baseAsset = o.pair.split("/")[0]
                  const currentPrice = crypto.find((c) => c.symbol === baseAsset)?.price ?? 0
                  const remaining = Number(o.amount) - Number(o.filled)
                  const uPnl = o.side === "buy"
                    ? (currentPrice - Number(o.price)) * remaining
                    : (Number(o.price) - currentPrice) * remaining
                  return (
                    <tr key={o.id} onClick={() => setSelectedOrder(o)} className="cursor-pointer border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-2 font-medium text-foreground">{o.pair}</td>
                      <td className="px-2 py-2 capitalize text-muted-foreground">{o.order_type}</td>
                      <td className={`px-2 py-2 font-medium uppercase ${o.side === "buy" ? "text-success" : "text-destructive"}`}>{o.side}</td>
                      <td className="px-2 py-2 text-right font-mono text-foreground">${Number(o.price).toLocaleString()}</td>
                      <td className="px-2 py-2 text-right font-mono text-muted-foreground">{currentPrice > 0 ? `$${formatPrice(currentPrice)}` : "--"}</td>
                      <td className="px-2 py-2 text-right font-mono text-foreground">{Number(o.amount).toFixed(6)}</td>
                      <td className="px-2 py-2 text-right font-mono text-muted-foreground">{Number(o.filled).toFixed(6)}</td>
                      <td className={`px-2 py-2 text-right font-mono font-semibold ${uPnl >= 0 ? "text-success" : "text-destructive"}`}>
                        {currentPrice > 0 ? `${uPnl >= 0 ? "+" : ""}${uPnl.toFixed(2)}` : "--"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => cancelOrder(o.id)} disabled={cancelling === o.id} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          {cancelling === o.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        ) : tab === "trades" ? (
          trades.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-12">
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/20" />
              <p className="text-xs text-muted-foreground">No trades yet - place your first order</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">Time</th>
                  <th className="px-2 py-2 text-left font-medium">Pair</th>
                  <th className="px-2 py-2 text-left font-medium">Side</th>
                  <th className="px-2 py-2 text-right font-medium">Price</th>
                  <th className="px-2 py-2 text-right font-medium">Amount</th>
                  <th className="px-2 py-2 text-right font-medium">Total</th>
                  <th className="px-2 py-2 text-right font-medium">Fee</th>
                  <th className="px-4 py-2 text-right font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t: { id: string; created_at: string; pair: string; side: string; price: number; amount: number; total: number; fee: number; pnl: number }) => (
                  <tr key={t.id} onClick={() => setSelectedTrade(t)} className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-secondary/30 ${flashTrade === t.id ? "bg-success/10" : ""}`}>
                    <td className="px-4 py-2 text-muted-foreground">{new Date(t.created_at).toLocaleTimeString()}</td>
                    <td className="px-2 py-2 font-medium text-foreground">{t.pair}</td>
                    <td className={`px-2 py-2 font-medium uppercase ${t.side === "buy" ? "text-success" : "text-destructive"}`}>
                      <div className="flex items-center gap-1">
                        {t.side === "buy" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {t.side}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right font-mono text-foreground">${Number(t.price).toLocaleString()}</td>
                    <td className="px-2 py-2 text-right font-mono text-foreground">{Number(t.amount).toFixed(6)}</td>
                    <td className="px-2 py-2 text-right font-mono text-foreground">${Number(t.total).toLocaleString()}</td>
                    <td className="px-2 py-2 text-right font-mono text-muted-foreground">{Number(t.fee).toFixed(4)}</td>
                    <td className={`px-4 py-2 text-right font-mono font-semibold ${Number(t.pnl) >= 0 ? "text-success" : "text-destructive"}`}>
                      {Number(t.pnl) >= 0 ? "+" : ""}{Number(t.pnl).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          /* Balances Tab */
          balances.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-12">
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/20" />
              <p className="text-xs text-muted-foreground">No balances - deposit funds to start trading</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">Asset</th>
                  <th className="px-2 py-2 text-right font-medium">Available</th>
                  <th className="px-2 py-2 text-right font-medium">In Order</th>
                  <th className="px-2 py-2 text-right font-medium">Current Price</th>
                  <th className="px-4 py-2 text-right font-medium">USD Value</th>
                </tr>
              </thead>
              <tbody>
                {balances
                  .filter((b: { available: number; in_order: number }) => Number(b.available) > 0 || Number(b.in_order) > 0)
                  .map((b: { asset: string; available: number; in_order: number }) => {
                    const total = Number(b.available) + Number(b.in_order)
                    const price = b.asset === "USDT" ? 1 : (crypto.find((c) => c.symbol === b.asset)?.price ?? 0)
                    const usdValue = total * price
                    return (
                      <tr key={b.asset} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="px-4 py-2 font-semibold text-foreground">{b.asset}</td>
                        <td className="px-2 py-2 text-right font-mono text-foreground">{Number(b.available).toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                        <td className="px-2 py-2 text-right font-mono text-muted-foreground">
                          {Number(b.in_order) > 0 ? Number(b.in_order).toLocaleString(undefined, { maximumFractionDigits: 6 }) : "0"}
                        </td>
                        <td className="px-2 py-2 text-right font-mono text-muted-foreground">
                          {b.asset === "USDT" ? "$1.00" : price > 0 ? `$${formatPrice(price)}` : "--"}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-foreground">
                          ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* ===== Order Detail Modal ===== */}
      {selectedOrder && (() => {
        const o = selectedOrder
        const baseAsset = o.pair.split("/")[0]
        const currentPrice = crypto.find((c: { symbol: string }) => c.symbol === baseAsset)?.price ?? 0
        const remaining = Number(o.amount) - Number(o.filled)
        const fillPercent = Number(o.amount) > 0 ? (Number(o.filled) / Number(o.amount)) * 100 : 0
        const uPnl = o.side === "buy"
          ? (currentPrice - Number(o.price)) * remaining
          : (Number(o.price) - currentPrice) * remaining
        const distancePercent = currentPrice > 0 ? (((currentPrice - Number(o.price)) / Number(o.price)) * 100) : 0

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${o.side === "buy" ? "bg-success/10" : "bg-destructive/10"}`}>
                    <ArrowUpDown className={`h-5 w-5 ${o.side === "buy" ? "text-success" : "text-destructive"}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{o.pair}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{o.order_type} {o.side} order</p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-[#f7a600]/10 px-3 py-1 text-xs font-semibold text-[#f7a600]">
                  <Clock className="h-3 w-3" /> Open
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${o.side === "buy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {o.side.toUpperCase()}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize text-muted-foreground">{o.order_type}</span>
              </div>

              {/* Fill Progress */}
              <div className="mt-4 rounded-xl border border-border bg-secondary/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Fill Progress</span>
                  <span className="font-mono text-xs font-semibold text-foreground">{fillPercent.toFixed(1)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full rounded-full transition-all ${o.side === "buy" ? "bg-success" : "bg-destructive"}`} style={{ width: `${fillPercent}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Filled: {Number(o.filled).toFixed(6)} {baseAsset}</span>
                  <span>Remaining: {remaining.toFixed(6)} {baseAsset}</span>
                </div>
              </div>

              {/* Price Details */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-secondary/20 p-3">
                  <p className="text-[10px] text-muted-foreground">Order Price</p>
                  <p className="font-mono text-sm font-bold text-foreground">${Number(o.price).toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-3">
                  <p className="text-[10px] text-muted-foreground">Current Price</p>
                  <p className="font-mono text-sm font-bold text-foreground">{currentPrice > 0 ? `$${formatPrice(currentPrice)}` : "--"}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-3">
                  <p className="text-[10px] text-muted-foreground">Distance</p>
                  <p className={`font-mono text-sm font-semibold ${distancePercent >= 0 ? "text-success" : "text-destructive"}`}>
                    {distancePercent >= 0 ? "+" : ""}{distancePercent.toFixed(2)}%
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-3">
                  <p className="text-[10px] text-muted-foreground">Unrealized P&L</p>
                  <p className={`font-mono text-sm font-semibold ${uPnl >= 0 ? "text-success" : "text-destructive"}`}>
                    {uPnl >= 0 ? "+" : ""}{uPnl.toFixed(2)} USDT
                  </p>
                </div>
              </div>

              {/* Order Details */}
              <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-secondary/10 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-mono text-foreground">{Number(o.amount).toFixed(6)} {baseAsset}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order Value</span>
                  <span className="font-mono text-foreground">${(Number(o.price) * Number(o.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Est. Fee (0.1%)</span>
                  <span className="font-mono text-muted-foreground">${(Number(o.price) * Number(o.amount) * 0.001).toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-foreground">{o.created_at ? new Date(o.created_at).toLocaleString() : "Just now"}</span>
                </div>
              </div>

              {/* Cancel Button */}
              <button onClick={() => { cancelOrder(o.id); setSelectedOrder(null) }}
                className="mt-4 w-full rounded-xl border border-destructive/30 bg-destructive/5 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10">
                Cancel Order
              </button>
            </div>
          </div>
        )
      })()}

      {/* ===== Trade Result Modal ===== */}
      {selectedTrade && (() => {
        const t = selectedTrade
        const isProfit = Number(t.pnl) >= 0
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setSelectedTrade(null)}>
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.side === "buy" ? "bg-success/10" : "bg-destructive/10"}`}>
                    {t.side === "buy" ? <TrendingUp className="h-5 w-5 text-success" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{t.pair}</h3>
                    <p className="text-xs text-muted-foreground capitalize">Completed {t.side} trade</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTrade(null)} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status */}
              <div className="mt-4 flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  <CheckCircle2 className="h-3 w-3" /> Filled
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.side === "buy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {t.side.toUpperCase()}
                </span>
              </div>

              {/* P&L Highlight */}
              <div className={`mt-4 rounded-xl border p-4 text-center ${isProfit ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Realized P&L</p>
                <p className={`mt-1 font-mono text-2xl font-bold ${isProfit ? "text-success" : "text-destructive"}`}>
                  {isProfit ? "+" : ""}{Number(t.pnl).toFixed(2)} USDT
                </p>
              </div>

              {/* Trade Details */}
              <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-secondary/10 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Execution Price</span>
                  <span className="font-mono text-foreground">${Number(t.price).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono text-foreground">{Number(t.amount).toFixed(6)} {t.pair.split("/")[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Value</span>
                  <span className="font-mono text-foreground">${Number(t.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fee Paid</span>
                  <span className="font-mono text-muted-foreground">{Number(t.fee).toFixed(4)} USDT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-foreground">{new Date(t.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
