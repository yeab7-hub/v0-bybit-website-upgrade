"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Star } from "lucide-react"
import { formatPrice } from "@/hooks/use-live-prices"

interface TickerData {
  symbol: string
  base: string
  name: string
  price: number
  change24h: number
  volume: number
}

const PAIRS: { symbol: string; base: string; name: string }[] = [
  { symbol: "BTCUSDT", base: "BTC", name: "Bitcoin" },
  { symbol: "ETHUSDT", base: "ETH", name: "Ethereum" },
  { symbol: "SOLUSDT", base: "SOL", name: "Solana" },
  { symbol: "XRPUSDT", base: "XRP", name: "XRP" },
  { symbol: "BNBUSDT", base: "BNB", name: "BNB" },
  { symbol: "ADAUSDT", base: "ADA", name: "Cardano" },
  { symbol: "DOGEUSDT", base: "DOGE", name: "Dogecoin" },
  { symbol: "AVAXUSDT", base: "AVAX", name: "Avalanche" },
  { symbol: "DOTUSDT", base: "DOT", name: "Polkadot" },
  { symbol: "LINKUSDT", base: "LINK", name: "Chainlink" },
  { symbol: "UNIUSDT", base: "UNI", name: "Uniswap" },
  { symbol: "MATICUSDT", base: "MATIC", name: "Polygon" },
  { symbol: "TRXUSDT", base: "TRX", name: "TRON" },
  { symbol: "TONUSDT", base: "TON", name: "Toncoin" },
  { symbol: "SHIBUSDT", base: "SHIB", name: "Shiba Inu" },
  { symbol: "LTCUSDT", base: "LTC", name: "Litecoin" },
  { symbol: "NEARUSDT", base: "NEAR", name: "NEAR Protocol" },
  { symbol: "APTUSDT", base: "APT", name: "Aptos" },
  { symbol: "SUIUSDT", base: "SUI", name: "Sui" },
  { symbol: "ARBUSDT", base: "ARB", name: "Arbitrum" },
  { symbol: "OPUSDT", base: "OP", name: "Optimism" },
  { symbol: "FILUSDT", base: "FIL", name: "Filecoin" },
  { symbol: "ATOMUSDT", base: "ATOM", name: "Cosmos" },
  { symbol: "AAVEUSDT", base: "AAVE", name: "Aave" },
  { symbol: "PEPEUSDT", base: "PEPE", name: "Pepe" },
]

interface PairSelectorProps {
  onSelectPair?: (pair: string) => void
  activePair?: string
}

