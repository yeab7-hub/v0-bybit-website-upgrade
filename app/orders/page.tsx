"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Search, Filter, Download, Calendar, ChevronDown, ArrowUpDown, X, ExternalLink, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const tabs = ["Open Orders", "Order History", "Trade History", "Positions", "PnL Analysis"]
const markets = ["All", "Spot", "Futures", "Options"]
const pairs = ["All Pairs", "BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "DOGE/USDT"]
const sides = ["All", "Buy", "Sell"]
const statuses = ["All", "Filled", "Partially Filled", "Cancelled", "Expired"]

const openOrders = [
  { pair: "BTC/USDT", side: "Buy", type: "Limit", price: "62,500.00", amount: "0.15", filled: "0.00", total: "9,375.00", time: "2024-02-15 14:32:10", status: "Open" },
  { pair: "ETH/USDT", side: "Buy", type: "Limit", price: "2,280.00", amount: "5.00", filled: "2.50", total: "11,400.00", time: "2024-02-15 13:10:45", status: "Partial" },
  { pair: "SOL/USDT", side: "Sell", type: "Stop Limit", price: "125.00", amount: "40", filled: "0.00", total: "5,000.00", time: "2024-02-15 11:05:30", status: "Open" },
]

const orderHistory = [
  { pair: "BTC/USDT", side: "Buy", type: "Market", price: "64,850.00", amount: "0.10", filled: "0.10", total: "6,485.00", time: "2024-02-15 10:22:18", status: "Filled", fee: "6.49 USDT" },
  { pair: "ETH/USDT", side: "Sell", type: "Limit", price: "2,420.00", amount: "3.00", filled: "3.00", total: "7,260.00", time: "2024-02-14 22:15:40", status: "Filled", fee: "7.26 USDT" },
  { pair: "SOL/USDT", side: "Buy", type: "Market", price: "135.50", amount: "20", filled: "20", total: "2,710.00", time: "2024-02-14 18:30:05", status: "Filled", fee: "2.71 USDT" },
  { pair: "DOGE/USDT", side: "Sell", type: "Limit", price: "0.0920", amount: "10,000", filled: "0", total: "920.00", time: "2024-02-14 15:00:00", status: "Cancelled", fee: "0.00 USDT" },
  { pair: "XRP/USDT", side: "Buy", type: "Limit", price: "0.5200", amount: "5,000", filled: "5,000", total: "2,600.00", time: "2024-02-13 09:45:20", status: "Filled", fee: "2.60 USDT" },
  { pair: "BTC/USDT", side: "Sell", type: "Market", price: "65,100.00", amount: "0.05", filled: "0.05", total: "3,255.00", time: "2024-02-12 20:10:55", status: "Filled", fee: "3.26 USDT" },
]

const positions = [
  { pair: "BTCUSDT", side: "Long", size: "0.5 BTC", entry: "63,200.00", mark: "64,900.00", pnl: "+$850.00", pnlPct: "+2.69%", margin: "6,320.00", liq: "57,880.00", leverage: "10x" },
  { pair: "ETHUSDT", side: "Short", size: "10 ETH", entry: "2,450.00", mark: "2,400.00", pnl: "+$500.00", pnlPct: "+2.04%", margin: "2,450.00", liq: "2,695.00", leverage: "10x" },
  { pair: "SOLUSDT", side: "Long", size: "100 SOL", entry: "130.00", mark: "135.00", pnl: "+$500.00", pnlPct: "+3.85%", margin: "1,300.00", liq: "117.00", leverage: "10x" },
]

const pnlData = [
  { date: "Feb 15", pnl: "+$1,245.00", trades: 8, winRate: "75%", volume: "$45,200" },
  { date: "Feb 14", pnl: "-$320.00", trades: 12, winRate: "50%", volume: "$62,800" },
  { date: "Feb 13", pnl: "+$890.00", trades: 6, winRate: "83%", volume: "$28,500" },
  { date: "Feb 12", pnl: "+$2,100.00", trades: 15, winRate: "67%", volume: "$95,300" },
  { date: "Feb 11", pnl: "-$450.00", trades: 9, winRate: "44%", volume: "$38,700" },
  { date: "Feb 10", pnl: "+$1,680.00", trades: 11, winRate: "73%", volume: "$71,200" },
  { date: "Feb 9", pnl: "+$560.00", trades: 7, winRate: "71%", volume: "$32,100" },
]

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("Open Orders")
  const [market, setMarket] = useState("All")
  const [pair, setPair] = useState("All Pairs")
  const [side, setSide] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Orders</h1>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs border-border text-foreground"><Download className="mr-1 h-3 w-3" /> Export</Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t} {t === "Open Orders" && openOrders.length > 0 && <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{openOrders.length}</span>}
                {t === "Positions" && positions.length > 0 && <span className="ml-1 rounded-full bg-[#0ecb81]/10 px-1.5 py-0.5 text-[10px] text-[#0ecb81]">{positions.length}</span>}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-secondary p-0.5">
              {markets.map(m => (
                <button key={m} onClick={() => setMarket(m)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${market === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{m}</button>
              ))}
            </div>
            <select value={pair} onChange={(e) => setPair(e.target.value)} className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-foreground outline-none">
              {pairs.map(p => <option key={p} value={p} className="bg-card">{p}</option>)}
            </select>
            <select value={side} onChange={(e) => setSide(e.target.value)} className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-foreground outline-none">
              {sides.map(s => <option key={s} value={s} className="bg-card">{s}</option>)}
            </select>
            <button className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"><Calendar className="h-3 w-3" /> Date Range</button>
          </div>

          {/* Open Orders */}
          {activeTab === "Open Orders" && (
            <div className="rounded-xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Pair</th><th className="px-4 py-3 font-medium">Side</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Filled</th><th className="px-4 py-3 font-medium">Total</th><th className="px-4 py-3 font-medium">Time</th><th className="px-4 py-3 font-medium">Action</th>
                  </tr></thead>
                  <tbody>
                    {openOrders.map((o, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                        <td className="px-4 py-3 text-xs font-medium text-foreground">{o.pair}</td>
                        <td className={`px-4 py-3 text-xs font-medium ${o.side === "Buy" ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{o.side}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{o.type}</td>
                        <td className="px-4 py-3 text-xs text-foreground">{o.price}</td>
                        <td className="px-4 py-3 text-xs text-foreground">{o.amount}</td>
                        <td className="px-4 py-3 text-xs text-foreground">{o.filled}</td>
                        <td className="px-4 py-3 text-xs text-foreground">{o.total}</td>
                        <td className="px-4 py-3 text-[10px] text-muted-foreground">{o.time}</td>
                        <td className="px-4 py-3"><button className="text-xs text-[#f6465d] hover:underline">Cancel</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {openOrders.length > 0 && (
                <div className="border-t border-border px-4 py-3"><button className="text-xs text-[#f6465d] hover:underline">Cancel All Orders</button></div>
              )}
            </div>
          )}

          {/* Order History */}
          {activeTab === "Order History" && (
            <div className="rounded-xl border border-border bg-card overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Pair</th><th className="px-4 py-3 font-medium">Side</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Filled</th><th className="px-4 py-3 font-medium">Fee</th><th className="px-4 py-3 font-medium">Time</th><th className="px-4 py-3 font-medium">Status</th>
                </tr></thead>
                <tbody>
                  {orderHistory.map((o, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 text-xs font-medium text-foreground">{o.pair}</td>
                      <td className={`px-4 py-3 text-xs font-medium ${o.side === "Buy" ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{o.side}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{o.type}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{o.price}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{o.amount}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{o.filled}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{o.fee}</td>
                      <td className="px-4 py-3 text-[10px] text-muted-foreground">{o.time}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${o.status === "Filled" ? "bg-[#0ecb81]/10 text-[#0ecb81]" : o.status === "Cancelled" ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary"}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Trade History */}
          {activeTab === "Trade History" && (
            <div className="rounded-xl border border-border bg-card overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Pair</th><th className="px-4 py-3 font-medium">Side</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Quantity</th><th className="px-4 py-3 font-medium">Fee</th><th className="px-4 py-3 font-medium">Total</th><th className="px-4 py-3 font-medium">Time</th>
                </tr></thead>
                <tbody>
                  {orderHistory.filter(o => o.status === "Filled").map((o, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 text-xs font-medium text-foreground">{o.pair}</td>
                      <td className={`px-4 py-3 text-xs font-medium ${o.side === "Buy" ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{o.side}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{o.price}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{o.filled}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{o.fee}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{o.total}</td>
                      <td className="px-4 py-3 text-[10px] text-muted-foreground">{o.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Positions */}
          {activeTab === "Positions" && (
            <div className="rounded-xl border border-border bg-card overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Symbol</th><th className="px-4 py-3 font-medium">Side</th><th className="px-4 py-3 font-medium">Size</th><th className="px-4 py-3 font-medium">Entry</th><th className="px-4 py-3 font-medium">Mark</th><th className="px-4 py-3 font-medium">PnL</th><th className="px-4 py-3 font-medium">Margin</th><th className="px-4 py-3 font-medium">Liq. Price</th><th className="px-4 py-3 font-medium">Action</th>
                </tr></thead>
                <tbody>
                  {positions.map((p, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3"><div className="text-xs font-medium text-foreground">{p.pair}</div><div className="text-[10px] text-muted-foreground">{p.leverage}</div></td>
                      <td className={`px-4 py-3 text-xs font-medium ${p.side === "Long" ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{p.side}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{p.size}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{p.entry}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{p.mark}</td>
                      <td className="px-4 py-3"><div className={`text-xs font-medium ${p.pnl.startsWith("+") ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{p.pnl}</div><div className={`text-[10px] ${p.pnlPct.startsWith("+") ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{p.pnlPct}</div></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.margin}</td>
                      <td className="px-4 py-3 text-xs text-[#f6465d]">{p.liq}</td>
                      <td className="px-4 py-3"><div className="flex gap-1"><button className="rounded bg-secondary px-2 py-1 text-[10px] text-foreground hover:bg-secondary/80">TP/SL</button><button className="rounded bg-[#f6465d]/10 px-2 py-1 text-[10px] text-[#f6465d] hover:bg-[#f6465d]/20">Close</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PnL Analysis */}
          {activeTab === "PnL Analysis" && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Total PnL (7D)", value: "+$5,705.00", color: "text-[#0ecb81]" },
                  { label: "Total Trades", value: "68", color: "text-foreground" },
                  { label: "Win Rate", value: "66.2%", color: "text-primary" },
                  { label: "Total Volume", value: "$373,800", color: "text-foreground" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-4">
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className={`mt-1 text-lg font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              {/* Daily breakdown */}
              <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border px-4 py-3"><h3 className="text-sm font-semibold text-foreground">Daily PnL Breakdown</h3></div>
                <table className="w-full"><thead><tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">PnL</th><th className="px-4 py-3 font-medium">Trades</th><th className="px-4 py-3 font-medium">Win Rate</th><th className="px-4 py-3 font-medium">Volume</th>
                </tr></thead><tbody>
                  {pnlData.map((d, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 text-xs text-foreground">{d.date}</td>
                      <td className={`px-4 py-3 text-xs font-medium ${d.pnl.startsWith("+") ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{d.pnl}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{d.trades}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{d.winRate}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.volume}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
