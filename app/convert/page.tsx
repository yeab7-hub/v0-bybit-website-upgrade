"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowDownUp, ChevronDown, Info, History, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const coins = [
  { symbol: "BTC", name: "Bitcoin", balance: "0.00000000", icon: "https://cdn.jsdelivr.net/gh/nicehash/cryptocurrency-icons/SVG/btc.svg" },
  { symbol: "ETH", name: "Ethereum", balance: "0.00000000", icon: "https://cdn.jsdelivr.net/gh/nicehash/cryptocurrency-icons/SVG/eth.svg" },
  { symbol: "USDT", name: "Tether", balance: "0.00000000", icon: "https://cdn.jsdelivr.net/gh/nicehash/cryptocurrency-icons/SVG/usdt.svg" },
  { symbol: "USDC", name: "USD Coin", balance: "0.00000000", icon: "https://cdn.jsdelivr.net/gh/nicehash/cryptocurrency-icons/SVG/usdc.svg" },
  { symbol: "SOL", name: "Solana", balance: "0.00000000", icon: "https://cdn.jsdelivr.net/gh/nicehash/cryptocurrency-icons/SVG/sol.svg" },
  { symbol: "XRP", name: "Ripple", balance: "0.00000000", icon: "https://cdn.jsdelivr.net/gh/nicehash/cryptocurrency-icons/SVG/xrp.svg" },
]

const recentConversions = [
  { from: "BTC", to: "USDT", amount: "0.05", received: "3,245.50", time: "2 hours ago" },
  { from: "ETH", to: "USDT", amount: "1.2", received: "2,880.00", time: "5 hours ago" },
  { from: "SOL", to: "USDT", amount: "15", received: "2,025.00", time: "1 day ago" },
]

export default function ConvertPage() {
  const [fromCoin, setFromCoin] = useState(coins[0])
  const [toCoin, setToCoin] = useState(coins[2])
  const [amount, setAmount] = useState("")
  const [showFromList, setShowFromList] = useState(false)
  const [showToList, setShowToList] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const swap = () => {
    const temp = fromCoin
    setFromCoin(toCoin)
    setToCoin(temp)
  }

  const rate = fromCoin.symbol === "BTC" && toCoin.symbol === "USDT" ? 64900 :
    fromCoin.symbol === "ETH" && toCoin.symbol === "USDT" ? 2400 :
    fromCoin.symbol === "USDT" && toCoin.symbol === "BTC" ? 1 / 64900 : 1
  const estimated = amount ? (parseFloat(amount) * rate).toFixed(toCoin.symbol === "BTC" ? 8 : 2) : "0.00"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[480px] px-4 py-8 lg:py-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Convert</h1>
              <p className="text-xs text-muted-foreground">Zero fees. Instant conversion.</p>
            </div>
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">
              <History className="h-3.5 w-3.5" /> History
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            {/* From */}
            <div className="rounded-lg bg-secondary p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">From</span>
                <span className="text-xs text-muted-foreground">Available: {fromCoin.balance} {fromCoin.symbol}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button onClick={() => { setShowFromList(!showFromList); setShowToList(false) }} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-background/50">
                    <img src={fromCoin.icon} alt={fromCoin.symbol} className="h-6 w-6" crossOrigin="anonymous" />
                    <span className="text-sm font-semibold text-foreground">{fromCoin.symbol}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {showFromList && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-xl">
                      {coins.filter(c => c.symbol !== toCoin.symbol).map(c => (
                        <button key={c.symbol} onClick={() => { setFromCoin(c); setShowFromList(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary">
                          <img src={c.icon} alt={c.symbol} className="h-5 w-5" crossOrigin="anonymous" />
                          <span className="font-medium text-foreground">{c.symbol}</span>
                          <span className="text-xs text-muted-foreground">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-right text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="mt-1 flex justify-end gap-2">
                {["25%", "50%", "75%", "Max"].map(pct => (
                  <button key={pct} className="rounded px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10">{pct}</button>
                ))}
              </div>
            </div>

            {/* Swap */}
            <div className="flex justify-center -my-2 relative z-10">
              <button onClick={swap} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground hover:text-primary transition-colors">
                <ArrowDownUp className="h-4 w-4" />
              </button>
            </div>

            {/* To */}
            <div className="rounded-lg bg-secondary p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">To</span>
                <span className="text-xs text-muted-foreground">Balance: {toCoin.balance} {toCoin.symbol}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button onClick={() => { setShowToList(!showToList); setShowFromList(false) }} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-background/50">
                    <img src={toCoin.icon} alt={toCoin.symbol} className="h-6 w-6" crossOrigin="anonymous" />
                    <span className="text-sm font-semibold text-foreground">{toCoin.symbol}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {showToList && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-xl">
                      {coins.filter(c => c.symbol !== fromCoin.symbol).map(c => (
                        <button key={c.symbol} onClick={() => { setToCoin(c); setShowToList(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary">
                          <img src={c.icon} alt={c.symbol} className="h-5 w-5" crossOrigin="anonymous" />
                          <span className="font-medium text-foreground">{c.symbol}</span>
                          <span className="text-xs text-muted-foreground">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="w-full text-right text-lg font-semibold text-foreground">{estimated}</div>
              </div>
            </div>

            {/* Rate */}
            <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3" /> Rate
              </div>
              <span className="text-xs text-foreground">1 {fromCoin.symbol} = {rate >= 1 ? rate.toLocaleString() : rate.toFixed(8)} {toCoin.symbol}</span>
            </div>

            <Button className="mt-4 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90" size="lg">
              Convert
            </Button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">No trading fees. Price refreshes every 15s.</p>
          </div>

          {/* History */}
          {showHistory && (
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Recent Conversions</h3>
              {recentConversions.map((c, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-foreground">{c.amount} {c.from}</span>
                    <span className="mx-2 text-muted-foreground">{"-->"}</span>
                    <span className="text-sm font-medium text-[#0ecb81]">{c.received} {c.to}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {c.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
