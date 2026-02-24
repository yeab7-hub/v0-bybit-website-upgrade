"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search, Eye, EyeOff, Bell, ChevronDown, ChevronRight,
  ArrowDownLeft, Gift, Calendar, Coins, MoreHorizontal,
  ArrowLeftRight, Home, TrendingUp, LineChart, Wallet,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useLivePrices, formatPrice, formatVolume, type PriceData } from "@/hooks/use-live-prices"
import { MarketAsset, formatAssetPrice } from "@/components/market-asset"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getPriceForSymbol(crypto: PriceData[], symbol: string): number {
  if (symbol === "USDT" || symbol === "USDC") return 1
  return crypto.find((c) => c.symbol === symbol)?.price ?? 0
}

const MARKET_TABS = ["Favorites", "Hot", "New", "Gainers", "Losers", "Turnover"] as const
const MARKET_SUB_TABS = ["Spot", "Derivatives", "Forex", "Stocks", "Commodities"] as const

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string; full_name?: string; kyc_status?: string } | null>(null)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const { crypto, forex, commodities, stocks, isLoading: priceLoading } = useLivePrices(5000)
  const { data: balData } = useSWR("/api/trade?type=balances", fetcher, { refreshInterval: 5000 })
  const { data: tradeData } = useSWR("/api/trade?type=trades", fetcher, { refreshInterval: 10000 })

  const balances = balData?.balances ?? []
  const trades = tradeData?.trades ?? []

  const [marketTab, setMarketTab] = useState<typeof MARKET_TABS[number]>("Hot")
  const [subTab, setSubTab] = useState<typeof MARKET_SUB_TABS[number]>("Spot")
  const [favorites] = useState<Set<string>>(new Set(["BTC", "ETH", "SOL"]))

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u) {
        const { data: profile } = await supabase.from("profiles").select("full_name, email, kyc_status").eq("id", u.id).single()
        setUser({ email: u.email, full_name: profile?.full_name, kyc_status: profile?.kyc_status || "none" })
      }
    }
    getUser()
  }, [])

  const totalUsd = useMemo(() => {
    return balances.reduce((sum: number, b: { asset: string; available: number; in_order: number }) => {
      const total = Number(b.available) + Number(b.in_order)
      return sum + total * getPriceForSymbol(crypto, b.asset)
    }, 0)
  }, [balances, crypto])

  const totalPnl = trades.reduce((sum: number, t: { pnl: number }) => sum + Number(t.pnl), 0)
  const pnlPercent = totalUsd > 0 ? ((totalPnl / totalUsd) * 100) : 0

  const allAssets = useMemo(() => {
    switch (subTab) {
      case "Spot": return [...crypto]
      case "Derivatives": return [...crypto.slice(0, 15)]
      case "Forex": return [...forex]
      case "Stocks": return [...stocks]
      case "Commodities": return [...commodities]
      default: return [...crypto]
    }
  }, [crypto, forex, stocks, commodities, subTab])

  const displayAssets = useMemo(() => {
    let filtered = [...allAssets]
    switch (marketTab) {
      case "Favorites":
        filtered = filtered.filter((a) => favorites.has(a.symbol))
        break
      case "Hot":
        filtered.sort((a, b) => b.volume - a.volume)
        break
      case "New":
        filtered = filtered.slice().reverse()
        break
      case "Gainers":
        filtered.sort((a, b) => b.change24h - a.change24h)
        break
      case "Losers":
        filtered.sort((a, b) => a.change24h - b.change24h)
        break
      case "Turnover":
        filtered.sort((a, b) => (b.volume * b.price) - (a.volume * a.price))
        break
    }
    return filtered.slice(0, 30)
  }, [allAssets, marketTab, favorites])

  const displayName = user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"

  const quickActions = [
    { label: "P2P Trading", icon: ArrowLeftRight, href: "/trade" },
    { label: "Deposit", icon: ArrowDownLeft, href: "/wallet" },
    { label: "Rewards Hub", icon: Gift, href: "/earn" },
    { label: "Daily Delight", icon: Calendar, href: "/earn" },
    { label: "Bybit Earn", icon: Coins, href: "/earn" },
    { label: "More", icon: MoreHorizontal, href: "/buy-crypto" },
  ]

  const bottomNav = [
    { label: "Home", icon: Home, href: "/dashboard", active: true },
    { label: "Markets", icon: LineChart, href: "/trade" },
    { label: "Trade", icon: TrendingUp, href: "/trade?pair=BTCUSDT" },
    { label: "Earn", icon: Coins, href: "/earn" },
    { label: "Assets", icon: Wallet, href: "/wallet" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20 lg:pb-0">
      {/* ===== TOP BAR ===== */}
      <header className="sticky top-0 z-40 bg-background px-4 pb-2 pt-3 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Link href="/account/settings" className="shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600">
              <span className="text-sm font-bold text-white">{displayName}</span>
            </div>
          </Link>

          <button
            onClick={() => router.push("/trade")}
            className="flex flex-1 items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2.5 md:max-w-sm"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search coins, pairs...</span>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/trade" className="text-sm font-medium text-muted-foreground hover:text-foreground">Trade</Link>
            <Link href="/earn" className="text-sm font-medium text-muted-foreground hover:text-foreground">Earn</Link>
            <Link href="/wallet" className="text-sm font-medium text-muted-foreground hover:text-foreground">Assets</Link>
          </nav>

          <button className="shrink-0 rounded-lg p-2 text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
              <rect x="7" y="7" width="10" height="10" rx="1" />
            </svg>
          </button>

          <Link href="/support" className="relative shrink-0 rounded-lg p-2 text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[8px] font-bold text-destructive-foreground">
              99+
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 lg:px-8">
        {/* ===== TOTAL ASSETS + QUICK ACTIONS — side-by-side on desktop ===== */}
        <div className="flex flex-col gap-4 pb-4 pt-2 lg:flex-row lg:items-start lg:gap-8">
          {/* Total Assets */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total Assets</span>
              <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-muted-foreground">
                {balanceVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="mt-1.5 flex items-end justify-between lg:justify-start lg:gap-6">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[36px] font-bold leading-none tracking-tight text-foreground md:text-[44px]">
                    {balanceVisible
                      ? totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : "****"}
                  </span>
                  <button className="flex items-center gap-0.5 text-sm text-muted-foreground">
                    USD <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">{"Today's P&L"}</span>
                  <span className={`text-sm font-medium ${totalPnl >= 0 ? "text-success" : "text-destructive"}`}>
                    {balanceVisible
                      ? `${totalPnl >= 0 ? "" : "-"}${Math.abs(totalPnl).toFixed(2)} USD(${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%)`
                      : "****"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>

              <Link
                href="/wallet"
                className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground lg:ml-4"
              >
                Deposit
              </Link>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="lg:w-[380px]">
            <div className="grid grid-cols-4 gap-x-2 gap-y-4 md:grid-cols-6 lg:grid-cols-3">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} className="flex flex-col items-center gap-1.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/60">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-center text-[11px] leading-tight text-muted-foreground">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ===== MARKET SECTION ===== */}
        <div className="mt-2 flex-1 rounded-t-3xl bg-card px-4 pt-4 lg:rounded-2xl lg:px-6 lg:pb-6">
          {/* Market Tabs */}
          <div className="scrollbar-none flex gap-4 overflow-x-auto border-b border-border pb-2 md:gap-6">
            {MARKET_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setMarketTab(tab)}
                className={`shrink-0 text-sm font-medium transition-colors ${
                  marketTab === tab ? "font-bold text-foreground" : "text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sub Tabs */}
          <div className="scrollbar-none flex gap-1 overflow-x-auto py-2.5">
            {MARKET_SUB_TABS.map((st) => (
              <button
                key={st}
                onClick={() => setSubTab(st)}
                className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  subTab === st
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Column headers — visible on tablet+ */}
          <div className="hidden items-center border-b border-border pb-2 md:flex">
            <span className="flex-1 text-xs text-muted-foreground">Name</span>
            <span className="w-28 text-right text-xs text-muted-foreground">Volume</span>
            <span className="w-28 text-right text-xs text-muted-foreground">Price</span>
            <span className="w-20 text-right text-xs text-muted-foreground">24h Change</span>
            <span className="hidden w-20 text-right text-xs text-muted-foreground lg:block">Action</span>
          </div>

          {/* Market Rows */}
          <div className="flex flex-col">
            {priceLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-3.5">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                    <div className="flex-1">
                      <div className="h-4 w-28 animate-pulse rounded bg-secondary" />
                      <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-secondary" />
                    </div>
                    <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
                    <div className="h-7 w-16 animate-pulse rounded bg-secondary" />
                  </div>
                ))
              : displayAssets.map((asset) => {
                  const isCrypto = subTab === "Spot" || subTab === "Derivatives"
                  const pairSymbol = isCrypto ? `${asset.symbol}USDT` : asset.symbol
                  const change = asset.change24h
                  const isPositive = change >= 0

                  return (
                    <Link
                      key={asset.symbol}
                      href={`/trade?pair=${encodeURIComponent(pairSymbol)}`}
                      className="flex items-center gap-3 py-3.5 active:bg-secondary/30 md:py-3"
                    >
                      <MarketAsset symbol={asset.symbol} size={36} />

                      {/* Name + badge */}
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[15px] font-bold text-foreground md:text-sm">{asset.symbol}</span>
                          {isCrypto ? (
                            <>
                              <span className="text-[13px] text-muted-foreground md:text-xs">/ USDT</span>
                              <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-semibold text-muted-foreground">
                                10x
                              </span>
                            </>
                          ) : (
                            <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-semibold text-muted-foreground">
                              CFD
                            </span>
                          )}
                        </div>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground md:hidden">
                          {asset.volume > 0 ? formatVolume(asset.volume * asset.price) : "0"}{isCrypto ? " USDT" : ""}
                        </span>
                        {/* Desktop: show asset name */}
                        <span className="mt-0.5 hidden text-xs text-muted-foreground md:block">
                          {asset.name}
                        </span>
                      </div>

                      {/* Volume — tablet+ */}
                      <span className="hidden w-28 text-right font-mono text-xs text-muted-foreground md:block">
                        {formatVolume(asset.volume * asset.price)}
                      </span>

                      {/* Price */}
                      <span className="min-w-[80px] text-right font-mono text-[15px] font-medium text-foreground md:w-28 md:text-sm">
                        {asset.price > 0
                          ? (isCrypto
                              ? `$${formatPrice(asset.price)}`
                              : formatAssetPrice(asset.price, asset.symbol))
                          : "--"}
                      </span>

                      {/* Change badge */}
                      <div
                        className={`min-w-[68px] rounded-md px-2.5 py-1.5 text-center text-[13px] font-semibold md:w-20 md:text-xs ${
                          isPositive
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {isPositive ? "+" : ""}{change.toFixed(2)}%
                      </div>

                      {/* Trade button — desktop only */}
                      <span className="hidden w-20 text-right lg:block">
                        <span className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                          Trade
                        </span>
                      </span>
                    </Link>
                  )
                })}

            <Link
              href="/trade"
              className="flex items-center justify-center gap-1 py-4 text-sm text-primary"
            >
              View All Markets <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* ===== Bottom Navigation Bar — mobile/tablet only ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border bg-card pb-[env(safe-area-inset-bottom)] pt-1.5 lg:hidden">
        {bottomNav.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 ${
              item.active ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <item.icon className={`h-5 w-5 ${item.active ? "text-foreground" : ""}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
