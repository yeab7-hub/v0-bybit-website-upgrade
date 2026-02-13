"use client"

import { useState } from "react"
import { Search, Star } from "lucide-react"

interface TradingPair {
  symbol: string
  lastPrice: string
  change: number
  volume: string
}

const pairs: TradingPair[] = [
  { symbol: "BTC/USDT", lastPrice: "97,432.50", change: 2.34, volume: "1.21B" },
  { symbol: "ETH/USDT", lastPrice: "3,842.18", change: -1.12, volume: "682M" },
  { symbol: "SOL/USDT", lastPrice: "214.67", change: 5.43, volume: "412M" },
  { symbol: "XRP/USDT", lastPrice: "2.4831", change: 0.87, volume: "389M" },
  { symbol: "BNB/USDT", lastPrice: "712.30", change: -0.45, volume: "198M" },
  { symbol: "DOGE/USDT", lastPrice: "0.3847", change: -2.18, volume: "287M" },
  { symbol: "ADA/USDT", lastPrice: "1.0524", change: 3.21, volume: "156M" },
  { symbol: "AVAX/USDT", lastPrice: "48.92", change: 1.56, volume: "98M" },
  { symbol: "DOT/USDT", lastPrice: "9.87", change: 0.34, volume: "76M" },
  { symbol: "MATIC/USDT", lastPrice: "1.23", change: -0.89, volume: "65M" },
  { symbol: "LINK/USDT", lastPrice: "22.45", change: 1.78, volume: "112M" },
  { symbol: "UNI/USDT", lastPrice: "14.32", change: -1.56, volume: "54M" },
]

const categories = ["Favorites", "USDT", "USDC", "BTC", "ETH"]

export function PairSelector() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("USDT")
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["BTC/USDT", "ETH/USDT"]))

  const filtered = pairs.filter((p) =>
    p.symbol.toLowerCase().includes(search.toLowerCase())
  )

  const displayPairs =
    activeCategory === "Favorites"
      ? filtered.filter((p) => favorites.has(p.symbol))
      : filtered

  const toggleFav = (symbol: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(symbol)) next.delete(symbol)
      else next.add(symbol)
      return next
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b border-border p-2">
        <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-2 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pair"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium ${
              activeCategory === cat
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat === "Favorites" ? (
              <Star className="h-3 w-3" />
            ) : (
              cat
            )}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-2 py-1">
        <span className="text-[10px] text-muted-foreground">Pair</span>
        <span className="text-right text-[10px] text-muted-foreground">
          Last Price
        </span>
        <span className="text-right text-[10px] text-muted-foreground">
          24h Chg%
        </span>
      </div>

      {/* Pair list */}
      <div className="flex-1 overflow-y-auto">
        {displayPairs.map((pair) => (
          <div
            key={pair.symbol}
            className="group grid cursor-pointer grid-cols-3 items-center px-2 py-1.5 hover:bg-secondary/30"
          >
            <div className="flex items-center gap-1.5">
              <button onClick={() => toggleFav(pair.symbol)}>
                <Star
                  className={`h-3 w-3 ${
                    favorites.has(pair.symbol)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
              <span className="text-xs font-medium text-foreground">
                {pair.symbol}
              </span>
            </div>
            <span className="text-right font-mono text-xs text-foreground">
              {pair.lastPrice}
            </span>
            <span
              className={`text-right font-mono text-xs ${
                pair.change >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {pair.change >= 0 ? "+" : ""}
              {pair.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
