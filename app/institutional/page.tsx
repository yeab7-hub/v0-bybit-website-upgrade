"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Shield, Zap, BarChart3, Users, Lock, Globe, Server, HeadphonesIcon, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const features = [
  { icon: Zap, title: "Ultra-Low Latency", desc: "Institutional matching infrastructure and execution latency are not configured or independently measured." },
  { icon: BarChart3, title: "Deep Liquidity", desc: "Aggregated institutional liquidity feeds are not connected." },
  { icon: Shield, title: "Enterprise Security", desc: "Custody arrangements, certifications, and dedicated institutional security operations are not verified here." },
  { icon: Lock, title: "Segregated Accounts", desc: "Segregated accounts and audited proof-of-reserves reporting are not implemented in this application." },
  { icon: Server, title: "Dedicated Infrastructure", desc: "Institutional API endpoints, custom rate limits, and dedicated matching engines are not configured." },
  { icon: HeadphonesIcon, title: "24/7 VIP Support", desc: "Institutional account management and service-level commitments are not configured." },
]

const solutions = [
  { title: "OTC Trading", desc: "OTC liquidity, broker execution, and settlement are not connected.", benefits: ["Liquidity provider not configured", "Spreads not verified", "Settlement terms not configured", "Supported assets not verified"] },
  { title: "Sub-Account Management", desc: "Institutional sub-account creation and risk segregation are not configured.", benefits: ["Sub-account limits not configured", "Risk limits not configured", "Collateral rules not configured", "Reporting integration not configured"] },
  { title: "Custody Solutions", desc: "Institutional custody, MPC key management, and insurance integrations are not configured.", benefits: ["Custody provider required", "Insurance provider required", "Not verified", "Certification not verified"] },
  { title: "API Trading Suite", desc: "A secure institutional API gateway, FIX protocol, and dedicated connectivity are not configured.", benefits: ["API gateway not configured", "FIX not configured", "Co-location not verified", "Uptime not measured"] },
]

const stats = [
  { value: "Not connected", label: "Daily volume" },
  { value: "Not verified", label: "Global users" },
  { value: "Not measured", label: "System uptime" },
  { value: "Provider-dependent", label: "Available instruments" },
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
              <h1 className="mt-3 text-3xl font-bold tracking-tight lg:text-5xl">Institutional Services Integration Status</h1>
              <p className="mt-4 text-sm text-muted-foreground lg:text-base">Institutional trading, custody, liquidity, and support integrations are not configured. This page does not offer institutional services yet.</p>
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
            <h2 className="mb-8 text-center text-xl font-bold">Institutional Capability Status</h2>
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
