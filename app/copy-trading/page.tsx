"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  ArrowRight, Users, TrendingUp, Shield, BarChart3,
  Star, Copy, ChevronDown, Filter, Search, Award,
  Zap, Target, BadgeCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const masterTraders: { name: string; roi: string; pnl: string; followers: number; winRate: string; aum: string; days: number; trades: number; avatar: string }[] = []

const sortOptions = ["ROI", "PnL", "Followers", "Win Rate", "AUM"]

const steps = [
  { step: "01", title: "Choose a Master Trader", desc: "Verified trader profiles are unavailable until a performance data source is connected." },
  { step: "02", title: "Set Your Budget", desc: "Copy budgets and copy-specific risk controls are not configured yet." },
  { step: "03", title: "Auto-Copy Trades", desc: "Automatic copy execution is not connected, so trades are not copied by this page." },
]

const features = [
  { icon: Target, title: "Smart Copy", desc: "Copy sizing and allocation calculations are not configured." },
  { icon: Shield, title: "Risk Management", desc: "Copy-specific loss limits, position caps, and stop-copy controls are not configured." },
  { icon: BarChart3, title: "Transparent Stats", desc: "Verified trading history and performance metrics are not connected." },
  { icon: Zap, title: "Real-Time Execution", desc: "A verified copy-execution engine is not connected." },
]

export default function CopyTradingPage() {
  const [sortBy, setSortBy] = useState("ROI")
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState("90D")

  const filtered = search
    ? masterTraders.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : masterTraders

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1400px] px-4 py-12 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
                <Users className="h-4 w-4" /> Feature preview
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                Copy Top Traders Automatically
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Explore the copy-trading experience. Live trader data, copy execution, and risk controls are not connected in this project yet.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/support">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Ask about availability <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-amber-500/20 bg-amber-500/5">
          <div className="mx-auto max-w-[1400px] px-4 py-6">
            <p role="status" className="text-center text-sm leading-6 text-muted-foreground">
              No live trader performance data is available. The app will not show invented ROI, profit, win-rate, or follower statistics, and copying trades is not enabled.
            </p>
          </div>
        </section>

        {/* Master Traders Grid */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-2xl font-bold text-foreground">Top Master Traders</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search traders..."
                    className="rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" />
                </div>
                <div className="flex items-center gap-1">
                  {["7D", "30D", "90D", "All"].map((p) => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium ${period === p ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filtered.length === 0 && (
              <div role="status" className="mb-4 rounded-xl border border-border bg-card p-6 text-center sm:p-10">
                <BarChart3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">No verified master traders available</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Connect a verified trader-performance source and a real copy-execution engine before offering live copy trading.</p>
                <Link href="/support" className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-secondary">Contact support</Link>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {filtered.map((trader) => (
                <div key={trader.name} className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-sm font-bold text-primary">
                      {trader.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-foreground">{trader.name}</span>
                        <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{trader.days} days | {trader.trades} trades</span>
                    </div>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" /> {trader.followers.toLocaleString()}
                    </span>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-muted-foreground">ROI</div>
                      <div className="font-mono text-lg font-bold text-success">{trader.roi}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">PnL</div>
                      <div className="font-mono text-sm font-semibold text-foreground">{trader.pnl}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">Win Rate</div>
                      <div className="font-mono text-sm text-foreground">{trader.winRate}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">AUM</div>
                      <div className="font-mono text-sm text-foreground">{trader.aum}</div>
                    </div>
                  </div>

                  {/* Mini performance bar */}
                  <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-success" style={{ width: trader.winRate }} />
                  </div>

                  <Link href="/register">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                      <Copy className="mr-2 h-3.5 w-3.5" /> Copy
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-12">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">How Copy Trading Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.step} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 font-mono text-4xl font-bold text-primary/20">{s.step}</div>
                  <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section>
          <div className="mx-auto max-w-[1400px] px-4 py-12">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
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
