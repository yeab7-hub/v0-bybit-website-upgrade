"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowUpDown, Download, Upload, RefreshCw, Plus, ChevronRight, Home, LineChart, TrendingUp, Coins, Wallet } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useLivePrices, formatPrice, safeFindPrice } from "@/hooks/use-live-prices"
import { MarketAsset } from "@/components/market-asset"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AssetOverviewPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [visible, setVisible] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "spot" | "funding" | "earn">("overview")
  const { crypto, forex, commodities, stocks, cfd } = useLivePrices(5000)
  const allPrices = [...crypto, ...forex, ...commodities, ...stocks, ...cfd]

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => { if (data.user) setUser(data.user); else router.push("/login") }).catch(() => router.push("/login"))
    } catch { router.push("/login") }
  }, [router])

  const { data: balData } = useSWR(user ? "/api/trade?type=balances" : null, fetcher, { refreshInterval: 5000 })
  const balances = balData?.balances ?? []

  const totalValue = useMemo(() => {
    return balances.reduce((sum: number, b: any) => {
      const price = b.asset === "USDT" ? 1 : (safeFindPrice(allPrices, b.asset)?.price ?? 0)
      return sum + (Number(b.available) + Number(b.in_order)) * price
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balances, allPrices.length])

  const tabs = ["overview", "spot", "funding", "earn"] as const
  const bottomNav = [
    { label: "Home", icon: Home, href: "/dashboard", active: false },
    { label: "Markets", icon: LineChart, href: "/markets", active: false },
    { label: "Trade", icon: TrendingUp, href: "/trade", active: false },
    { label: "Earn", icon: Coins, href: "/earn", active: false },
    { label: "Assets", icon: Wallet, href: "/wallet", active: true },
  ]

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="hidden lg:block"><Header /></div>

      <main className="flex-1 pb-20 lg:pb-0">
        {/* Total Balance */}
        <div className="border-b border-border px-4 py-6 lg:mx-auto lg:max-w-[1200px] lg:px-8 lg:py-10">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">Total Asset Value</h1>
            <button onClick={() => setVisible(!visible)} className="text-muted-foreground">
              {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 font-mono text-3xl font-bold text-foreground">
            {visible ? `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "****"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {visible ? `${"\u2248"} ${(totalValue / (safeFindPrice(allPrices, "BTC")?.price || 96000)).toFixed(8)} BTC` : "****"}
          </p>

          <div className="mt-5 flex items-center gap-2">
            <Link href="/wallet" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
              <Download className="h-4 w-4" /> Deposit
            </Link>
            <Link href="/wallet" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground">
              <Upload className="h-4 w-4" /> Withdraw
            </Link>
            <Link href="/convert" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground">
              <RefreshCw className="h-4 w-4" /> Convert
            </Link>
          </div>
        </div>

        {/* Account Tabs */}
        <div className="border-b border-border px-4 lg:mx-auto lg:max-w-[1200px] lg:px-8">
          <div className="scrollbar-none flex items-center gap-0 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`shrink-0 px-4 py-3 text-sm font-medium capitalize transition-colors ${activeTab === t ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground"}`}
              >
                {t === "overview" ? "Overview" : t === "spot" ? "Spot Account" : t === "funding" ? "Funding Account" : "Earn Account"}
              </button>
            ))}
          </div>
        </div>

        {/* Asset List */}
        <div className="px-4 py-4 lg:mx-auto lg:max-w-[1200px] lg:px-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-border accent-primary" />
                Hide small balances
              </label>
            </div>
            <button className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" /> Sort
            </button>
          </div>

          {/* Table header */}
          <div className="hidden grid-cols-6 gap-4 border-b border-border pb-2 lg:grid">
            <span className="text-xs text-muted-foreground">Asset</span>
            <span className="text-right text-xs text-muted-foreground">Total</span>
            <span className="text-right text-xs text-muted-foreground">Available</span>
            <span className="text-right text-xs text-muted-foreground">In Orders</span>
            <span className="text-right text-xs text-muted-foreground">USD Value</span>
            <span className="text-right text-xs text-muted-foreground">Actions</span>
          </div>

          {balances.filter((b: any) => Number(b.available) > 0 || Number(b.in_order) > 0).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/40">
                <Wallet className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">No assets found</p>
              <Link href="/wallet" className="mt-3 flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Plus className="h-4 w-4" /> Deposit
              </Link>
            </div>
          ) : (
            <div className="flex flex-col">
              {balances.filter((b: any) => Number(b.available) > 0 || Number(b.in_order) > 0).map((b: any) => {
                const price = b.asset === "USDT" ? 1 : (safeFindPrice(allPrices, b.asset)?.price ?? 0)
                const total = Number(b.available) + Number(b.in_order)
                const usdVal = total * price
                return (
                  <div key={b.asset} className="flex items-center justify-between border-b border-border/50 py-3 lg:grid lg:grid-cols-6 lg:gap-4">
                    <div className="flex items-center gap-2.5">
                      <MarketAsset symbol={b.asset} size={32} />
                      <div>
                        <span className="text-sm font-semibold text-foreground">{b.asset}</span>
                        <span className="block text-[10px] text-muted-foreground">{b.asset === "USDT" ? "Tether" : b.asset === "BTC" ? "Bitcoin" : b.asset === "ETH" ? "Ethereum" : b.asset}</span>
                      </div>
                    </div>
                    <div className="hidden text-right lg:block">
                      <span className="font-mono text-xs text-foreground">{visible ? total.toFixed(6) : "****"}</span>
                    </div>
                    <div className="hidden text-right lg:block">
                      <span className="font-mono text-xs text-foreground">{visible ? Number(b.available).toFixed(6) : "****"}</span>
                    </div>
                    <div className="hidden text-right lg:block">
                      <span className="font-mono text-xs text-foreground">{visible ? Number(b.in_order).toFixed(6) : "****"}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-semibold text-foreground lg:text-xs">{visible ? `$${usdVal.toFixed(2)}` : "****"}</span>
                      <span className="block text-[10px] text-muted-foreground lg:hidden">{visible ? `${total.toFixed(6)} ${b.asset}` : "****"}</span>
                    </div>
                    <div className="hidden items-center justify-end gap-2 lg:flex">
                      <Link href="/wallet" className="text-xs text-primary hover:underline">Deposit</Link>
                      <Link href="/wallet" className="text-xs text-primary hover:underline">Withdraw</Link>
                      <Link href="/trade" className="text-xs text-primary hover:underline">Trade</Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <div className="hidden lg:block"><Footer /></div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        {bottomNav.map((n) => (
          <Link key={n.label} href={n.href} className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 ${n.active ? "text-foreground" : "text-muted-foreground"}`}>
            <n.icon className="h-5 w-5" />
            <span className="text-[10px]">{n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
