"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MarketTicker } from "@/components/market-ticker"
import { useLivePrices, formatPrice, formatVolume, type PriceData } from "@/hooks/use-live-prices"
import { MarketAsset, formatAssetPrice } from "@/components/market-asset"
import {
  Search, Star, TrendingUp, TrendingDown, ArrowUpDown,
  Flame, Sparkles, BarChart3, ChevronRight, Filter,
} from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

type AssetClass = "crypto" | "forex" | "commodities" | "stocks" | "cfd"
type MarketCategory = "all" | "spot" | "derivatives" | "defi" | "metaverse" | "layer1" | "layer2" | "meme"
type SortKey = "name" | "price" | "change" | "volume" | "marketCap"
type SortDir = "asc" | "desc"

const assetClassTabs: { id: AssetClass; label: string }[] = [
  { id: "crypto", label: "Crypto" },
  { id: "forex", label: "Forex" },
  { id: "commodities", label: "Commodities" },
  { id: "stocks", label: "Stocks" },
  { id: "cfd", label: "CFD" },
]

const categoryFilters: { id: MarketCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "spot", label: "Spot" },
  { id: "derivatives", label: "Derivatives" },
  { id: "defi", label: "DeFi" },
  { id: "layer1", label: "Layer 1" },
  { id: "layer2", label: "Layer 2" },
  { id: "meme", label: "Meme" },
  { id: "metaverse", label: "Metaverse" },
]

const categoryMap: Record<string, MarketCategory[]> = {
  BTC: ["layer1"], ETH: ["layer1", "defi"], SOL: ["layer1"], XRP: ["layer1"],
  ADA: ["layer1"], BNB: ["layer1"], AVAX: ["layer1"], DOT: ["layer1"],
  MATIC: ["layer2"], ARB: ["layer2"], OP: ["layer2"],
  DOGE: ["meme"], SHIB: ["meme"], PEPE: ["meme"], FLOKI: ["meme"],
  UNI: ["defi"], AAVE: ["defi"], LINK: ["defi"], MKR: ["defi"],
  SAND: ["metaverse"], MANA: ["metaverse"], AXS: ["metaverse"],
}

