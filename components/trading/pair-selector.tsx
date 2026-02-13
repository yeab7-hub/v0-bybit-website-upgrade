"use client"

import { useState } from "react"
import { Search, Star } from "lucide-react"
import { useLivePrices, formatPrice, formatVolume } from "@/hooks/use-live-prices"

const categories = ["Favorites", "Crypto", "Forex", "Stocks"]

export function PairSelector() {
  const { crypto, forex, stocks, isLoading } = useLivePrices(5000)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Crypto")
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["BTC", "ETH"]))

  const toggleFav = (symbol: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(symbol)) next.delete(symbol)
      else next.add(symbol)
      return next
    })
  }

  // Get current dataset
  let assets = activeCategory === "Forex" ? forex : activeCategory === "Stocks" ? stocks : crypto
  if (activeCategory === "Favorites") {
    assets = [...crypto, ...forex, ...stocks].filter((a) => favorites.has(a.symbol))
  }

  const filtered = assets.filter((a) =>
    a.symbol.toLowerCase().includes(search.toLowerCase()) ||
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col">
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
            {cat === "Favorites" ? <Star className="h-3 w-3" /> : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 px-2 py-1">
        <span className="text-[10px] text-muted-foreground">Pair</span>
        <span className="text-right text-[10px] text-muted-foreground">Price</span>
        <span className="text-right text-[10px] text-muted-foreground">{"24h %"}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="grid grid-cols-3 px-2 py-1.5">
              <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
              <div className="ml-auto h-3 w-16 animate-pulse rounded bg-secondary" />
              <div className="ml-auto h-3 w-10 animate-pulse rounded bg-secondary" />
            </div>
          ))
        ) : (
          filtered.map((asset) => (
            <div
              key={asset.id}
              className="group grid cursor-pointer grid-cols-3 items-center px-2 py-1.5 hover:bg-secondary/30"
            >
              <div className="flex items-center gap-1.5">
                <button onClick={() => toggleFav(asset.symbol)}>
                  <Star
                    className={`h-3 w-3 ${
                      favorites.has(asset.symbol)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-foreground">
                  {asset.category === "crypto" ? `${asset.symbol}/USDT` : asset.symbol}
                </span>
              </div>
              <span className="text-right font-mono text-xs text-foreground">
                {asset.category === "forex" ? asset.price.toFixed(4) : formatPrice(asset.price)}
              </span>
              <span
                className={`text-right font-mono text-xs ${
                  asset.change24h >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {asset.change24h >= 0 ? "+" : ""}
                {asset.change24h.toFixed(2)}%
              </span>
            </div>
          ))
        )}
      </div>

      {/* Volume footer */}
      {!isLoading && filtered.length > 0 && (
        <div className="border-t border-border px-2 py-1.5">
          <span className="text-[10px] text-muted-foreground">
            {filtered.length} pairs | Total Vol: $
            {formatVolume(filtered.reduce((s, a) => s + a.volume, 0))}
          </span>
        </div>
      )}
    </div>
  )
}
