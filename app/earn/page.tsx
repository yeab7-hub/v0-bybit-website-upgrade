"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import {
  TrendingUp, Shield, Clock, Lock, Percent, Zap, Star,
  ChevronRight, ArrowRight, BadgeCheck, Coins, Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketAsset } from "@/components/market-asset"

const products = [
  {
    name: "Flexible Savings",
    desc: "Earn interest on your idle assets with no lock-up period. Withdraw anytime.",
    apy: "1.5% - 8.2%",
    icon: Wallet,
    color: "text-primary bg-primary/10",
    features: ["No lock-up", "Daily payouts", "Withdraw anytime"],
    popular: false,
  },
  {
    name: "Fixed Savings",
    desc: "Higher yields with fixed terms. Lock your assets for 7, 14, 30, or 90 days.",
    apy: "4.0% - 18.5%",
    icon: Lock,
    color: "text-success bg-success/10",
    features: ["Higher APY", "7-90 day terms", "Auto-renew option"],
    popular: true,
  },
  {
    name: "Staking",
    desc: "Stake supported PoS tokens to earn network rewards and help secure blockchains.",
    apy: "3.0% - 22.0%",
    icon: Coins,
    color: "text-chart-4 bg-chart-4/10",
    features: ["Network rewards", "Flexible unstaking", "Auto-compound"],
    popular: false,
  },
  {
    name: "Liquidity Mining",
    desc: "Provide liquidity to trading pairs and earn a share of trading fees.",
    apy: "8.0% - 45.0%",
    icon: Zap,
    color: "text-chart-5 bg-chart-5/10",
    features: ["Fee sharing", "Bonus rewards", "Multiple pairs"],
    popular: false,
  },
]

const topAssets = [
  { coin: "BTC", name: "Bitcoin", flexApy: "1.5%", fixedApy: "4.2%", stakeApy: "-", tvl: "$2.8B" },
  { coin: "ETH", name: "Ethereum", flexApy: "2.8%", fixedApy: "5.5%", stakeApy: "3.8%", tvl: "$4.2B" },
  { coin: "USDT", name: "Tether", flexApy: "8.2%", fixedApy: "12.5%", stakeApy: "-", tvl: "$8.5B" },
  { coin: "SOL", name: "Solana", flexApy: "3.2%", fixedApy: "7.8%", stakeApy: "6.5%", tvl: "$1.2B" },
  { coin: "USDC", name: "USD Coin", flexApy: "7.8%", fixedApy: "11.2%", stakeApy: "-", tvl: "$5.1B" },
  { coin: "ADA", name: "Cardano", flexApy: "2.1%", fixedApy: "6.0%", stakeApy: "4.2%", tvl: "$320M" },
  { coin: "DOT", name: "Polkadot", flexApy: "4.5%", fixedApy: "9.8%", stakeApy: "12.5%", tvl: "$680M" },
  { coin: "AVAX", name: "Avalanche", flexApy: "3.8%", fixedApy: "8.2%", stakeApy: "8.0%", tvl: "$450M" },
]

const stats = [
  { label: "Total Value Locked", value: "$23.4B", icon: Lock },
  { label: "Active Earners", value: "2.1M+", icon: Star },
  { label: "Avg. APY", value: "8.5%", icon: Percent },
  { label: "Payouts Distributed", value: "$890M+", icon: TrendingUp },
]

export default function EarnPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
                <Percent className="h-4 w-4" /> Up to 45% APY
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                Earn Passive Income on Your Crypto
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Put your idle assets to work. Earn competitive yields through flexible savings,
                fixed-term deposits, staking, and liquidity mining.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Start Earning <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-foreground">Earning Products</h2>
              <p className="mt-2 text-muted-foreground">Choose the product that suits your strategy</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <div key={p.name} className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30">
                  {p.popular && (
                    <div className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      POPULAR
                    </div>
                  )}
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${p.color}`}>
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{p.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                  <div className="mt-4 rounded-lg bg-secondary/30 p-3">
                    <span className="text-[10px] text-muted-foreground">Estimated APY</span>
                    <div className="font-mono text-xl font-bold text-success">{p.apy}</div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BadgeCheck className="h-3.5 w-3.5 text-success" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="mt-5 w-full" variant="outline" size="sm">
                      Start Earning <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Asset table */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-foreground">Supported Assets</h2>
              <p className="mt-2 text-muted-foreground">Compare yields across all earning products</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground">Asset</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground">Flexible APY</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground">Fixed APY</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground">Staking APY</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground">TVL</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAssets.map((a) => (
                      <tr key={a.coin} className="border-b border-border last:border-0 hover:bg-secondary/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <MarketAsset symbol={a.coin} size={32} />
                            <div>
                              <div className="text-sm font-semibold text-foreground">{a.coin}</div>
                              <div className="text-[10px] text-muted-foreground">{a.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-success">{a.flexApy}</td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-success">{a.fixedApy}</td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">{a.stakeApy}</td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-foreground">{a.tvl}</td>
                        <td className="px-6 py-4 text-right">
                          <Link href="/register">
                            <Button size="sm" variant="outline" className="text-xs">Subscribe</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <div className="flex flex-col items-center gap-10 lg:flex-row">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-foreground">Your Assets, Protected</h2>
                <p className="mt-3 text-muted-foreground">
                  We implement institutional-grade security to protect your investments at every level.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    { icon: Shield, title: "Insurance Fund", desc: "Assets are backed by our reserve insurance fund for unexpected events." },
                    { icon: Lock, title: "Multi-Sig Custody", desc: "Cold storage with multi-signature authorization for maximum security." },
                    { icon: Clock, title: "Real-Time Monitoring", desc: "24/7 risk monitoring with automated circuit breakers and alerts." },
                  ].map((f) => (
                    <div key={f.title} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <f.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{f.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-2 border-dashed border-primary/20">
                  <div className="flex h-40 w-40 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Shield className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
