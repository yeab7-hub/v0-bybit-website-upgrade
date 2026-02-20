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

const masterTraders = [
  { name: "CryptoAlpha", roi: "+342.5%", pnl: "$1.2M", followers: 8432, winRate: "78%", aum: "$4.2M", days: 180, trades: 1247, avatar: "CA" },
  { name: "BTCWhale", roi: "+256.8%", pnl: "$890K", followers: 6218, winRate: "72%", aum: "$3.1M", days: 365, trades: 2103, avatar: "BW" },
  { name: "DeFiKing", roi: "+198.3%", pnl: "$650K", followers: 5104, winRate: "68%", aum: "$2.8M", days: 270, trades: 1892, avatar: "DK" },
  { name: "ScalpMaster", roi: "+178.4%", pnl: "$540K", followers: 4329, winRate: "82%", aum: "$1.9M", days: 150, trades: 3421, avatar: "SM" },
  { name: "SwingTrader", roi: "+156.2%", pnl: "$420K", followers: 3875, winRate: "65%", aum: "$1.5M", days: 200, trades: 876, avatar: "ST" },
  { name: "AltHunter", roi: "+134.7%", pnl: "$380K", followers: 3102, winRate: "71%", aum: "$1.2M", days: 120, trades: 1543, avatar: "AH" },
  { name: "MomentumPro", roi: "+128.9%", pnl: "$310K", followers: 2894, winRate: "69%", aum: "$980K", days: 90, trades: 2210, avatar: "MP" },
  { name: "TrendFollower", roi: "+112.5%", pnl: "$270K", followers: 2456, winRate: "66%", aum: "$750K", days: 240, trades: 654, avatar: "TF" },
]

const sortOptions = ["ROI", "PnL", "Followers", "Win Rate", "AUM"]

const steps = [
  { step: "01", title: "Choose a Master Trader", desc: "Browse our curated list of top-performing traders with transparent track records and verified statistics." },
  { step: "02", title: "Set Your Budget", desc: "Decide how much capital you want to allocate. Set risk limits and maximum position sizes to protect your funds." },
  { step: "03", title: "Auto-Copy Trades", desc: "Trades are automatically copied in real-time. Monitor performance and adjust settings anytime." },
]

const features = [
  { icon: Target, title: "Smart Copy", desc: "Proportional copy sizing based on your budget. Automatic adjustment for different account sizes." },
  { icon: Shield, title: "Risk Management", desc: "Set max loss limits, position caps, and stop-copy triggers. Full control over your exposure." },
  { icon: BarChart3, title: "Transparent Stats", desc: "Full trading history, win rate, drawdown, and ROI metrics for every master trader." },
  { icon: Zap, title: "Real-Time Execution", desc: "Sub-second trade copying with no delays. Your orders execute simultaneously with the master." },
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
                <Users className="h-4 w-4" /> 50,000+ Active Copiers
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                Copy Top Traders Automatically
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Follow expert traders and automatically mirror their positions in real-time.
                No experience required -- let the pros trade for you.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Start Copying <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline">Become a Master Trader</Button>
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
                { label: "Master Traders", value: "2,800+" },
                { label: "Active Copiers", value: "50,000+" },
                { label: "Total Copied Volume", value: "$12B+" },
                { label: "Avg. Copier ROI", value: "+45.8%" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-mono text-3xl font-bold text-primary">{s.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
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
