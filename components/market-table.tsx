"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, TrendingUp, TrendingDown } from "lucide-react"

interface CoinData {
  id: string
  name: string
  symbol: string
  price: string
  change24h: number
  volume: string
  marketCap: string
  sparkline: number[]
}

const coins: CoinData[] = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    price: "97,432.50",
    change24h: 2.34,
    volume: "42.3B",
    marketCap: "1.92T",
    sparkline: [30, 35, 28, 42, 38, 45, 50, 48, 55, 52, 58, 62],
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    price: "3,842.18",
    change24h: -1.12,
    volume: "18.7B",
    marketCap: "462B",
    sparkline: [45, 42, 38, 35, 40, 37, 33, 36, 34, 31, 35, 33],
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    price: "214.67",
    change24h: 5.43,
    volume: "8.4B",
    marketCap: "98.2B",
    sparkline: [20, 25, 30, 28, 35, 40, 38, 45, 50, 48, 55, 58],
  },
  {
    id: "xrp",
    name: "XRP",
    symbol: "XRP",
    price: "2.4831",
    change24h: 0.87,
    volume: "6.1B",
    marketCap: "142B",
    sparkline: [35, 38, 36, 40, 42, 39, 43, 41, 44, 42, 45, 43],
  },
  {
    id: "bnb",
    name: "BNB",
    symbol: "BNB",
    price: "712.30",
    change24h: -0.45,
    volume: "2.8B",
    marketCap: "103B",
    sparkline: [50, 48, 45, 47, 44, 46, 43, 45, 42, 44, 41, 43],
  },
  {
    id: "ada",
    name: "Cardano",
    symbol: "ADA",
    price: "1.0524",
    change24h: 3.21,
    volume: "1.9B",
    marketCap: "37.2B",
    sparkline: [15, 18, 22, 20, 25, 28, 26, 30, 33, 31, 35, 38],
  },
  {
    id: "avax",
    name: "Avalanche",
    symbol: "AVAX",
    price: "48.92",
    change24h: 1.56,
    volume: "1.2B",
    marketCap: "19.8B",
    sparkline: [25, 28, 26, 30, 32, 29, 33, 35, 32, 36, 34, 37],
  },
  {
    id: "doge",
    name: "Dogecoin",
    symbol: "DOGE",
    price: "0.3847",
    change24h: -2.18,
    volume: "3.4B",
    marketCap: "55.6B",
    sparkline: [45, 42, 40, 38, 35, 37, 33, 35, 31, 33, 29, 28],
  },
]

const tabs = ["Hot", "New Listings", "Top Gainers", "Top Volume"]

function MiniChart({ data, positive }: { data: number[]; positive: boolean }) {
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

export function MarketTable() {
  const [activeTab, setActiveTab] = useState("Hot")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Popular Cryptocurrencies
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and trade the top performing assets
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

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
              <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground lg:table-cell">
                Market Cap
              </th>
              <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">
                Last 7 Days
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                Trade
              </th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin, index) => (
              <tr
                key={coin.id}
                className="border-b border-border last:border-0 hover:bg-secondary/30"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleFavorite(coin.id)}>
                      <Star
                        className={`h-3.5 w-3.5 ${
                          favorites.has(coin.id)
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
                      {coin.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {coin.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {coin.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm text-foreground">
                  ${coin.price}
                </td>
                <td className="px-4 py-4 text-right">
                  <div
                    className={`inline-flex items-center gap-1 font-mono text-sm ${
                      coin.change24h >= 0
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {coin.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {coin.change24h >= 0 ? "+" : ""}
                    {coin.change24h.toFixed(2)}%
                  </div>
                </td>
                <td className="hidden px-4 py-4 text-right font-mono text-sm text-muted-foreground md:table-cell">
                  ${coin.volume}
                </td>
                <td className="hidden px-4 py-4 text-right font-mono text-sm text-muted-foreground lg:table-cell">
                  ${coin.marketCap}
                </td>
                <td className="hidden px-4 py-4 text-right md:table-cell">
                  <MiniChart
                    data={coin.sparkline}
                    positive={coin.change24h >= 0}
                  />
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href="/trade"
                    className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
                  >
                    Trade
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