export function PairSelector({ onSelectPair, activePair = "BTCUSDT" }: PairSelectorProps) {
  const [tickers, setTickers] = useState<Map<string, TickerData>>(new Map())
  const [search, setSearch] = useState("")
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["BTC", "ETH", "SOL"]))
  const [showFavorites, setShowFavorites] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)

  // Fetch initial data from Binance REST API
  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const symbols = PAIRS.map((p) => `"${p.symbol}"`).join(",")
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols}]`
        )
        if (!res.ok) throw new Error("Binance API failed")
        const data: Record<string, string>[] = await res.json()
        const map = new Map<string, TickerData>()
        for (const t of data) {
          const pair = PAIRS.find((p) => p.symbol === t.symbol)
          if (!pair) continue
          const price = parseFloat(t.lastPrice)
          const open = parseFloat(t.openPrice)
          map.set(pair.symbol, {
            symbol: pair.symbol,
            base: pair.base,
            name: pair.name,
            price,
            change24h: open > 0 ? ((price - open) / open) * 100 : 0,
            volume: parseFloat(t.quoteVolume),
          })
        }
        setTickers(map)
      } catch {
        // Fallback: fetch individually for top 5
        for (const pair of PAIRS.slice(0, 5)) {
          try {
            const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair.symbol}`)
            if (!res.ok) continue
            const t: Record<string, string> = await res.json()
            const price = parseFloat(t.lastPrice)
            const open = parseFloat(t.openPrice)
            setTickers((prev) => {
              const next = new Map(prev)
              next.set(pair.symbol, {
                symbol: pair.symbol, base: pair.base, name: pair.name, price,
                change24h: open > 0 ? ((price - open) / open) * 100 : 0,
                volume: parseFloat(t.quoteVolume),
              })
              return next
            })
          } catch { /* skip */ }
        }
      }
    }
    fetchTickers()
  }, [])

  // Connect to Binance WebSocket for real-time mini ticker updates
  useEffect(() => {
    const streams = PAIRS.map((p) => `${p.symbol.toLowerCase()}@miniTicker`).join("/")
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        const d = msg.data
        if (!d || !d.s) return
        const pair = PAIRS.find((p) => p.symbol === d.s)
        if (!pair) return
        const price = parseFloat(d.c)
        const open = parseFloat(d.o)
        setTickers((prev) => {
          const next = new Map(prev)
          next.set(pair.symbol, {
            symbol: pair.symbol, base: pair.base, name: pair.name, price,
            change24h: open > 0 ? ((price - open) / open) * 100 : 0,
            volume: parseFloat(d.q),
          })
          return next
        })
      } catch { /* ignore */ }
    }
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)

    return () => { ws.close() }
  }, [])

  const toggleFav = (e: React.MouseEvent, base: string) => {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(base)) next.delete(base)
      else next.add(base)
      return next
    })
  }

  const allPairs = PAIRS.map((p) => tickers.get(p.symbol) || {
    symbol: p.symbol, base: p.base, name: p.name, price: 0, change24h: 0, volume: 0,
  })

  const displayPairs = allPairs
    .filter((p) => {
      if (showFavorites && !favorites.has(p.base)) return false
      if (search) {
        const q = search.toLowerCase()
        return p.base.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => b.volume - a.volume)

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Search */}
      <div className="border-b border-border p-2">
        <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pair..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        <button
          onClick={() => setShowFavorites(false)}
          className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
            !showFavorites ? "bg-[#f7a600]/10 text-[#f7a600]" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setShowFavorites(true)}
          className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
            showFavorites ? "bg-[#f7a600]/10 text-[#f7a600]" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className="h-3 w-3" />
          Fav
        </button>
        <div className="ml-auto flex items-center gap-1">
          <div className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-[#0ecb81]" : "bg-destructive"}`} />
          <span className="text-[9px] text-muted-foreground">{connected ? "Live" : "..."}</span>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-1.5">
        <span className="text-[10px] text-muted-foreground">Pair</span>
        <span className="w-[72px] text-right text-[10px] text-muted-foreground">Price</span>
        <span className="w-[52px] text-right text-[10px] text-muted-foreground">24h %</span>
      </div>

      {/* Pair List */}
      <div className="flex-1 overflow-y-auto">
        {displayPairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-[11px] text-muted-foreground">Loading pairs...</span>
          </div>
        ) : (
          displayPairs.map((pair) => {
            const isActive = pair.symbol === activePair
            return (
              <div
                key={pair.symbol}
                onClick={() => onSelectPair?.(pair.symbol)}
                className={`group grid cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-[7px] transition-colors hover:bg-secondary/40 ${
                  isActive ? "bg-[#f7a600]/5 border-l-2 border-l-[#f7a600]" : "border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <button onClick={(e) => toggleFav(e, pair.base)} className="shrink-0">
                    <Star
                      className={`h-3 w-3 ${
                        favorites.has(pair.base) ? "fill-[#f7a600] text-[#f7a600]" : "text-muted-foreground/40 group-hover:text-muted-foreground"
                      }`}
                    />
                  </button>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`truncate text-xs font-medium ${isActive ? "text-[#f7a600]" : "text-foreground"}`}>
                      {pair.base}
                      <span className="text-muted-foreground">/USDT</span>
                    </span>
                    <span className="truncate text-[9px] leading-none text-muted-foreground">{pair.name}</span>
                  </div>
                </div>
                <span className="w-[72px] text-right font-mono text-[11px] text-foreground">
                  {pair.price > 0 ? formatPrice(pair.price) : "--"}
                </span>
                <span
                  className={`w-[52px] rounded px-1 py-0.5 text-right font-mono text-[10px] font-medium ${
                    pair.change24h >= 0
                      ? "bg-[#0ecb81]/10 text-[#0ecb81]"
                      : "bg-[#f6465d]/10 text-[#f6465d]"
                  }`}
                >
                  {pair.change24h >= 0 ? "+" : ""}
                  {pair.change24h.toFixed(2)}%
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
