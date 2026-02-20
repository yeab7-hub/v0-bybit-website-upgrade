"use client"

import Link from "next/link"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"

export function MarketTicker() {
  const { crypto, isLoading } = useLivePrices(4000)
  const coins = crypto.slice(0, 12)

  if (isLoading || coins.length === 0) {
    return (
      <div className="overflow-hidden border-b border-border bg-background">
        <div className="flex items-center gap-6 px-4 py-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-2">
              <div className="h-3 w-14 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const items = [...coins, ...coins]

  return (
    <div className="overflow-hidden border-b border-border bg-background">
      <div
        className="flex items-center gap-0"
        style={{ width: "max-content", animation: "marquee 45s linear infinite" }}
      >
        {items.map((coin, i) => (
          <Link
            key={`${coin.id}-${i}`}
            href={`/trade?pair=${coin.symbol}USDT`}
            className="flex shrink-0 items-center gap-2 px-4 py-2 text-xs transition-colors hover:bg-secondary/30"
          >
            <span className="font-medium text-foreground">{coin.symbol}/USDT</span>
            <span className="font-mono text-foreground">${formatPrice(coin.price)}</span>
            <span className={`font-mono ${coin.change24h >= 0 ? "text-success" : "text-destructive"}`}>
              {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
