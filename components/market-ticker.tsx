"use client"

import { useEffect, useState } from "react"

interface TickerItem {
  symbol: string
  price: string
  change: number
}

const initialTickers: TickerItem[] = [
  { symbol: "BTC/USDT", price: "97,432.50", change: 2.34 },
  { symbol: "ETH/USDT", price: "3,842.18", change: -1.12 },
  { symbol: "SOL/USDT", price: "214.67", change: 5.43 },
  { symbol: "XRP/USDT", price: "2.4831", change: 0.87 },
  { symbol: "BNB/USDT", price: "712.30", change: -0.45 },
  { symbol: "ADA/USDT", price: "1.0524", change: 3.21 },
  { symbol: "DOGE/USDT", price: "0.3847", change: -2.18 },
  { symbol: "AVAX/USDT", price: "48.92", change: 1.56 },
]

export function MarketTicker() {
  const [tickers, setTickers] = useState(initialTickers)

  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((t) => ({
          ...t,
          change: t.change + (Math.random() - 0.5) * 0.1,
        }))
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="overflow-hidden border-b border-border bg-card/50">
      <div className="flex items-center gap-8 overflow-x-auto px-4 py-2 scrollbar-none lg:px-6">
        {tickers.map((ticker) => (
          <div
            key={ticker.symbol}
            className="flex shrink-0 items-center gap-3"
          >
            <span className="text-xs font-medium text-foreground">
              {ticker.symbol}
            </span>
            <span className="font-mono text-xs text-foreground">
              {ticker.price}
            </span>
            <span
              className={`font-mono text-xs ${
                ticker.change >= 0
                  ? "text-success"
                  : "text-destructive"
              }`}
            >
              {ticker.change >= 0 ? "+" : ""}
              {ticker.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
