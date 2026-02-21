"use client"

import Link from "next/link"
import { useLivePrices, formatPrice, type PriceData } from "@/hooks/use-live-prices"

const FALLBACK: { id: string; symbol: string; name: string; price: number; change24h: number; category: string }[] = [
  { id: "btc", symbol: "BTC", name: "Bitcoin", price: 97842.50, change24h: 2.34, category: "crypto" },
  { id: "eth", symbol: "ETH", name: "Ethereum", price: 3456.78, change24h: 1.82, category: "crypto" },
  { id: "sol", symbol: "SOL", name: "Solana", price: 189.45, change24h: -0.56, category: "crypto" },
  { id: "xrp", symbol: "XRP", name: "XRP", price: 2.87, change24h: 3.12, category: "crypto" },
  { id: "eur-usd", symbol: "EUR/USD", name: "EUR/USD", price: 1.0842, change24h: 0.12, category: "forex" },
  { id: "gbp-usd", symbol: "GBP/USD", name: "GBP/USD", price: 1.2634, change24h: -0.08, category: "forex" },
  { id: "xau-usd", symbol: "XAU/USD", name: "Gold", price: 2924.5, change24h: 0.45, category: "commodity" },
  { id: "wti", symbol: "WTI", name: "Crude Oil", price: 71.24, change24h: 1.12, category: "commodity" },
  { id: "aapl", symbol: "AAPL", name: "Apple", price: 232.4, change24h: 0.78, category: "stock" },
  { id: "nvda", symbol: "NVDA", name: "NVIDIA", price: 138.5, change24h: 1.67, category: "stock" },
  { id: "us500", symbol: "US500", name: "US 500", price: 5920, change24h: 0.34, category: "cfd" },
  { id: "us100", symbol: "US100", name: "US Tech 100", price: 21150, change24h: 0.52, category: "cfd" },
]

function getLabel(item: { symbol: string; category?: string }) {
  const cat = (item as any).category
  if (cat === "crypto") return `${item.symbol}/USDT`
  return item.symbol
}

function getTradeLink(item: { symbol: string; category?: string }) {
  const cat = (item as any).category
  if (cat === "crypto") return `/trade?pair=${item.symbol}USDT`
  return `/trade?pair=${encodeURIComponent(item.symbol)}`
}

export function MarketTicker() {
  const { crypto, forex, commodities, stocks, cfd } = useLivePrices(4000)

  // Mix all asset classes into the ticker
  const allAssets: typeof FALLBACK = []
  const cryptoItems = crypto.length > 0 ? crypto.slice(0, 6) : FALLBACK.filter(f => f.category === "crypto")
  const forexItems = forex.length > 0 ? forex.slice(0, 3) : FALLBACK.filter(f => f.category === "forex")
  const commodityItems = commodities.length > 0 ? commodities.slice(0, 2) : FALLBACK.filter(f => f.category === "commodity")
  const stockItems = stocks.length > 0 ? stocks.slice(0, 3) : FALLBACK.filter(f => f.category === "stock")
  const cfdItems = cfd.length > 0 ? cfd.slice(0, 2) : FALLBACK.filter(f => f.category === "cfd")

  allAssets.push(...cryptoItems, ...forexItems, ...commodityItems, ...stockItems, ...cfdItems)
  const items = [...allAssets, ...allAssets]

  return (
    <div className="overflow-hidden border-b border-border bg-background">
      <div
        className="flex items-center gap-0"
        style={{ width: "max-content", animation: "marquee 60s linear infinite" }}
      >
        {items.map((item, i) => (
          <Link
            key={`${item.id}-${i}`}
            href={getTradeLink(item)}
            className="flex shrink-0 items-center gap-2 px-4 py-2 text-xs transition-colors hover:bg-secondary/30"
          >
            <span className="font-medium text-foreground">{getLabel(item)}</span>
            <span className="font-mono text-foreground">${formatPrice(item.price)}</span>
            <span className={`font-mono ${item.change24h >= 0 ? "text-success" : "text-destructive"}`}>
              {item.change24h >= 0 ? "+" : ""}{item.change24h.toFixed(2)}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
