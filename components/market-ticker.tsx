"use client"

import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"

export function MarketTicker() {
  const { crypto, forex, commodities, stocks, isLoading } = useLivePrices(4000)

  // Combine all asset classes into one ticker
  const allAssets = [
    ...crypto.slice(0, 8),
    ...forex.slice(0, 3),
    ...commodities.slice(0, 2),
    ...stocks.slice(0, 3),
  ]

  if (isLoading || allAssets.length === 0) {
    return (
      <div className="overflow-hidden border-b border-border bg-card/50">
        <div className="flex items-center gap-8 px-4 py-2 lg:px-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-3">
              <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-12 animate-pulse rounded bg-secondary" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden border-b border-border bg-card/50">
      <div className="flex items-center gap-8 overflow-x-auto px-4 py-2 scrollbar-none lg:px-6">
        {allAssets.map((asset) => {
          const pairLabel =
            asset.category === "crypto"
              ? `${asset.symbol}/USDT`
              : asset.symbol
          return (
            <div
              key={asset.id}
              className="flex shrink-0 items-center gap-3"
            >
              <span className="text-xs font-medium text-foreground">
                {pairLabel}
              </span>
              <span className="font-mono text-xs text-foreground">
                {asset.category === "forex"
                  ? asset.price.toFixed(4)
                  : `$${formatPrice(asset.price)}`}
              </span>
              <span
                className={`font-mono text-xs ${
                  asset.change24h >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {asset.change24h >= 0 ? "+" : ""}
                {asset.change24h.toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
