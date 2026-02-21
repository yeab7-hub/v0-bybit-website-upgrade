"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, TrendingUp, TrendingDown } from "lucide-react"
import { useLivePrices, formatPrice, formatVolume, formatMarketCap, type PriceData } from "@/hooks/use-live-prices"
import { MarketAsset, formatAssetPrice } from "@/components/market-asset"

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

const CRYPTO_FALLBACK: PriceData[] = [
  { id: "btc", symbol: "BTC", name: "Bitcoin", price: 97842.50, change24h: 2.34, volume: 28.5e9, marketCap: 1.92e12, category: "crypto", sparkline: [96800, 97100, 96500, 97200, 97500, 97000, 97800, 97400, 97600, 97900] },
  { id: "eth", symbol: "ETH", name: "Ethereum", price: 3456.78, change24h: 1.82, volume: 14.2e9, marketCap: 415e9, category: "crypto", sparkline: [3400, 3420, 3380, 3450, 3440, 3460, 3430, 3470, 3450, 3460] },
  { id: "sol", symbol: "SOL", name: "Solana", price: 189.45, change24h: -0.56, volume: 3.8e9, marketCap: 82e9, category: "crypto", sparkline: [192, 191, 190, 189, 190, 188, 189, 190, 189, 189] },
  { id: "xrp", symbol: "XRP", name: "XRP", price: 2.87, change24h: 3.12, volume: 5.1e9, marketCap: 148e9, category: "crypto", sparkline: [2.78, 2.80, 2.82, 2.84, 2.83, 2.85, 2.86, 2.84, 2.87, 2.87] },
  { id: "bnb", symbol: "BNB", name: "BNB", price: 654.32, change24h: 0.94, volume: 1.9e9, marketCap: 97e9, category: "crypto", sparkline: [649, 651, 650, 653, 652, 654, 653, 655, 654, 654] },
  { id: "ada", symbol: "ADA", name: "Cardano", price: 0.9876, change24h: -1.23, volume: 1.2e9, marketCap: 34e9, category: "crypto", sparkline: [1.00, 0.99, 0.995, 0.99, 0.985, 0.99, 0.988, 0.987, 0.988, 0.987] },
  { id: "doge", symbol: "DOGE", name: "Dogecoin", price: 0.3245, change24h: 5.67, volume: 2.3e9, marketCap: 47e9, category: "crypto", sparkline: [0.307, 0.310, 0.312, 0.315, 0.318, 0.320, 0.322, 0.324, 0.323, 0.325] },
  { id: "avax", symbol: "AVAX", name: "Avalanche", price: 35.67, change24h: -2.15, volume: 890e6, marketCap: 14e9, category: "crypto", sparkline: [36.5, 36.2, 36.0, 35.8, 35.9, 35.7, 35.8, 35.6, 35.7, 35.7] },
]

const FOREX_FALLBACK: PriceData[] = [
  { id: "eur-usd", symbol: "EUR/USD", name: "EUR/USD", price: 1.0842, change24h: 0.12, volume: 5e9, marketCap: 0, category: "forex" },
  { id: "gbp-usd", symbol: "GBP/USD", name: "GBP/USD", price: 1.2634, change24h: -0.08, volume: 3.2e9, marketCap: 0, category: "forex" },
  { id: "usd-jpy", symbol: "USD/JPY", name: "USD/JPY", price: 149.85, change24h: 0.34, volume: 4.1e9, marketCap: 0, category: "forex" },
  { id: "aud-usd", symbol: "AUD/USD", name: "AUD/USD", price: 0.6543, change24h: -0.21, volume: 2.1e9, marketCap: 0, category: "forex" },
  { id: "usd-chf", symbol: "USD/CHF", name: "USD/CHF", price: 0.8821, change24h: 0.05, volume: 1.8e9, marketCap: 0, category: "forex" },
]

const COMMODITIES_FALLBACK: PriceData[] = [
  { id: "xau-usd", symbol: "XAU/USD", name: "Gold", price: 2924.5, change24h: 0.45, volume: 2e9, marketCap: 0, category: "commodity" },
  { id: "xag-usd", symbol: "XAG/USD", name: "Silver", price: 32.78, change24h: -0.32, volume: 800e6, marketCap: 0, category: "commodity" },
  { id: "wti", symbol: "WTI", name: "Crude Oil WTI", price: 71.24, change24h: 1.12, volume: 1.5e9, marketCap: 0, category: "commodity" },
  { id: "brent", symbol: "BRENT", name: "Brent Crude", price: 74.89, change24h: 0.89, volume: 1.2e9, marketCap: 0, category: "commodity" },
  { id: "ng", symbol: "NG", name: "Natural Gas", price: 3.42, change24h: -1.45, volume: 600e6, marketCap: 0, category: "commodity" },
]

const STOCKS_FALLBACK: PriceData[] = [
  { id: "aapl", symbol: "AAPL", name: "Apple Inc.", price: 232.4, change24h: 0.78, volume: 500e6, marketCap: 3.5e12, category: "stock" },
  { id: "msft", symbol: "MSFT", name: "Microsoft", price: 412.65, change24h: 1.23, volume: 350e6, marketCap: 3.1e12, category: "stock" },
  { id: "googl", symbol: "GOOGL", name: "Alphabet", price: 178.2, change24h: -0.45, volume: 280e6, marketCap: 2.2e12, category: "stock" },
  { id: "amzn", symbol: "AMZN", name: "Amazon", price: 215.8, change24h: 0.56, volume: 310e6, marketCap: 2.24e12, category: "stock" },
  { id: "tsla", symbol: "TSLA", name: "Tesla", price: 348.9, change24h: 2.89, volume: 450e6, marketCap: 1.1e12, category: "stock" },
  { id: "nvda", symbol: "NVDA", name: "NVIDIA", price: 138.5, change24h: 1.67, volume: 520e6, marketCap: 3.4e12, category: "stock" },
]

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

  // Get assets based on active category, always with fallbacks
  const liveCrypto = crypto.length > 0 ? crypto : CRYPTO_FALLBACK
  const liveForex = forex.length > 0 ? forex : FOREX_FALLBACK
  const liveCommodities = commodities.length > 0 ? commodities : COMMODITIES_FALLBACK
  const liveStocks = stocks.length > 0 ? stocks : STOCKS_FALLBACK

  let assets: PriceData[] = []
  if (activeCategory === "Crypto") {
    assets = [...liveCrypto]
    if (activeCryptoTab === "Top Gainers") {
      assets.sort((a, b) => b.change24h - a.change24h)
    } else if (activeCryptoTab === "Top Volume") {
      assets.sort((a, b) => b.volume - a.volume)
    }
  } else if (activeCategory === "Forex") {
    assets = liveForex
  } else if (activeCategory === "Commodities") {
    assets = liveCommodities
  } else {
    assets = liveStocks
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
            {isLoading && assets.length === 0 ? (
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
                      <MarketAsset symbol={asset.symbol} size={32} />
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
                    {formatAssetPrice(asset.price, asset.symbol)}
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
                      href={`/trade?pair=${encodeURIComponent(
                        asset.category === "crypto" ? `${asset.symbol}USDT` : asset.symbol
                      )}`}
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
