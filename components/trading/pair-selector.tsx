"use client"

import { useState } from "react"
import { Search, Star } from "lucide-react"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"

const categories = ["Favorites", "Crypto", "Forex", "Stocks"]

interface PairSelectorProps {
  onSelectPair?: (pair: string) => void
  activePair?: string
}

export function PairSelector({ onSelectPair, activePair = "BTCUSDT" }: PairSelectorProps) {
  const { crypto, forex, stocks, isLoading } = useLivePrices(5000)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Crypto")
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["BTC", "ETH", "SOL"]))

  const toggleFav = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(symbol)) next.delete(symbol)
      else next.add(symbol)
      return next
    })
  }

  const handleSelect = (symbol: string, category: string) => {
    if (category === "crypto") {
      onSelectPair?.(`${symbol}USDT`)
    }
  }

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
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
              activeCategory === cat
                ? "bg-[#f7a600]/10 text-[#f7a600]"
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
          filtered.map((asset) => {
            const pairId = asset.category === "crypto" ? `${asset.symbol}USDT` : asset.symbol
            const isActive = pairId === activePair
            return (
              <div
                key={asset.id}
                onClick={() => handleSelect(asset.symbol, asset.category)}
                className={`group grid cursor-pointer grid-cols-3 items-center px-2 py-1.5 transition-colors hover:bg-secondary/30 ${
                  isActive ? "bg-[#f7a600]/5" : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <button onClick={(e) => toggleFav(e, asset.symbol)}>
                    <Star
                      className={`h-3 w-3 ${
                        favorites.has(asset.symbol)
                          ? "fill-[#f7a600] text-[#f7a600]"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                  <div className="flex flex-col">
                    <span className={`text-xs font-medium ${isActive ? "text-[#f7a600]" : "text-foreground"}`}>
                      {asset.category === "crypto" ? `${asset.symbol}/USDT` : asset.symbol}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{asset.name}</span>
                  </div>
                </div>
                <span className="text-right font-mono text-xs text-foreground">
                  {asset.category === "forex" ? asset.price.toFixed(4) : formatPrice(asset.price)}
                </span>
                <span
                  className={`text-right font-mono text-xs ${
                    asset.change24h >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"
                  }`}
                >
                  {asset.change24h >= 0 ? "+" : ""}
                  {asset.change24h.toFixed(2)}%
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
