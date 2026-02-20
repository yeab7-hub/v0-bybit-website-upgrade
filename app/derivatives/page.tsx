"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLivePrices, formatPrice, formatVolume } from "@/hooks/use-live-prices"
import { MarketAsset } from "@/components/market-asset"
import {
  ArrowRight, Shield, Zap, BarChart3, TrendingUp, Clock,
  Target, Layers, ChevronRight, Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type DerivType = "usdt-perp" | "inverse-perp" | "usdc-perp" | "futures"

const derivTypes: { id: DerivType; label: string; desc: string }[] = [
  { id: "usdt-perp", label: "USDT Perpetual", desc: "Settled in USDT" },
  { id: "inverse-perp", label: "Inverse Perpetual", desc: "Settled in coin" },
  { id: "usdc-perp", label: "USDC Perpetual", desc: "Settled in USDC" },
  { id: "futures", label: "Futures", desc: "Expiry contracts" },
]

const features = [
  { icon: Zap, title: "Up to 100x Leverage", desc: "Amplify your trading with industry-leading leverage across all major pairs." },
  { icon: Shield, title: "Insurance Fund", desc: "Our insurance fund protects traders from socialized losses during extreme volatility." },
  { icon: BarChart3, title: "Advanced Order Types", desc: "Stop-limit, trailing stop, take profit/stop loss, and conditional orders." },
  { icon: Target, title: "Mark Price System", desc: "Fair price marking prevents unnecessary liquidations from price manipulation." },
  { icon: Clock, title: "Funding Rate", desc: "Transparent funding rates updated every 8 hours to keep perpetual prices aligned." },
  { icon: Layers, title: "Cross & Isolated Margin", desc: "Choose between cross margin for flexibility or isolated margin for risk control." },
]

export default function DerivativesPage() {
  const { crypto } = useLivePrices(5000)
  const [activeType, setActiveType] = useState<DerivType>("usdt-perp")

  const topContracts = useMemo(() => {
    return [...crypto]
      .sort((a, b) => (b.volume * b.price) - (a.volume * a.price))
      .slice(0, 15)
      .map((c) => ({
        ...c,
        leverage: c.symbol === "BTC" ? "100x" : c.symbol === "ETH" ? "100x" : "50x",
        fundingRate: (Math.random() * 0.02 - 0.005).toFixed(4),
        openInterest: formatVolume(c.volume * c.price * 0.3),
      }))
  }, [crypto])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1400px] px-4 py-12 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
                <TrendingUp className="h-4 w-4" /> Up to 100x Leverage
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                Crypto Derivatives Trading
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Trade perpetual and futures contracts on 200+ trading pairs with deep liquidity,
                advanced order types, and institutional-grade risk management tools.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/trade">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Start Trading <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline">Create Account</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-8">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {[
                { label: "24h Trading Volume", value: "$8.6B" },
                { label: "Open Interest", value: "$3.2B" },
                { label: "Trading Pairs", value: "200+" },
                { label: "Max Leverage", value: "100x" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-mono text-3xl font-bold text-primary">{s.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contract Types + Table */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-8">
            <div className="mb-6 flex items-center gap-2 overflow-x-auto">
              {derivTypes.map((dt) => (
                <button
                  key={dt.id}
                  onClick={() => setActiveType(dt.id)}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeType === dt.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {dt.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-card/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Contract</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Last Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">24h Change</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Funding Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Open Interest</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Leverage</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {topContracts.map((c) => (
                    <tr key={c.symbol} className="border-b border-border/50 transition-colors hover:bg-card/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MarketAsset symbol={c.symbol} size={24} />
                          <span className="text-sm font-semibold text-foreground">{c.symbol}USDT</span>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">Perp</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">${formatPrice(c.price)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono text-xs ${c.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                          {c.change24h >= 0 ? "+" : ""}{c.change24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">{c.fundingRate}%</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">${c.openInterest}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{c.leverage}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/trade?pair=${c.symbol}USDT`} className="text-xs font-medium text-primary hover:underline">
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

        {/* Features */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-12">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Why Trade Derivatives on Bybit</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-[1400px] px-4 py-12">
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <h2 className="text-3xl font-bold text-foreground">Ready to Trade Derivatives?</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Join millions of traders and access the most liquid derivatives market in crypto.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/register"><Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button></Link>
                <Link href="/trade"><Button size="lg" variant="outline">Go to Trading</Button></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
