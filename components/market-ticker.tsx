"use client"

import Link from "next/link"
import { useLivePrices, formatPrice, type PriceData } from "@/hooks/use-live-prices"

const FALLBACK: { id: string; symbol: string; name: string; price: number; change24h: number; category: string }[] = []

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
  const { crypto, forex, commodities, stocks, cfd } = useLivePrices(15000)

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
