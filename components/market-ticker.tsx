"use client"

import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"

export function MarketTicker() {
  const { crypto, isLoading } = useLivePrices(4000)

  const topAssets = crypto.slice(0, 10)

  if (isLoading || topAssets.length === 0) {
    return (
      <div className="overflow-hidden border-b border-border bg-card/30">
        <div className="flex items-center gap-8 px-4 py-1.5 lg:px-6">
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

  return (
    <div className="overflow-hidden border-b border-border bg-card/30">
      <div className="flex items-center gap-6 overflow-x-auto px-4 py-1.5 scrollbar-none lg:gap-8 lg:px-6">
        {topAssets.map((asset) => (
          <div
            key={asset.id}
            className="flex shrink-0 items-center gap-2"
          >
            <span className="text-xs font-medium text-foreground">
              {asset.symbol}/USDT
            </span>
            <span className="font-mono text-xs text-foreground">
              ${formatPrice(asset.price)}
            </span>
            <span
              className={`font-mono text-xs ${
                asset.change24h >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {asset.change24h >= 0 ? "+" : ""}
              {asset.change24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
