"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Eye, EyeOff, ChevronRight, ChevronDown, Search, ScanLine, Bell,
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight, RefreshCw, Gift, CreditCard,
  Calendar, Coins, MoreHorizontal, Star, Check, Plus, RotateCcw,
} from "lucide-react"
import { useLivePrices, formatPrice, safeFindPrice, type PriceData } from "@/hooks/use-live-prices"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

const quickActions = [
  { label: "P2P Trading", href: "/p2p", icon: ArrowLeftRight, color: "bg-card" },
  { label: "Deposit", href: "/deposit", icon: ArrowDownLeft, color: "bg-card" },
  { label: "Card", href: "/card", icon: CreditCard, color: "bg-card" },
  { label: "Rewards Hub", href: "/rewards", icon: Gift, color: "bg-card" },
  { label: "Daily Delight", href: "/rewards", icon: Calendar, color: "bg-card" },
  { label: "Bybit Earn", href: "/earn", icon: Coins, color: "bg-card" },
  { label: "More", href: "/dashboard", icon: MoreHorizontal, color: "bg-card" },
]

const events = [
  { title: "800,000 USDC awaits", subtitle: "Events", cta: "Explore Now" },
  { title: "Wednesday Airdrop: Trade to share over $150,000", subtitle: "Events", cta: "Explore Now" },
  { title: "Trade gold and grab up to $2,000 gold bar airdrop!", subtitle: "Events", cta: "Explore Now" },
  { title: "Up or down? Tap to predict. Win $5,000 airdrop", subtitle: "Today's pick", cta: "Explore Now" },
]

type MarketTab = "favorites" | "hot" | "new" | "gainers" | "losers" | "turnover"
type MarketSubTab = "spot" | "derivatives" | "forex" | "stocks" | "commodities" | "cfd"

