"use client"

import { useState, useEffect } from "react"

interface OrderLevel {
  price: number
  amount: number
  total: number
}

function generateLevels(
  basePrice: number,
  count: number,
  side: "ask" | "bid"
): OrderLevel[] {
  const levels: OrderLevel[] = []
  let cumTotal = 0
  for (let i = 0; i < count; i++) {
    const offset = (i + 1) * (2 + Math.random() * 8)
    const price =
      side === "ask" ? basePrice + offset : basePrice - offset
    const amount = 0.001 + Math.random() * 2.5
    cumTotal += amount
    levels.push({
      price: Math.round(price * 100) / 100,
      amount: Math.round(amount * 10000) / 10000,
      total: Math.round(cumTotal * 10000) / 10000,
    })
  }
  return levels
}

type ViewMode = "both" | "bids" | "asks"

export function OrderBook() {
  const [viewMode, setViewMode] = useState<ViewMode>("both")
  const basePrice = 97432.5
  const [asks, setAsks] = useState(() => generateLevels(basePrice, 15, "ask"))
  const [bids, setBids] = useState(() => generateLevels(basePrice, 15, "bid"))

  useEffect(() => {
    const interval = setInterval(() => {
      setAsks((prev) =>
        prev.map((l) => ({
          ...l,
          amount: Math.max(0.001, l.amount + (Math.random() - 0.5) * 0.2),
        }))
      )
      setBids((prev) =>
        prev.map((l) => ({
          ...l,
          amount: Math.max(0.001, l.amount + (Math.random() - 0.5) * 0.2),
        }))
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const maxTotal = Math.max(
    ...asks.map((a) => a.total),
    ...bids.map((b) => b.total)
  )

  const displayAsks = viewMode === "bids" ? [] : asks.slice(0, viewMode === "both" ? 12 : 24)
  const displayBids = viewMode === "asks" ? [] : bids.slice(0, viewMode === "both" ? 12 : 24)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold text-foreground">
          Order Book
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode("both")}
            className={`rounded p-1 ${
              viewMode === "both" ? "bg-secondary" : ""
            }`}
            title="Both"
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <rect x="1" y="1" width="12" height="5" rx="1" fill="hsl(0, 72%, 51%)" opacity="0.6" />
              <rect x="1" y="8" width="12" height="5" rx="1" fill="hsl(142, 72%, 50%)" opacity="0.6" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("bids")}
            className={`rounded p-1 ${
              viewMode === "bids" ? "bg-secondary" : ""
            }`}
            title="Bids"
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <rect x="1" y="1" width="12" height="12" rx="1" fill="hsl(142, 72%, 50%)" opacity="0.6" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("asks")}
            className={`rounded p-1 ${
              viewMode === "asks" ? "bg-secondary" : ""
            }`}
            title="Asks"
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <rect x="1" y="1" width="12" height="12" rx="1" fill="hsl(0, 72%, 51%)" opacity="0.6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 border-b border-border px-3 py-1.5">
        <span className="text-[10px] text-muted-foreground">Price(USDT)</span>
        <span className="text-right text-[10px] text-muted-foreground">
          Amount(BTC)
        </span>
        <span className="text-right text-[10px] text-muted-foreground">
          Total
        </span>
      </div>

      {/* Asks (sell orders) */}
      <div className="flex-1 overflow-y-auto">
        {displayAsks.length > 0 && (
          <div className="flex flex-col-reverse">
            {displayAsks.map((level, i) => (
              <div
                key={`ask-${i}`}
                className="group relative grid cursor-pointer grid-cols-3 px-3 py-0.5 hover:bg-secondary/30"
              >
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 bg-destructive/8"
                  style={{
                    width: `${(level.total / maxTotal) * 100}%`,
                  }}
                />
                <span className="relative font-mono text-xs text-destructive">
                  {level.price.toFixed(2)}
                </span>
                <span className="relative text-right font-mono text-xs text-foreground">
                  {level.amount.toFixed(4)}
                </span>
                <span className="relative text-right font-mono text-xs text-muted-foreground">
                  {level.total.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Spread / Last price */}
        <div className="flex items-center justify-between border-y border-border bg-secondary/20 px-3 py-2">
          <span className="font-mono text-sm font-bold text-success">
            97,432.50
          </span>
          <span className="text-[10px] text-muted-foreground">
            Spread: 0.01%
          </span>
        </div>

        {/* Bids (buy orders) */}
        {displayBids.map((level, i) => (
          <div
            key={`bid-${i}`}
            className="group relative grid cursor-pointer grid-cols-3 px-3 py-0.5 hover:bg-secondary/30"
          >
            <div
              className="pointer-events-none absolute inset-y-0 right-0 bg-success/8"
              style={{
                width: `${(level.total / maxTotal) * 100}%`,
              }}
            />
            <span className="relative font-mono text-xs text-success">
              {level.price.toFixed(2)}
            </span>
            <span className="relative text-right font-mono text-xs text-foreground">
              {level.amount.toFixed(4)}
            </span>
            <span className="relative text-right font-mono text-xs text-muted-foreground">
              {level.total.toFixed(4)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
