"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  ArrowRight, Bot, Zap, Shield, BarChart3,
  TrendingUp, Settings, RefreshCw, Clock, Target,
  DollarSign, LineChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const bots = [
  {
    icon: BarChart3, title: "Grid Bot", desc: "Automatically buy low and sell high within a price range. Ideal for sideways markets.",
    stats: "Performance not available", tag: "Most Popular", color: "text-primary bg-primary/10",
    features: ["Set price range", "Auto grid orders", "Profit per grid"],
  },
  {
    icon: TrendingUp, title: "DCA Bot", desc: "Dollar-cost average into positions over time. Reduce the impact of volatility on your portfolio.",
    stats: "Execution not connected", tag: "Beginner Friendly", color: "text-success bg-success/10",
    features: ["Time-based entry", "Custom intervals", "Auto-reinvest"],
  },
  {
    icon: RefreshCw, title: "Arbitrage Bot", desc: "A strategy concept that seeks price differences across markets; it is not risk-free and is not executable in this app yet.",
    stats: "Execution not connected", tag: "Advanced", color: "text-chart-4 bg-chart-4/10",
    features: ["Cross-exchange", "Real-time detection", "Auto-execution"],
  },
  {
    icon: Target, title: "Smart Trade Bot", desc: "Advanced order types with trailing stop-loss and take-profit. Maximize gains, minimize losses.",
    stats: "Risk controls not connected", tag: "Pro Trader", color: "text-chart-5 bg-chart-5/10",
    features: ["Trailing stop", "Multiple targets", "Break-even stop"],
  },
  {
    icon: LineChart, title: "Futures Grid Bot", desc: "Grid trading with leverage on perpetual contracts. Amplify returns with controlled risk.",
    stats: "Leverage not enabled", tag: "High Yield", color: "text-primary bg-primary/10",
    features: ["Long/Short grid", "Leverage support", "Auto-deleverage"],
  },
  {
    icon: DollarSign, title: "Spot-Futures Arbitrage", desc: "Earn funding rates by hedging spot positions with futures. Market-neutral strategy.",
    stats: "Yield data not available", tag: "Stable Returns", color: "text-success bg-success/10",
    features: ["Delta neutral", "Funding yield", "Auto-rebalance"],
  },
]

const stats = [
  { label: "Bot execution", value: "Unavailable" },
  { label: "Live performance", value: "Not connected" },
  { label: "Exchange API", value: "Not configured" },
  { label: "Strategy concepts", value: "6" },
]

export default function TradingBotsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1400px] px-4 py-12 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
                <Bot className="h-4 w-4" /> Automated Trading
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                Trading Bots
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Explore strategy concepts. Automated execution, exchange connectivity, risk controls, and performance tracking are not connected yet; no bot can be created or run from this page.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button disabled title="Bot execution is not integrated" size="lg">
                  Bot creation unavailable
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-amber-500/20 bg-amber-500/5">
          <div className="mx-auto max-w-[1400px] px-4 py-3 text-center text-sm text-muted-foreground" role="status">
            Automated orders are not sent to an exchange from this app. No returns, APY, or bot performance are being promised.
          </div>
        </section>

        {/* Integration status, not fabricated live statistics */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-8">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-mono text-3xl font-bold text-primary">{s.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bots Grid */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-12">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Choose Your Strategy</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bots.map((bot) => (
                <div key={bot.title} className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30">
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bot.color}`}>
                      <bot.icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">{bot.tag}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{bot.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{bot.desc}</p>
                  <div className="mt-3 inline-flex rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    {bot.stats}
                  </div>
                  <ul className="mt-4 space-y-1.5">
                    {bot.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button disabled title="Bot execution is not integrated" className="mt-5 w-full" variant="outline" size="sm">
                    Bot unavailable
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section>
          <div className="mx-auto max-w-[1400px] px-4 py-12">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: "01", title: "Choose a Strategy", desc: "Pick from Grid, DCA, Arbitrage, or Smart Trade bots based on your goals and risk tolerance." },
                { step: "02", title: "Configure Parameters", desc: "Set your price range, investment amount, and risk parameters. Use AI-recommended settings for easy setup." },
                { step: "03", title: "Activate & Monitor", desc: "Start your bot and track performance in real-time. Adjust settings or stop anytime with full control." },
              ].map((s) => (
                <div key={s.step} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 font-mono text-4xl font-bold text-primary/20">{s.step}</div>
                  <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
