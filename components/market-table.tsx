"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, TrendingUp, TrendingDown } from "lucide-react"
import { useLivePrices, formatPrice, formatVolume, formatMarketCap, type PriceData } from "@/hooks/use-live-prices"

function MiniChart({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return <div className="h-8 w-20" />
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 32
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "hsl(142, 72%, 50%)" : "hsl(0, 72%, 51%)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const categories = ["Crypto", "Forex", "Commodities", "Stocks"]
const cryptoTabs = ["Hot", "Top Gainers", "Top Volume"]

export function MarketTable() {
  const { crypto, forex, commodities, stocks, isLoading } = useLivePrices(5000)
  const [activeCategory, setActiveCategory] = useState("Crypto")
  const [activeCryptoTab, setActiveCryptoTab] = useState("Hot")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Get assets based on active category
  let assets: PriceData[] = []
  if (activeCategory === "Crypto") {
    assets = [...crypto]
    if (activeCryptoTab === "Top Gainers") {
      assets.sort((a, b) => b.change24h - a.change24h)
    } else if (activeCryptoTab === "Top Volume") {
      assets.sort((a, b) => b.volume - a.volume)
    }
  } else if (activeCategory === "Forex") {
    assets = forex
  } else if (activeCategory === "Commodities") {
    assets = commodities
  } else {
    assets = stocks
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Live Markets
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time prices across crypto, forex, commodities, and stocks
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                activeCategory === cat
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Crypto sub-tabs */}
      {activeCategory === "Crypto" && (
        <div className="mb-4 flex items-center gap-1">
          {cryptoTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCryptoTab(tab)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                activeCryptoTab === tab
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                24h Change
              </th>
              <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">
                24h Volume
              </th>
              {activeCategory === "Crypto" && (
                <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground lg:table-cell">
                  Market Cap
                </th>
              )}
              {activeCategory === "Crypto" && (
                <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">
                  Last 7 Days
                </th>
              )}
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                Trade
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-4">
                    <div className="h-4 w-6 animate-pulse rounded bg-secondary" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-secondary" />
                      <div>
                        <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
                        <div className="mt-1 h-3 w-10 animate-pulse rounded bg-secondary" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="ml-auto h-4 w-24 animate-pulse rounded bg-secondary" /></td>
                  <td className="px-4 py-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-secondary" /></td>
                  <td className="hidden px-4 py-4 md:table-cell"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-secondary" /></td>
                  <td className="px-4 py-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-secondary" /></td>
                </tr>
              ))
            ) : (
              assets.map((asset, index) => (
                <tr
                  key={asset.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleFavorite(asset.id)}>
                        <Star
                          className={`h-3.5 w-3.5 ${
                            favorites.has(asset.id)
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                        {asset.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {asset.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {asset.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm text-foreground">
                    {asset.category === "forex"
                      ? asset.price.toFixed(4)
                      : `$${formatPrice(asset.price)}`}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div
                      className={`inline-flex items-center gap-1 font-mono text-sm ${
                        asset.change24h >= 0
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {asset.change24h >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {asset.change24h >= 0 ? "+" : ""}
                      {asset.change24h.toFixed(2)}%
                    </div>
                  </td>
                  <td className="hidden px-4 py-4 text-right font-mono text-sm text-muted-foreground md:table-cell">
                    ${formatVolume(asset.volume)}
                  </td>
                  {activeCategory === "Crypto" && (
                    <td className="hidden px-4 py-4 text-right font-mono text-sm text-muted-foreground lg:table-cell">
                      {asset.marketCap ? formatMarketCap(asset.marketCap) : "-"}
                    </td>
                  )}
                  {activeCategory === "Crypto" && (
                    <td className="hidden px-4 py-4 text-right md:table-cell">
                      <MiniChart
                        data={asset.sparkline || []}
                        positive={asset.change24h >= 0}
                      />
                    </td>
                  )}
                  <td className="px-4 py-4 text-right">
                    <Link
                      href="/trade"
                      className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
                    >
                      Trade
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
