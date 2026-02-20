"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Shield, Zap, BarChart3, Users, Lock, Globe, Server, HeadphonesIcon, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const features = [
  { icon: Zap, title: "Ultra-Low Latency", desc: "Co-located servers with sub-millisecond execution for high-frequency strategies." },
  { icon: BarChart3, title: "Deep Liquidity", desc: "Access aggregated order books with institutional-grade depth across all markets." },
  { icon: Shield, title: "Enterprise Security", desc: "Multi-signature cold storage, SOC 2 compliance, and dedicated security team." },
  { icon: Lock, title: "Segregated Accounts", desc: "Fully segregated client funds with proof of reserves published monthly." },
  { icon: Server, title: "Dedicated Infrastructure", desc: "Private API endpoints, custom rate limits, and dedicated matching engines." },
  { icon: HeadphonesIcon, title: "24/7 VIP Support", desc: "Dedicated account manager and priority support with direct escalation." },
]

const solutions = [
  { title: "OTC Trading", desc: "Execute large block trades with minimal market impact through our OTC desk. Competitive pricing and instant settlement.", benefits: ["$100K+ minimum", "Competitive spreads", "T+0 settlement", "150+ tokens"] },
  { title: "Sub-Account Management", desc: "Manage multiple strategies and portfolios with sub-accounts, each with independent risk parameters.", benefits: ["Up to 50 sub-accounts", "Individual risk limits", "Cross-collateral", "Unified reporting"] },
  { title: "Custody Solutions", desc: "Institutional-grade custody with multi-party computation (MPC) technology and insurance coverage.", benefits: ["MPC technology", "Insurance coverage", "$500M+ secured", "SOC 2 Type II"] },
  { title: "API Trading Suite", desc: "Enterprise APIs with WebSocket feeds, FIX protocol support, and dedicated connectivity options.", benefits: ["REST & WebSocket", "FIX protocol", "Co-location available", "99.99% uptime"] },
]

const stats = [
  { value: "$50B+", label: "Daily Volume" },
  { value: "40M+", label: "Global Users" },
  { value: "99.99%", label: "System Uptime" },
  { value: "500+", label: "Trading Pairs" },
]

export default function InstitutionalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-12 lg:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Institutional Services</span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight lg:text-5xl">Built for Institutional-Grade Trading</h1>
              <p className="mt-4 text-sm text-muted-foreground lg:text-base">Deep liquidity, advanced infrastructure, and dedicated support tailored for funds, market makers, and professional traders.</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/register"><Button className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground">Get Started <ArrowRight className="ml-1.5 h-4 w-4" /></Button></Link>
                <Link href="/support"><Button variant="outline" className="h-11 rounded-lg border-border px-6 text-sm font-semibold">Contact Sales</Button></Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-primary lg:text-3xl">{s.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-14">
            <h2 className="mb-8 text-center text-xl font-bold">Why Institutions Choose Bybit</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">{f.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions */}
        <section>
          <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-14">
            <h2 className="mb-8 text-center text-xl font-bold">Tailored Solutions</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {solutions.map((s) => (
                <div key={s.title} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-base font-bold">{s.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{s.desc}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {s.benefits.map((b) => (
                      <div key={b} className="flex items-center gap-1.5 text-xs text-secondary-foreground">
                        <Check className="h-3 w-3 text-primary" /> {b}
                      </div>
                    ))}
                  </div>
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