export default function MarketsPage() {
  const { crypto, forex, commodities, stocks, cfd, isLoading } = useLivePrices(5000)
  const [search, setSearch] = useState("")
  const [assetClass, setAssetClass] = useState<AssetClass>("crypto")
  const [category, setCategory] = useState<MarketCategory>("all")
  const [sortKey, setSortKey] = useState<SortKey>("volume")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["BTC", "ETH", "SOL", "EUR/USD", "XAU/USD", "AAPL"]))

  const getAssetsForClass = (): PriceData[] => {
    switch (assetClass) {
      case "crypto": return crypto
      case "forex": return forex
      case "commodities": return commodities
      case "stocks": return stocks
      case "cfd": return cfd
      default: return crypto
    }
  }

  const currentAssets = getAssetsForClass()

  const toggleFav = (symbol: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(symbol)) next.delete(symbol)
      else next.add(symbol)
      return next
    })
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

  const filtered = useMemo(() => {
    let list = [...currentAssets]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    }
    if (assetClass === "crypto" && category !== "all" && category !== "spot" && category !== "derivatives") {
      list = list.filter((c) => categoryMap[c.symbol]?.includes(category))
    }
    list.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "name": cmp = a.symbol.localeCompare(b.symbol); break
        case "price": cmp = a.price - b.price; break
        case "change": cmp = a.change24h - b.change24h; break
        case "volume": cmp = (a.volume * a.price) - (b.volume * b.price); break
        case "marketCap": cmp = (a.volume * a.price) - (b.volume * b.price); break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return list
  }, [currentAssets, search, assetClass, category, sortKey, sortDir])

  const topGainers = useMemo(() => [...currentAssets].sort((a, b) => b.change24h - a.change24h).slice(0, 5), [currentAssets])
  const topLosers = useMemo(() => [...currentAssets].sort((a, b) => a.change24h - b.change24h).slice(0, 5), [currentAssets])
  const hotCoins = useMemo(() => [...currentAssets].sort((a, b) => (b.volume * b.price) - (a.volume * a.price)).slice(0, 5), [currentAssets])
  const newListings = useMemo(() => [...currentAssets].slice(-5).reverse(), [currentAssets])

  const SortIcon = ({ field }: { field: SortKey }) => (
    <ArrowUpDown className={`h-3 w-3 ${sortKey === field ? "text-primary" : "text-muted-foreground/40"}`} />
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MarketTicker />
      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-8 lg:py-12">
            <h1 className="text-balance text-3xl font-bold text-foreground lg:text-4xl">
              {assetClass === "crypto" ? "Cryptocurrency Prices" :
               assetClass === "forex" ? "Forex Markets" :
               assetClass === "commodities" ? "Commodities" :
               assetClass === "stocks" ? "Stock Markets" : "CFD Markets"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {assetClass === "crypto" ? <>The global crypto market cap is <span className="font-semibold text-foreground">$2.84T</span>, a <span className="text-success">+2.34%</span> change over the last day.</> :
               assetClass === "forex" ? "Real-time foreign exchange rates for major, minor, and exotic currency pairs." :
               assetClass === "commodities" ? "Live prices for gold, silver, oil, natural gas, and other commodities." :
               assetClass === "stocks" ? "Track major US and global equity markets in real time." :
               "Trade global indices and other CFD instruments with up to 100x leverage."}
            </p>
            {/* Asset class tabs */}
            <div className="mt-6 flex items-center gap-1 overflow-x-auto rounded-lg bg-secondary p-1">
              {assetClassTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setAssetClass(tab.id); setCategory("all"); setSearch(""); }}
                  className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    assetClass === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Stats Cards */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Hot */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Hot</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
                {hotCoins.slice(0, 3).map((c) => (
                  <Link key={c.symbol} href={c.category === "crypto" ? `/trade?pair=${c.symbol}USDT` : `/trade?pair=${encodeURIComponent(c.symbol)}`} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <MarketAsset symbol={c.symbol} size={20} />
                      <span className="text-xs font-medium text-foreground">{c.symbol}</span>
                    </div>
                    <span className={`font-mono text-xs ${c.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                      {c.change24h >= 0 ? "+" : ""}{c.change24h.toFixed(2)}%
                    </span>
                  </Link>
                ))}
              </div>

              {/* Top Gainers */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm font-semibold text-foreground">Top Gainers</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
                {topGainers.slice(0, 3).map((c) => (
                  <Link key={c.symbol} href={c.category === "crypto" ? `/trade?pair=${c.symbol}USDT` : `/trade?pair=${encodeURIComponent(c.symbol)}`} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <MarketAsset symbol={c.symbol} size={20} />
                      <span className="text-xs font-medium text-foreground">{c.symbol}</span>
                    </div>
                    <span className="font-mono text-xs text-success">+{c.change24h.toFixed(2)}%</span>
                  </Link>
                ))}
              </div>

              {/* Top Losers */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-foreground">Top Losers</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
                {topLosers.slice(0, 3).map((c) => (
                  <Link key={c.symbol} href={c.category === "crypto" ? `/trade?pair=${c.symbol}USDT` : `/trade?pair=${encodeURIComponent(c.symbol)}`} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <MarketAsset symbol={c.symbol} size={20} />
                      <span className="text-xs font-medium text-foreground">{c.symbol}</span>
                    </div>
                    <span className="font-mono text-xs text-destructive">{c.change24h.toFixed(2)}%</span>
                  </Link>
                ))}
              </div>

              {/* New Listings */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-chart-4" />
                  <span className="text-sm font-semibold text-foreground">New Listings</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
                {newListings.slice(0, 3).map((c) => (
                  <Link key={c.symbol} href={c.category === "crypto" ? `/trade?pair=${c.symbol}USDT` : `/trade?pair=${encodeURIComponent(c.symbol)}`} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <MarketAsset symbol={c.symbol} size={20} />
                      <span className="text-xs font-medium text-foreground">{c.symbol}</span>
                    </div>
                    <span className="font-mono text-xs text-foreground">${formatPrice(c.price)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Market Table */}
        <section>
          <div className="mx-auto max-w-[1400px] px-4 py-6">
            {/* Filters */}
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {assetClass === "crypto" && (
                <div className="scrollbar-none flex items-center gap-1 overflow-x-auto">
                  {categoryFilters.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        category === cat.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search coin name..."
                  className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-card/50">
                    <th className="w-10 px-4 py-3"></th>
                    <th className="px-4 py-3 text-left">
                      <button onClick={() => toggleSort("name")} className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        # Name <SortIcon field="name" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <button onClick={() => toggleSort("price")} className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        Price <SortIcon field="price" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <button onClick={() => toggleSort("change")} className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        24h Change <SortIcon field="change" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <button onClick={() => toggleSort("volume")} className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        24h Volume <SortIcon field="volume" />
                      </button>
                    </th>
                    <th className="hidden px-4 py-3 text-right lg:table-cell">
                      <span className="text-xs font-medium text-muted-foreground">Last 7 Days</span>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <span className="text-xs font-medium text-muted-foreground">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="h-5 w-full animate-pulse rounded bg-secondary" />
                          </td>
                        </tr>
                      ))
                    : filtered.map((coin, idx) => (
                        <tr key={coin.symbol} className="group/row border-b border-border/50 transition-colors hover:bg-card/50">
                          <td className="px-4 py-3">
                            <button onClick={() => toggleFav(coin.symbol)} className="text-muted-foreground hover:text-primary">
                              <Star className={`h-4 w-4 ${favorites.has(coin.symbol) ? "fill-primary text-primary" : ""}`} />
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={coin.category === "crypto" ? `/trade?pair=${coin.symbol}USDT` : `/trade?pair=${encodeURIComponent(coin.symbol)}`} className="flex items-center gap-3">
                              <span className="w-6 text-right font-mono text-xs text-muted-foreground">{idx + 1}</span>
                              <MarketAsset symbol={coin.symbol} size={28} />
                              <div>
                                <span className="text-sm font-semibold text-foreground">{coin.symbol}</span>
                                <span className="ml-1.5 text-xs text-muted-foreground">{coin.name}</span>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                            ${formatPrice(coin.price)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-block rounded-md px-2 py-1 font-mono text-xs font-medium ${
                              coin.change24h >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                            }`}>
                              {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                            ${formatVolume(coin.volume * coin.price)}
                          </td>
                          <td className="hidden px-4 py-3 lg:table-cell">
                            {coin.sparkline && coin.sparkline.length > 1 && (
                              <svg viewBox="0 0 80 24" className="ml-auto h-6 w-20" preserveAspectRatio="none">
                                <path
                                  d={coin.sparkline.map((v: number, i: number) => {
                                    const x = (i / (coin.sparkline.length - 1)) * 80
                                    const mn = Math.min(...coin.sparkline)
                                    const mx = Math.max(...coin.sparkline)
                                    const y = 22 - ((v - mn) / (mx - mn || 1)) * 20
                                    return `${i === 0 ? "M" : "L"}${x},${y}`
                                  }).join(" ")}
                                  fill="none"
                                  stroke={coin.change24h >= 0 ? "hsl(145,63%,49%)" : "hsl(0,84%,60%)"}
                                  strokeWidth="1.5"
                                />
                              </svg>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={coin.category === "crypto" ? `/trade?pair=${coin.symbol}USDT` : `/trade?pair=${encodeURIComponent(coin.symbol)}`}
                              className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_12px_rgba(234,179,8,0.2)]"
                            >
                              Trade
                            </Link>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <BottomNav />
      <div className="hidden lg:block"><Footer /></div>
    </div>
  )
}
