"use client"

import { useState, useEffect } from "react"
import { useLivePrices, findPrice } from "@/hooks/use-live-prices"

interface Trade {
  id: string
  price: number
  amount: number
  side: "buy" | "sell"
  time: string
}

type Tab = "trades" | "my-trades"

export function TradeHistory() {
  const [tab, setTab] = useState<Tab>("trades")
  const [trades, setTrades] = useState<Trade[]>([])
  const { crypto, forex, commodities, stocks, cfd } = useLivePrices(5000)
  const allAssets = [...crypto, ...forex, ...commodities, ...stocks, ...cfd]
  const btcPrice = findPrice(allAssets, "BTC")?.price ?? 97432.5

  // Generate initial trades on mount
  useEffect(() => {
    const initial: Trade[] = []
    for (let i = 0; i < 30; i++) {
      const side = Math.random() > 0.48 ? "buy" : ("sell" as const)
      const price = btcPrice + (Math.random() - 0.5) * 100
      const amount = 0.0001 + Math.random() * 1.5
      const h = Math.floor(Math.random() * 24)
      const m = Math.floor(Math.random() * 60)
      const s = Math.floor(Math.random() * 60)
      initial.push({
        id: `t-${i}`,
        price: Math.round(price * 100) / 100,
        amount: Math.round(amount * 10000) / 10000,
        side,
        time: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      })
    }
    setTrades(initial.sort((a, b) => (b.time > a.time ? 1 : -1)))
  }, [btcPrice])

  // Simulate live trade flow around real price
  useEffect(() => {
    if (btcPrice <= 0) return
    const interval = setInterval(() => {
      setTrades((prev) => {
        const side = Math.random() > 0.48 ? "buy" : ("sell" as const)
        const price = btcPrice + (Math.random() - 0.5) * 80
        const amount = 0.0001 + Math.random() * 1.5
        const now = new Date()
        const newTrade: Trade = {
          id: `t-${Date.now()}`,
          price: Math.round(price * 100) / 100,
          amount: Math.round(amount * 10000) / 10000,
          side,
          time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
        }
        return [newTrade, ...prev.slice(0, 29)]
      })
    }, 1200)
    return () => clearInterval(interval)
  }, [btcPrice])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-border">
        <button
          onClick={() => setTab("trades")}
          className={`px-4 py-2 text-xs font-medium ${
            tab === "trades" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Recent Trades
        </button>
        <button
          onClick={() => setTab("my-trades")}
          className={`px-4 py-2 text-xs font-medium ${
            tab === "my-trades" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My Trades
        </button>
      </div>

      <div className="grid grid-cols-3 px-3 py-1.5">
        <span className="text-[10px] text-muted-foreground">{"Price(USDT)"}</span>
        <span className="text-right text-[10px] text-muted-foreground">{"Amount(BTC)"}</span>
        <span className="text-right text-[10px] text-muted-foreground">Time</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "trades" ? (
          trades.map((trade) => (
            <div key={trade.id} className="grid grid-cols-3 px-3 py-0.5 hover:bg-secondary/20">
              <span className={`font-mono text-xs ${trade.side === "buy" ? "text-success" : "text-destructive"}`}>
                {trade.price.toFixed(2)}
              </span>
              <span className="text-right font-mono text-xs text-foreground">{trade.amount.toFixed(4)}</span>
              <span className="text-right font-mono text-xs text-muted-foreground">{trade.time}</span>
            </div>
          ))
        ) : (
          <div className="flex h-32 flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground">Log in to view your trades</p>
          </div>
        )}
      </div>
    </div>
  )
}
