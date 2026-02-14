"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import {
  Wallet, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, TrendingUp, TrendingDown,
  Shield, ShieldCheck, ShieldAlert, Eye, EyeOff, Activity, BarChart3,
  Clock, Gift, Bell, ChevronRight, CircleDot, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useLivePrices, formatPrice, formatVolume, type PriceData } from "@/hooks/use-live-prices"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getPriceForSymbol(crypto: PriceData[], symbol: string): number {
  if (symbol === "USDT" || symbol === "USDC") return 1
  return crypto.find((c) => c.symbol === symbol)?.price ?? 0
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string; full_name?: string; kyc_status?: string } | null>(null)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const { crypto, isLoading: priceLoading } = useLivePrices(5000)
  const { data: balData } = useSWR("/api/trade?type=balances", fetcher, { refreshInterval: 5000 })
  const { data: tradeData } = useSWR("/api/trade?type=trades", fetcher, { refreshInterval: 10000 })
  const { data: orderData } = useSWR("/api/trade?type=orders", fetcher, { refreshInterval: 5000 })

  const balances = balData?.balances ?? []
  const trades = tradeData?.trades ?? []
  const orders = orderData?.orders ?? []

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

  const btcPrice = getPriceForSymbol(crypto, "BTC")
  const totalBtc = btcPrice > 0 ? totalUsd / btcPrice : 0
  const totalPnl = trades.reduce((sum: number, t: { pnl: number }) => sum + Number(t.pnl), 0)
  const openOrderCount = orders.filter((o: { status: string }) => o.status === "open").length

  const topAssets = useMemo(() => {
    return balances
      .map((b: { asset: string; available: number; in_order: number }) => ({
        symbol: b.asset,
        total: Number(b.available) + Number(b.in_order),
        usdValue: (Number(b.available) + Number(b.in_order)) * getPriceForSymbol(crypto, b.asset),
        change: crypto.find((c) => c.symbol === b.asset)?.change24h ?? 0,
        price: getPriceForSymbol(crypto, b.asset),
      }))
      .sort((a: { usdValue: number }, b: { usdValue: number }) => b.usdValue - a.usdValue)
      .slice(0, 5)
  }, [balances, crypto])

  const kycIcon = user?.kyc_status === "approved" ? ShieldCheck : user?.kyc_status === "pending" ? Shield : ShieldAlert
  const kycColor = user?.kyc_status === "approved" ? "text-success" : user?.kyc_status === "pending" ? "text-chart-4" : "text-muted-foreground"
  const kycLabel = user?.kyc_status === "approved" ? "Verified" : user?.kyc_status === "pending" ? "Pending Review" : "Not Verified"
  const KycIcon = kycIcon

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {/* Welcome bar */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back{user?.full_name ? `, ${user.full_name}` : ""}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Here is your portfolio overview and market summary.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/kyc">
              <div className={`flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium ${kycColor}`}>
                <KycIcon className="h-4 w-4" />{kycLabel}
              </div>
            </Link>
            <button className="relative rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </div>

        {/* Portfolio summary */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
                <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-muted-foreground hover:text-foreground">
                  {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-mono text-4xl font-bold text-foreground">
                  {balanceVisible ? `$${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "********"}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="font-mono">{balanceVisible ? `${totalBtc.toFixed(8)} BTC` : "****"}</span>
                <span className={`flex items-center gap-1 font-mono text-xs font-medium ${totalPnl >= 0 ? "text-success" : "text-destructive"}`}>
                  {totalPnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {totalPnl >= 0 ? "+" : ""}${Math.abs(totalPnl).toFixed(2)} P&L
                </span>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <Link href="/wallet"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><ArrowDownLeft className="mr-1.5 h-3.5 w-3.5" />Deposit</Button></Link>
                <Link href="/wallet"><Button size="sm" variant="outline"><ArrowUpRight className="mr-1.5 h-3.5 w-3.5" />Withdraw</Button></Link>
                <Link href="/trade"><Button size="sm" variant="outline"><ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />Trade</Button></Link>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Open Orders", value: openOrderCount, icon: Clock, color: "text-primary" },
                { label: "Total Trades", value: trades.length, icon: Activity, color: "text-chart-4" },
                { label: "Assets Held", value: balances.filter((b: { available: number; in_order: number }) => Number(b.available) + Number(b.in_order) > 0).length, icon: BarChart3, color: "text-success" },
                { label: "Today P&L", value: `$${totalPnl.toFixed(0)}`, icon: Zap, color: totalPnl >= 0 ? "text-success" : "text-destructive" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-secondary/20 p-3">
                  <div className="flex items-center gap-1.5">
                    <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                    <span className="text-[10px] text-muted-foreground">{s.label}</span>
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-foreground">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: Assets + Recent trades */}
          <div className="space-y-6 lg:col-span-2">
            {/* Top assets */}
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="font-semibold text-foreground">Your Assets</h2>
                <Link href="/wallet" className="flex items-center gap-1 text-xs text-primary hover:underline">View All<ChevronRight className="h-3 w-3" /></Link>
              </div>
              <div className="divide-y divide-border">
                {priceLoading ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                    <div className="flex-1"><div className="h-4 w-16 animate-pulse rounded bg-secondary" /><div className="mt-1 h-3 w-24 animate-pulse rounded bg-secondary" /></div>
                    <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
                  </div>
                )) : topAssets.map((a: { symbol: string; total: number; usdValue: number; change: number; price: number }) => (
                  <div key={a.symbol} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-secondary/20">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">{a.symbol.charAt(0)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{a.symbol}</span>
                        <span className={`text-[10px] font-medium ${a.change >= 0 ? "text-success" : "text-destructive"}`}>{a.change >= 0 ? "+" : ""}{a.change.toFixed(2)}%</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {balanceVisible ? `${a.total.toLocaleString("en-US", { maximumFractionDigits: 6 })} @ $${formatPrice(a.price)}` : "****"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold text-foreground">{balanceVisible ? `$${a.usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "****"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent trades */}
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="font-semibold text-foreground">Recent Trades</h2>
                <Link href="/wallet" className="flex items-center gap-1 text-xs text-primary hover:underline">View All<ChevronRight className="h-3 w-3" /></Link>
              </div>
              {trades.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Activity className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No trades yet</p>
                  <Link href="/trade"><Button size="sm" variant="outline">Start Trading</Button></Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {trades.slice(0, 5).map((t: { id: string; created_at: string; pair: string; side: string; price: number; amount: number; pnl: number }) => (
                    <div key={t.id} className="flex items-center gap-4 px-4 py-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${t.side === "buy" ? "bg-success/10" : "bg-destructive/10"}`}>
                        {t.side === "buy" ? <ArrowDownLeft className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{t.pair}</span>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${t.side === "buy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{t.side}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm text-foreground">{Number(t.amount).toFixed(6)}</div>
                        <div className={`font-mono text-[10px] font-medium ${Number(t.pnl) >= 0 ? "text-success" : "text-destructive"}`}>
                          {Number(t.pnl) >= 0 ? "+" : ""}{Number(t.pnl).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column: Market movers + Quick actions */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-foreground">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Deposit", href: "/wallet", icon: ArrowDownLeft, color: "bg-primary/10 text-primary" },
                  { label: "Withdraw", href: "/wallet", icon: ArrowUpRight, color: "bg-destructive/10 text-destructive" },
                  { label: "Spot Trade", href: "/trade", icon: ArrowLeftRight, color: "bg-chart-4/10 text-chart-4" },
                  { label: "KYC", href: "/kyc", icon: Shield, color: "bg-success/10 text-success" },
                  { label: "Support", href: "/support", icon: Gift, color: "bg-chart-5/10 text-chart-5" },
                  { label: "Wallet", href: "/wallet", icon: Wallet, color: "bg-primary/10 text-primary" },
                ].map((action) => (
                  <Link key={action.label} href={action.href}
                    className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-secondary/30">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color}`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Market movers */}
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-semibold text-foreground">Market Movers</h3>
                <Link href="/trade" className="text-xs text-primary hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-border">
                {priceLoading ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="h-7 w-7 animate-pulse rounded-full bg-secondary" />
                    <div className="flex-1"><div className="h-3.5 w-12 animate-pulse rounded bg-secondary" /></div>
                    <div className="h-3.5 w-16 animate-pulse rounded bg-secondary" />
                  </div>
                )) : crypto.slice(0, 8).map((c) => (
                  <Link key={c.symbol} href="/trade" className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-secondary/20">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">{c.symbol.charAt(0)}</div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-foreground">{c.symbol}</div>
                      <div className="text-[9px] text-muted-foreground">Vol {formatVolume(c.volume)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-medium text-foreground">${formatPrice(c.price)}</div>
                      <div className={`font-mono text-[10px] ${c.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                        {c.change24h >= 0 ? "+" : ""}{c.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Open orders */}
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-semibold text-foreground">Open Orders</h3>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{openOrderCount}</div>
              </div>
              {openOrderCount === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <CircleDot className="h-6 w-6 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">No open orders</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {orders.filter((o: { status: string }) => o.status === "open").slice(0, 4).map((o: { id: string; pair: string; side: string; order_type: string; price: number; amount: number }) => (
                    <div key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${o.side === "buy" ? "bg-success" : "bg-destructive"}`} />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-foreground">{o.pair} <span className={`uppercase ${o.side === "buy" ? "text-success" : "text-destructive"}`}>{o.side}</span></div>
                        <div className="text-[9px] text-muted-foreground">{o.order_type} @ ${Number(o.price).toLocaleString()}</div>
                      </div>
                      <div className="font-mono text-xs text-foreground">{Number(o.amount).toFixed(6)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
