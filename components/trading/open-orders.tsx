"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { useState } from "react"
import { X, Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function OpenOrders() {
  const [tab, setTab] = useState<"orders" | "trades">("orders")
  const { data: ordersData } = useSWR("/api/trade?type=orders", fetcher, { refreshInterval: 5000 })
  const { data: tradesData } = useSWR("/api/trade?type=trades", fetcher, { refreshInterval: 5000 })
  const { data: balData } = useSWR("/api/trade?type=balances", fetcher, { refreshInterval: 5000 })
  const [cancelling, setCancelling] = useState<string | null>(null)

  const orders = ordersData?.orders ?? []
  const trades = tradesData?.trades ?? []
  const balances = balData?.balances ?? []

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
        {trades.length > 0 && (
          <div className="ml-auto flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Total P&L:</span>
            <span className={`font-mono text-xs font-semibold ${totalPnl >= 0 ? "text-success" : "text-destructive"}`}>
              {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)} USDT
            </span>
          </div>
        )}
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
                  <th className="px-2 py-2 text-right font-medium">Amount</th>
                  <th className="px-2 py-2 text-right font-medium">Filled</th>
                  <th className="px-2 py-2 text-right font-medium">Total</th>
                  <th className="px-4 py-2 text-right font-medium">Cancel</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: { id: string; pair: string; order_type: string; side: string; price: number; amount: number; filled: number; total: number }) => (
                  <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-2 font-medium text-foreground">{o.pair}</td>
                    <td className="px-2 py-2 capitalize text-muted-foreground">{o.order_type}</td>
                    <td className={`px-2 py-2 font-medium uppercase ${o.side === "buy" ? "text-success" : "text-destructive"}`}>{o.side}</td>
                    <td className="px-2 py-2 text-right font-mono text-foreground">${Number(o.price).toLocaleString()}</td>
                    <td className="px-2 py-2 text-right font-mono text-foreground">{Number(o.amount).toFixed(6)}</td>
                    <td className="px-2 py-2 text-right font-mono text-muted-foreground">{Number(o.filled).toFixed(6)}</td>
                    <td className="px-2 py-2 text-right font-mono text-foreground">${Number(o.total).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => cancelOrder(o.id)} disabled={cancelling === o.id} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        {cancelling === o.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
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
                  <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-2 text-muted-foreground">{new Date(t.created_at).toLocaleTimeString()}</td>
                    <td className="px-2 py-2 font-medium text-foreground">{t.pair}</td>
                    <td className={`px-2 py-2 font-medium uppercase ${t.side === "buy" ? "text-success" : "text-destructive"}`}>{t.side}</td>
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
        )}

        {/* Balances section at bottom */}
        {balances.length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <p className="mb-2 text-[10px] font-medium text-muted-foreground">Trading Balances</p>
            <div className="flex flex-wrap gap-4">
              {balances.filter((b: { available: number; in_order: number }) => Number(b.available) > 0 || Number(b.in_order) > 0).map((b: { asset: string; available: number; in_order: number }) => (
                <div key={b.asset} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{b.asset}</span>
                  <span className="font-mono text-xs text-muted-foreground">{Number(b.available).toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                  {Number(b.in_order) > 0 && <span className="font-mono text-[10px] text-primary">(locked: {Number(b.in_order).toFixed(4)})</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
