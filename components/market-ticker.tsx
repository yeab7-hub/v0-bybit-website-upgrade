"use client"

import Link from "next/link"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"

const FALLBACK_DATA = [
  { id: "btc", symbol: "BTC", price: 97842.50, change24h: 2.34 },
  { id: "eth", symbol: "ETH", price: 3456.78, change24h: 1.82 },
  { id: "sol", symbol: "SOL", price: 189.45, change24h: -0.56 },
  { id: "xrp", symbol: "XRP", price: 2.87, change24h: 3.12 },
  { id: "bnb", symbol: "BNB", price: 654.32, change24h: 0.94 },
  { id: "ada", symbol: "ADA", price: 0.9876, change24h: -1.23 },
  { id: "doge", symbol: "DOGE", price: 0.3245, change24h: 5.67 },
  { id: "avax", symbol: "AVAX", price: 35.67, change24h: -2.15 },
  { id: "dot", symbol: "DOT", price: 7.89, change24h: 1.45 },
  { id: "link", symbol: "LINK", price: 19.54, change24h: 0.78 },
  { id: "trx", symbol: "TRX", price: 0.2456, change24h: -0.34 },
  { id: "ton", symbol: "TON", price: 5.67, change24h: 4.21 },
]

export function MarketTicker() {
  const { crypto, isLoading } = useLivePrices(4000)

  // Use live data if available, otherwise fallback
  const coins = crypto.length > 0 ? crypto.slice(0, 12) : (isLoading ? FALLBACK_DATA : FALLBACK_DATA)
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