export function HomeLoggedIn({ user }: { user: User }) {
  const { crypto, forex, commodities, stocks, cfd, isLoading } = useLivePrices(5000)
  const [showBalance, setShowBalance] = useState(true)
  const [totalAssets, setTotalAssets] = useState(0)
  const [todayPnl, setTodayPnl] = useState({ amount: 0, percent: 0 })
  const [activeTab, setActiveTab] = useState<MarketTab>("favorites")
  const [subTab, setSubTab] = useState<MarketSubTab>("spot")
  const [eventIndex, setEventIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>(["BTC", "ETH", "SOL", "XRP", "AVAX", "EUR/USD", "XAU/USD", "AAPL", "US500"])
  const [unreadCount, setUnreadCount] = useState(0)

  const initials = (user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()
  const maskedEmail = user.email ? user.email.replace(/(.{3}).*(@.*)/, "$1***$2") : "User"

  // Fetch notification count
  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => { if (typeof d.unread_count === "number") setUnreadCount(d.unread_count) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.from("balances").select("*").then(({ data }) => {
      if (data && data.length > 0) {
        const total = data.reduce((s: number, b: any) => {
          const allPrices = [...crypto, ...forex, ...commodities, ...stocks, ...cfd]
    const coin = safeFindPrice(allPrices, b.asset)
          const price = coin ? coin.price : b.asset === "USDT" ? 1 : 0
          return s + Number(b.available || 0) * price + Number(b.in_order || 0) * price
        }, 0)
        setTotalAssets(total)
      }
    }).catch(() => {})
    supabase.from("trades").select("pnl").order("created_at", { ascending: false }).limit(20).then(({ data }) => {
      if (data) {
        const pnl = data.reduce((s: number, t: any) => s + (Number(t.pnl) || 0), 0)
        const pct = totalAssets > 0 ? (pnl / totalAssets) * 100 : 0
        setTodayPnl({ amount: pnl, percent: pct })
      }
    }).catch(() => {})
  }, [crypto, totalAssets])

  useEffect(() => {
    const timer = setInterval(() => setEventIndex(i => (i + 1) % events.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const tabs: { key: MarketTab; label: string }[] = [
    { key: "favorites", label: "Favorites" },
    { key: "hot", label: "Hot" },
    { key: "new", label: "New" },
    { key: "gainers", label: "Gainers" },
    { key: "losers", label: "Losers" },
    { key: "turnover", label: "Turnover" },
  ]

  const getDataForSubTab = (): PriceData[] => {
    switch (subTab) {
      case "spot": return crypto
      case "derivatives": return crypto
      case "forex": return forex
      case "stocks": return stocks
      case "commodities": return commodities
      case "cfd": return cfd
      default: return crypto
    }
  }

  const getFilteredCoins = () => {
    let coins = [...getDataForSubTab()]
    if (searchQuery) {
      coins = coins.filter(c => c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    switch (activeTab) {
      case "favorites": return coins.filter(c => favorites.includes(c.symbol))
      case "hot": return coins.sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 10)
      case "gainers": return coins.sort((a, b) => b.change24h - a.change24h).slice(0, 10)
      case "losers": return coins.sort((a, b) => a.change24h - b.change24h).slice(0, 10)
      case "turnover": return coins.sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 10)
      case "new": return coins.slice(0, 8)
      default: return coins.slice(0, 10)
    }
  }

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol])
  }

  const filteredCoins = getFilteredCoins()
  const event = events[eventIndex]

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-8">
      {/* Top bar with avatar, search, scan, notifications */}
      <div className="flex items-center gap-3 py-4 lg:hidden">
        <Link href="/account/settings" className="shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
            {initials}
          </div>
        </Link>
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coins..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button className="p-1.5 text-muted-foreground"><ScanLine className="h-5 w-5" /></button>
        <Link href="/account/notifications" className="relative p-1.5 text-muted-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* Total Assets */}
      <div className="rounded-xl bg-card p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total Assets</span>
              <button onClick={() => setShowBalance(!showBalance)} className="text-muted-foreground">
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {showBalance ? totalAssets.toFixed(2) : "****"}
              </span>
              <span className="flex items-center gap-0.5 text-sm text-muted-foreground">
                USD <ChevronDown className="h-3 w-3" />
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-sm text-muted-foreground">{"Today's P&L"}</span>
              <span className={`text-sm font-medium ${todayPnl.amount >= 0 ? "text-success" : "text-destructive"}`}>
                {showBalance ? `${todayPnl.amount >= 0 ? "+" : ""}${todayPnl.amount.toFixed(2)} USD(${todayPnl.percent >= 0 ? "+" : ""}${todayPnl.percent.toFixed(2)}%)` : "****"}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
          <Link href="/deposit" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
            Deposit
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="mt-4 grid grid-cols-4 gap-x-4 gap-y-3 lg:grid-cols-7">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href} className="flex flex-col items-center gap-1.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-muted-foreground transition-colors hover:bg-secondary">
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-center text-[11px] text-muted-foreground">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Events Carousel */}
      <div className="mt-5 rounded-xl bg-card p-4">
        <div className="text-[10px] font-medium uppercase tracking-wider text-primary">Events</div>
        <h3 className="mt-1 text-sm font-semibold text-foreground">{event.title}</h3>
        <div className="mt-2 flex items-center justify-between">
          <Link href="/announcements" className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground">
            {event.cta} <ChevronRight className="h-3 w-3" />
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-primary">{eventIndex + 1}</span>
            <span className="text-[10px] text-muted-foreground">/{events.length}</span>
          </div>
        </div>
      </div>

      {/* Market Tabs */}
      <div className="mt-5 rounded-xl bg-card">
        {/* Main tabs */}
        <div className="scrollbar-none flex items-center gap-0 overflow-x-auto px-4 pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-3 pb-2 text-sm font-medium transition-colors ${activeTab === tab.key ? "text-foreground" : "text-muted-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub tabs */}
        <div className="scrollbar-none flex items-center gap-0 overflow-x-auto px-4 pb-3">
          {(["spot", "derivatives", "forex", "stocks", "commodities", "cfd"] as MarketSubTab[]).map((st) => (
            <button
              key={st}
              onClick={() => setSubTab(st)}
              className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${subTab === st ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
            >
              {st === "cfd" ? "CFD" : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>

        {/* Favorites grid view */}
        {activeTab === "favorites" ? (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {filteredCoins.map((coin) => (
                <Link
                  key={coin.symbol}
                  href={coin.category === "crypto" ? `/trade?pair=${coin.symbol}USDT` : `/trade?pair=${encodeURIComponent(coin.symbol)}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-secondary/30"
                >
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-foreground">{coin.symbol}</span>
                      {coin.category === "crypto" && <span className="text-[11px] text-muted-foreground">/USDT</span>}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="font-mono text-xs text-muted-foreground">{formatPrice(coin.price)}</span>
                      <span className={`font-mono text-xs font-medium ${coin.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                        {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <Check className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
            <div className="mt-3 flex justify-center">
              <Link href="/markets" className="rounded-full border border-border px-6 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
                Add to Favorites
              </Link>
            </div>
          </div>
        ) : (
          /* List view for other tabs */
          <div className="px-4 pb-4">
            {filteredCoins.map((coin) => (
              <Link
                key={coin.symbol}
                href={coin.category === "crypto" ? `/trade?pair=${coin.symbol}USDT` : `/trade?pair=${encodeURIComponent(coin.symbol)}`}
                className="flex items-center justify-between py-3 transition-colors hover:bg-secondary/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                    {coin.symbol.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-foreground">{coin.symbol}</span>
                      {coin.category === "crypto" && <span className="text-[11px] text-muted-foreground">/ USDT</span>}
                      {coin.category === "crypto" && <span className="rounded bg-secondary px-1 py-0.5 text-[9px] font-medium text-muted-foreground">10x</span>}
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {((coin.volume || 0) / 1e6).toFixed(2)}M USDT
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-foreground">{formatPrice(coin.price)}</span>
                  <span className={`rounded-md px-2 py-1 font-mono text-xs font-semibold text-card ${coin.change24h >= 0 ? "bg-success" : "bg-destructive"}`}>
                    {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                  </span>
                </div>
              </Link>
            ))}
            <div className="mt-2 flex justify-center">
              <Link href="/markets" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                More <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {/* View All Markets CTA */}
        <div className="flex items-center justify-center border-t border-border px-4 py-3">
          <Link href="/markets" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View All Markets <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Add widget / Reset layout buttons */}
      <div className="mt-4 flex items-center gap-3">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
          <Plus className="h-4 w-4" /> Add widget
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
          <RotateCcw className="h-4 w-4" /> Reset layout
        </button>
      </div>
    </div>
  )
}
