"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Copy,
  Bot,
  Coins,
  Layers,
  Rocket,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const products = [
  {
    id: "spot",
    icon: BarChart3,
    title: "Spot Trading",
    subtitle: "500+ trading pairs",
    description:
      "Trade major cryptocurrencies with deep liquidity and tight spreads. Advanced order types, TradingView charts, and sub-millisecond execution.",
    features: [
      "Market, Limit & Stop orders",
      "Advanced charting with 100+ indicators",
      "Real-time order book depth",
      "Instant settlement",
    ],
    cta: "Start Trading",
    href: "/trade",
  },
  {
    id: "derivatives",
    icon: Layers,
    title: "Derivatives",
    subtitle: "Up to 100x leverage",
    description:
      "Access perpetual and quarterly futures contracts with industry-leading liquidity. Hedge risk or amplify returns with powerful margin tools.",
    features: [
      "USDT & Coin-margined contracts",
      "Cross & isolated margin modes",
      "Advanced risk management",
      "Funding rate arbitrage tools",
    ],
    cta: "Trade Derivatives",
    href: "/trade",
  },
  {
    id: "copy",
    icon: Copy,
    title: "Copy Trading",
    subtitle: "Follow the best",
    description:
      "Automatically replicate the strategies of top-performing traders. Set your risk parameters and let the experts handle the rest.",
    features: [
      "Verified trader leaderboards",
      "Customizable copy ratios",
      "Real-time PnL tracking",
      "Smart risk controls",
    ],
    cta: "Explore Traders",
    href: "#",
  },
  {
    id: "bots",
    icon: Bot,
    title: "Trading Bots",
    subtitle: "Automate your strategy",
    description:
      "Deploy grid bots, DCA bots, and custom algorithmic strategies without writing a single line of code.",
    features: [
      "Grid, DCA & Smart Rebalance",
      "Backtesting engine",
      "No coding required",
      "24/7 automated execution",
    ],
    cta: "Create Bot",
    href: "#",
  },
  {
    id: "earn",
    icon: Coins,
    title: "Tryd Earn",
    subtitle: "Passive income",
    description:
      "Put your assets to work with flexible and fixed savings products, liquidity mining, and dual asset investments.",
    features: [
      "Flexible & fixed savings",
      "Liquidity mining pools",
      "Dual asset investments",
      "Auto-compounding rewards",
    ],
    cta: "Start Earning",
    href: "#",
  },
  {
    id: "launchpad",
    icon: Rocket,
    title: "Launchpad",
    subtitle: "Early access",
    description:
      "Get exclusive access to promising new crypto projects before they hit the market. Participate in token launches and airdrops.",
    features: [
      "Vetted project selection",
      "Fair distribution model",
      "Early-stage allocations",
      "Airdrop center",
    ],
    cta: "View Launches",
    href: "#",
  },
]

export function ProductsShowcase() {
  const [active, setActive] = useState("spot")
  const product = products.find((p) => p.id === active)!

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            One Platform, Every Product
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            From spot trading to derivatives, bots to passive income. Everything
            you need to build wealth in crypto.
          </p>
        </div>

        {/* Product Tabs */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                active === p.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <p.icon className="h-4 w-4" />
              {p.title}
            </button>
          ))}
        </div>

        {/* Product Detail */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <product.icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-primary">
                {product.subtitle}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-foreground md:text-3xl">
              {product.title}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {product.features.map((feat) => (
                <li key={feat} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <span className="text-sm text-foreground">{feat}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link href={product.href}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {product.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Panel */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 lg:p-8">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/5 blur-[80px]" />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-foreground">
                    BTC / USDT
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {product.title}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-foreground">
                    $97,432.50
                  </div>
                  <div className="font-mono text-xs text-success">+2.34%</div>
                </div>
              </div>

              {/* Simulated chart area */}
              <div className="mb-6 h-48 w-full overflow-hidden rounded-lg bg-secondary/50">
                <svg
                  viewBox="0 0 400 180"
                  className="h-full w-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(45, 100%, 51%)"
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(45, 100%, 51%)"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,140 C20,135 40,120 60,125 C80,130 100,110 120,100 C140,90 160,95 180,80 C200,65 220,70 240,55 C260,40 280,50 300,35 C320,20 340,30 360,25 C380,20 400,15 400,15 L400,180 L0,180 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M0,140 C20,135 40,120 60,125 C80,130 100,110 120,100 C140,90 160,95 180,80 C200,65 220,70 240,55 C260,40 280,50 300,35 C320,20 340,30 360,25 C380,20 400,15 400,15"
                    fill="none"
                    stroke="hsl(45, 100%, 51%)"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "24h High", value: "$98,210.00" },
                  { label: "24h Low", value: "$95,880.12" },
                  { label: "24h Volume", value: "$42.3B" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg bg-secondary/50 p-3 text-center"
                  >
                    <div className="text-xs text-muted-foreground">
                      {s.label}
                    </div>
                    <div className="mt-1 font-mono text-sm font-medium text-foreground">
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
