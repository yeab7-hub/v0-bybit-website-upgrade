"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import {
  ArrowRight, TrendingUp, Shield, Percent, Wallet, CreditCard,
  Building2, PiggyBank, BarChart3, BadgeCheck, Coins, Zap, Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const services = [
  {
    icon: CreditCard,
    title: "Crypto Loans",
    desc: "Borrow against your crypto assets without selling. Get instant liquidity with competitive interest rates starting from 2.9% APR.",
    stats: "From 2.9% APR",
    color: "text-primary bg-primary/10",
    features: ["No credit check", "Instant approval", "Flexible repayment"],
  },
  {
    icon: PiggyBank,
    title: "Dual Investment",
    desc: "Commit to buy low or sell high on a specific date. Earn enhanced yields regardless of the market direction.",
    stats: "Up to 200% APY",
    color: "text-success bg-success/10",
    features: ["Enhanced yield", "Buy low strategy", "Sell high strategy"],
  },
  {
    icon: BarChart3,
    title: "Structured Products",
    desc: "Access sophisticated financial instruments tailored for crypto markets. Principal-protected and yield-enhanced products available.",
    stats: "Capital protected",
    color: "text-chart-4 bg-chart-4/10",
    features: ["Principal protection", "Custom strategies", "Auto-execute"],
  },
  {
    icon: Coins,
    title: "Launchpool",
    desc: "Stake your tokens to farm new project tokens before they are listed. Early access to the most promising projects.",
    stats: "Free token farming",
    color: "text-chart-5 bg-chart-5/10",
    features: ["Zero cost", "Early access", "Stake & earn"],
  },
  {
    icon: Building2,
    title: "OTC Trading",
    desc: "Execute large trades privately without impacting the market. Dedicated account managers for institutions and high-net-worth individuals.",
    stats: "From $100K",
    color: "text-primary bg-primary/10",
    features: ["Deep liquidity", "Competitive pricing", "24/7 desk"],
  },
  {
    icon: Globe,
    title: "Crypto Card",
    desc: "Spend your crypto anywhere with the Bybit Visa card. Earn cashback on every purchase and manage everything from the app.",
    stats: "Up to 5% cashback",
    color: "text-success bg-success/10",
    features: ["Global acceptance", "Cashback rewards", "No annual fee"],
  },
]

const stats = [
  { label: "Assets Under Management", value: "$12.8B" },
  { label: "Active Financial Products", value: "45+" },
  { label: "Institutional Clients", value: "850+" },
  { label: "Countries Supported", value: "170+" },
]

export default function FinancePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
                <TrendingUp className="h-4 w-4" /> Institutional-Grade Finance
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                Crypto Financial Services
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Access a complete suite of financial products designed for the digital asset economy.
                From lending and borrowing to structured products and OTC trading.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/earn">
                  <Button size="lg" variant="outline">Explore Earn</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
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

        {/* Services Grid */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-foreground">Financial Products</h2>
              <p className="mt-2 text-muted-foreground">Everything you need to grow your portfolio</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <div key={s.title} className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  <div className="mt-4 inline-flex rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    {s.stats}
                  </div>
                  <ul className="mt-4 space-y-2">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BadgeCheck className="h-3.5 w-3.5 text-success" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <div className="rounded-2xl border border-border bg-card p-10 text-center lg:p-16">
              <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Trusted by Institutions Worldwide</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Our financial products are built with institutional-grade security, regulatory compliance,
                and transparent risk management. Assets are protected by multi-signature wallets,
                insurance coverage, and 24/7 monitoring.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Open Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
