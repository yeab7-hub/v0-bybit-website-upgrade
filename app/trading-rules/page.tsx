"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { Search, AlertTriangle } from "lucide-react"

const sections = ["Spot", "USDT Perpetual", "Inverse Perpetual", "Options"]

const spotRules = [
  { pair: "BTC/USDT", minOrder: "0.00001 BTC", maxOrder: "500 BTC", tickSize: "0.01", minNotional: "$1" },
  { pair: "ETH/USDT", minOrder: "0.0001 ETH", maxOrder: "10,000 ETH", tickSize: "0.01", minNotional: "$1" },
  { pair: "SOL/USDT", minOrder: "0.01 SOL", maxOrder: "200,000 SOL", tickSize: "0.001", minNotional: "$1" },
  { pair: "XRP/USDT", minOrder: "1 XRP", maxOrder: "5,000,000 XRP", tickSize: "0.0001", minNotional: "$1" },
  { pair: "DOGE/USDT", minOrder: "1 DOGE", maxOrder: "10,000,000 DOGE", tickSize: "0.00001", minNotional: "$1" },
  { pair: "ADA/USDT", minOrder: "1 ADA", maxOrder: "5,000,000 ADA", tickSize: "0.0001", minNotional: "$1" },
  { pair: "AVAX/USDT", minOrder: "0.01 AVAX", maxOrder: "200,000 AVAX", tickSize: "0.001", minNotional: "$1" },
  { pair: "LINK/USDT", minOrder: "0.01 LINK", maxOrder: "500,000 LINK", tickSize: "0.001", minNotional: "$1" },
]

const perpRules = [
  { symbol: "BTCUSDT", maxLeverage: "100x", imr: "1%", mmr: "0.5%", maxPosition: "1,000 BTC", tickSize: "0.1" },
  { symbol: "ETHUSDT", maxLeverage: "100x", imr: "1%", mmr: "0.5%", maxPosition: "20,000 ETH", tickSize: "0.01" },
  { symbol: "SOLUSDT", maxLeverage: "50x", imr: "2%", mmr: "1%", maxPosition: "500,000 SOL", tickSize: "0.001" },
  { symbol: "XRPUSDT", maxLeverage: "50x", imr: "2%", mmr: "1%", maxPosition: "10,000,000 XRP", tickSize: "0.0001" },
  { symbol: "DOGEUSDT", maxLeverage: "50x", imr: "2%", mmr: "1%", maxPosition: "50,000,000 DOGE", tickSize: "0.00001" },
  { symbol: "AVAXUSDT", maxLeverage: "50x", imr: "2%", mmr: "1%", maxPosition: "500,000 AVAX", tickSize: "0.001" },
]

export default function TradingRulesPage() {
  const [section, setSection] = useState("Spot")
  const [search, setSearch] = useState("")

  const filteredSpot = spotRules.filter(r => search === "" || r.pair.toLowerCase().includes(search.toLowerCase()))
  const filteredPerp = perpRules.filter(r => search === "" || r.symbol.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-14">
            <h1 className="text-2xl font-bold lg:text-3xl">Trading Rules</h1>
            <p className="mt-2 text-xs text-muted-foreground">Order size limits, leverage tiers, tick sizes, and margin requirements for all markets.</p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-8 lg:py-12">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
              {sections.map((s) => (
                <button key={s} onClick={() => setSection(s)} className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${section === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{s}</button>
              ))}
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search pair..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            {section === "Spot" ? (
              <table className="w-full text-left text-xs">
                <thead><tr className="border-b border-border text-muted-foreground">
                  <th className="p-4 font-medium">Pair</th>
                  <th className="p-4 font-medium">Min Order</th>
                  <th className="p-4 font-medium">Max Order</th>
                  <th className="p-4 font-medium">Tick Size</th>
                  <th className="p-4 font-medium">Min Notional</th>
                </tr></thead>
                <tbody>{filteredSpot.map((r) => (
                  <tr key={r.pair} className="border-b border-border/50">
                    <td className="p-4 font-semibold text-foreground">{r.pair}</td>
                    <td className="p-4 text-secondary-foreground">{r.minOrder}</td>
                    <td className="p-4 text-secondary-foreground">{r.maxOrder}</td>
                    <td className="p-4 text-secondary-foreground">{r.tickSize}</td>
                    <td className="p-4 text-secondary-foreground">{r.minNotional}</td>
                  </tr>
                ))}</tbody>
              </table>
            ) : (section === "USDT Perpetual" || section === "Inverse Perpetual") ? (
              <table className="w-full text-left text-xs">
                <thead><tr className="border-b border-border text-muted-foreground">
                  <th className="p-4 font-medium">Symbol</th>
                  <th className="p-4 font-medium">Max Leverage</th>
                  <th className="p-4 font-medium">IMR</th>
                  <th className="p-4 font-medium">MMR</th>
                  <th className="p-4 font-medium">Max Position</th>
                  <th className="p-4 font-medium">Tick Size</th>
                </tr></thead>
                <tbody>{filteredPerp.map((r) => (
                  <tr key={r.symbol} className="border-b border-border/50">
                    <td className="p-4 font-semibold text-foreground">{r.symbol}</td>
                    <td className="p-4 text-primary">{r.maxLeverage}</td>
                    <td className="p-4 text-secondary-foreground">{r.imr}</td>
                    <td className="p-4 text-secondary-foreground">{r.mmr}</td>
                    <td className="p-4 text-secondary-foreground">{r.maxPosition}</td>
                    <td className="p-4 text-secondary-foreground">{r.tickSize}</td>
                  </tr>
                ))}</tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">Options trading rules coming soon.</div>
            )}
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground">Risk Warning:</strong> Trading rules are subject to change based on market conditions. Leverage amplifies both gains and losses. Please ensure you understand the risks before trading with leverage.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
