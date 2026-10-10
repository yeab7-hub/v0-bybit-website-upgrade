"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Download, RefreshCw, XCircle, Clock, Loader2, ArrowUpRight, ClipboardList } from "lucide-react"
import Link from "next/link"

type Tab = "Open Orders" | "Order History" | "Trade History" | "Positions" | "PnL Analysis"
type RecordRow = {
  id: string
  pair?: string
  side?: string
  order_type?: string
  type?: string
  price?: number | string
  amount?: number | string
  filled?: number | string
  total?: number | string
  status?: string
  fee?: number | string
  pnl?: number | string
  created_at?: string
  leverage?: number | string
  entry_price?: number | string
  mark_price?: number | string
  margin?: number | string
  liquidation_price?: number | string
}

const tabs: Tab[] = ["Open Orders", "Order History", "Trade History", "Positions", "PnL Analysis"]
const num = (value: unknown) => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}
const money = (value: unknown) => num(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
const dateTime = (value?: string) => value ? new Date(value).toLocaleString() : "—"
const statusText = (value?: string) => (value ?? "unknown").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
const isOpen = (row: RecordRow) => ["open", "partially_filled", "partial"].includes((row.status ?? "").toLowerCase())

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Open Orders")
  const [market, setMarket] = useState("All")
  const [pair, setPair] = useState("All Pairs")
  const [side, setSide] = useState("All")
  const [orders, setOrders] = useState<RecordRow[]>([])
  const [trades, setTrades] = useState<RecordRow[]>([])
  const [positions, setPositions] = useState<RecordRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const loadData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [ordersResponse, tradesResponse, positionsResponse] = await Promise.all([
        fetch("/api/trade?type=order_history", { cache: "no-store" }),
        fetch("/api/trade?type=trades", { cache: "no-store" }),
        fetch("/api/trade?type=positions", { cache: "no-store" }),
      ])
      if ([ordersResponse, tradesResponse, positionsResponse].some((response) => response.status === 401)) {
        setError("Please log in to view your orders and trading history.")
        setOrders([])
        setTrades([])
        setPositions([])
        return
      }
      const [ordersData, tradesData, positionsData] = await Promise.all([
        ordersResponse.json(), tradesResponse.json(), positionsResponse.json(),
      ])
      if (!ordersResponse.ok || !tradesResponse.ok || !positionsResponse.ok) {
        throw new Error(ordersData.error || tradesData.error || positionsData.error || "Unable to load trading activity.")
      }
      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : [])
      setTrades(Array.isArray(tradesData.trades) ? tradesData.trades : [])
      setPositions(Array.isArray(positionsData.positions) ? positionsData.positions : [])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load trading activity.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  const filteredOrders = useMemo(() => orders.filter((row) => {
    if (activeTab === "Open Orders" && !isOpen(row)) return false
    if (activeTab === "Order History" && isOpen(row)) return false
    if (pair !== "All Pairs" && (row.pair ?? "").replace("-", "/").toUpperCase() !== pair) return false
    if (side !== "All" && (row.side ?? "").toLowerCase() !== side.toLowerCase()) return false
    if (market !== "All" && (row.order_type ?? "").toLowerCase().includes(market.toLowerCase()) === false) {
      // Spot/Futures is not consistently stored on every order, so only apply this
      // filter when a row explicitly declares its trading market.
      const rowMarket = (row as RecordRow & { market?: string }).market
      if (rowMarket && rowMarket.toLowerCase() !== market.toLowerCase()) return false
    }
    return true
  }), [orders, activeTab, pair, side, market])

  const filteredTrades = useMemo(() => trades.filter((row) => {
    if (pair !== "All Pairs" && (row.pair ?? "").replace("-", "/").toUpperCase() !== pair) return false
    if (side !== "All" && (row.side ?? "").toLowerCase() !== side.toLowerCase()) return false
    return true
  }), [trades, pair, side])

  const cancelOrder = async (id: string) => {
    setBusyId(id)
    setNotice("")
    setError("")
    try {
      const response = await fetch(`/api/trade?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not cancel this order.")
      setNotice("Order cancelled successfully.")
      await loadData()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not cancel this order.")
    } finally {
      setBusyId(null)
    }
  }

  const cancelAll = async () => {
    const cancellable = filteredOrders.filter(isOpen)
    if (!cancellable.length) return
    if (!window.confirm(`Cancel all ${cancellable.length} open order(s)?`)) return
    setBusyId("all")
    setNotice("")
    setError("")
    try {
      const results = await Promise.all(cancellable.map((row) =>
        fetch(`/api/trade?id=${encodeURIComponent(row.id)}`, { method: "DELETE" })
      ))
      const failed = results.filter((response) => !response.ok).length
      await loadData()
      setNotice(failed ? `Cancelled available orders. ${failed} order(s) could not be cancelled.` : "All selected orders were cancelled.")
    } catch {
      setError("Some orders could not be cancelled. Refresh and check their current status.")
    } finally {
      setBusyId(null)
    }
  }

  const exportCsv = () => {
    const rows = activeTab === "Trade History" ? filteredTrades : activeTab === "Positions" ? positions : filteredOrders
    const columns = ["pair", "side", "order_type", "price", "amount", "filled", "total", "status", "fee", "pnl", "created_at"]
    const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`
    const csv = [columns.join(","), ...rows.map((row) => columns.map((column) => escape((row as Record<string, unknown>)[column])).join(","))].join("\r\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `trading-${activeTab.toLowerCase().replaceAll(" ", "-")}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const pnlTotal = trades.reduce((sum, trade) => sum + num(trade.pnl), 0)
  const volumeTotal = trades.reduce((sum, trade) => sum + num(trade.total || (num(trade.price) * num(trade.amount))), 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-3 py-5 sm:px-4 sm:py-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Orders & Trading Activity</h1>
            <p className="mt-1 text-sm text-muted-foreground">View and manage your real account activity.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void loadData()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground hover:bg-secondary disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={exportCsv} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        {error && <div role="alert" className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">{error}{error.includes("log in") && <Link href="/login?redirect=/orders" className="ml-2 font-semibold text-primary underline">Log in</Link>}</div>}
        {notice && <div role="status" className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-foreground">{notice}</div>}

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard label="Open Orders" value={String(orders.filter(isOpen).length)} hint="Currently active" />
          <SummaryCard label="Recorded Trades" value={String(trades.length)} hint="Your recent trade records" />
          <SummaryCard label="Realized PnL" value={`${pnlTotal >= 0 ? "+" : ""}${money(pnlTotal)}`} hint={`Trade volume ${money(volumeTotal)}`} positive={pnlTotal >= 0} />
        </div>

        <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border" role="tablist" aria-label="Trading activity">
          {tabs.map((tab) => (
            <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)}
              className={`min-h-11 shrink-0 border-b-2 px-3 text-sm font-medium sm:px-4 ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {tab}{tab === "Open Orders" && orders.filter(isOpen).length > 0 && <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{orders.filter(isOpen).length}</span>}
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-secondary p-1">
            {["All", "Spot", "Futures", "Options"].map((item) => (
              <button key={item} onClick={() => setMarket(item)} className={`min-h-9 shrink-0 rounded-md px-3 text-xs font-medium ${market === item ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{item}</button>
            ))}
          </div>
          <select aria-label="Filter by pair" value={pair} onChange={(event) => setPair(event.target.value)} className="min-h-10 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground sm:w-auto">
            {["All Pairs", "BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "DOGE/USDT"].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select aria-label="Filter by side" value={side} onChange={(event) => setSide(event.target.value)} className="min-h-10 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground sm:w-auto">
            {["All", "Buy", "Sell"].map((item) => <option key={item} value={item}>{item} Side</option>)}
          </select>
          {activeTab === "Open Orders" && <button onClick={() => void cancelAll()} disabled={busyId !== null || !filteredOrders.some(isOpen)} className="min-h-10 rounded-lg border border-destructive/40 px-3 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50">{busyId === "all" ? "Cancelling…" : "Cancel filtered orders"}</button>}
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading your activity…</div>
        ) : activeTab === "PnL Analysis" ? (
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Trading performance</h2>
            <p className="mt-1 text-sm text-muted-foreground">Calculated from the trade records currently returned by your account.</p>
            {trades.length ? <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryCard label="Recorded PnL" value={`${pnlTotal >= 0 ? "+" : ""}${money(pnlTotal)}`} positive={pnlTotal >= 0} />
              <SummaryCard label="Trade Records" value={String(trades.length)} />
              <SummaryCard label="Recorded Volume" value={money(volumeTotal)} />
            </div> : <EmptyState message="No trade records yet. Your performance summary will appear here after trades are recorded." />}
          </div>
        ) : activeTab === "Positions" ? (
          <div className="space-y-3">
            {positions.length ? positions.map((row) => <div key={row.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><p className="font-semibold text-foreground">{row.pair || "Trading position"}</p><p className="mt-1 text-xs text-muted-foreground">{statusText(row.status)}{row.leverage ? ` · ${row.leverage}x` : ""}</p></div>
                <span className={`rounded-full px-2 py-1 text-xs ${(row.side ?? "").toLowerCase() === "buy" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>{statusText(row.side)}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DataCell label="Size" value={money(row.amount)} />
                <DataCell label="Entry price" value={money(row.entry_price ?? row.price)} />
                <DataCell label="Mark price" value={money(row.mark_price)} />
                <DataCell label="PnL" value={money(row.pnl)} />
              </div>
            </div>) : <EmptyState message="No open positions were found for your account." />}
          </div>
        ) : activeTab === "Trade History" ? (
          <RecordTable rows={filteredTrades} kind="trades" />
        ) : (
          <>
            {activeTab === "Open Orders" && filteredOrders.some(isOpen) && <p className="mb-2 text-xs text-muted-foreground">Cancelling an order releases its remaining locked balance through the trading API.</p>}
            <RecordTable rows={filteredOrders} kind={activeTab === "Open Orders" ? "open" : "history"} onCancel={cancelOrder} busyId={busyId} />
          </>
        )}
      </main>
      <div className="hidden lg:block"><Footer /></div>
    </div>
  )
}

function SummaryCard({ label, value, hint, positive }: { label: string; value: string; hint?: string; positive?: boolean }) {
  return <div className="min-w-0 rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-2 break-words text-xl font-bold tabular-nums ${positive === undefined ? "text-foreground" : positive ? "text-emerald-500" : "text-rose-500"}`}>{value}</p>{hint && <p className="mt-1 break-words text-xs text-muted-foreground">{hint}</p>}</div>
}

function DataCell({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-lg bg-secondary/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words font-mono text-sm text-foreground">{value}</p></div>
}

function EmptyState({ message }: { message: string }) {
  return <div className="flex flex-col items-center justify-center px-4 py-14 text-center"><ClipboardList className="h-9 w-9 text-muted-foreground" /><p className="mt-3 max-w-md text-sm text-muted-foreground">{message}</p><Link href="/trade" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Go to trading <ArrowUpRight className="h-4 w-4" /></Link></div>
}

function RecordTable({ rows, kind, onCancel, busyId }: { rows: RecordRow[]; kind: "open" | "history" | "trades"; onCancel?: (id: string) => void; busyId?: string | null }) {
  if (!rows.length) return <div className="rounded-xl border border-border bg-card"><EmptyState message={kind === "open" ? "You have no open orders matching these filters." : kind === "history" ? "No completed or cancelled orders match these filters." : "No trade records match these filters yet."} /></div>
  return <div className="space-y-3">
    {rows.map((row) => <article key={row.id} className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-foreground">{row.pair || "—"}</h3><span className={`rounded px-2 py-0.5 text-xs ${(row.side ?? "").toLowerCase() === "buy" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>{statusText(row.side)}</span></div><p className="mt-1 text-xs text-muted-foreground">{statusText(row.order_type || row.type)} · {dateTime(row.created_at)}</p></div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-foreground">{statusText(row.status)}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <DataCell label="Price" value={money(row.price)} />
        <DataCell label="Amount" value={money(row.amount)} />
        <DataCell label="Filled" value={money(row.filled)} />
        <DataCell label="Total" value={money(row.total || (num(row.price) * num(row.amount)))} />
        <DataCell label="Fee" value={row.fee == null ? "—" : money(row.fee)} />
        <DataCell label="PnL" value={row.pnl == null ? "—" : money(row.pnl)} />
      </div>
      {kind === "open" && onCancel && isOpen(row) && <div className="mt-3 flex justify-end"><button onClick={() => void onCancel(row.id)} disabled={busyId !== null && busyId !== undefined} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-destructive/40 px-3 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50">{busyId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Cancel order</button></div>}
    </article>)}
  </div>
}
