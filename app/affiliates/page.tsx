"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DollarSign, Users, BarChart3, Gift, ChevronRight, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const tiers = [
  { name: "Bronze", commission: "Not configured", volume: "Not configured", color: "from-amber-700/20 to-amber-900/20" },
  { name: "Silver", commission: "Not configured", volume: "Not configured", color: "from-gray-400/20 to-gray-600/20" },
  { name: "Gold", commission: "Not configured", volume: "Not configured", color: "from-yellow-500/20 to-amber-500/20" },
  { name: "VIP", commission: "Not configured", volume: "Not configured", color: "from-primary/20 to-amber-400/20" },
]

const benefits = [
  { icon: DollarSign, title: "Commission ledger unavailable", desc: "Referral commissions are not calculated or paid by this app yet." },
  { icon: Users, title: "Referral tracking unavailable", desc: "Referral attribution and tracking are not connected." },
  { icon: BarChart3, title: "Analytics unavailable", desc: "No affiliate analytics source is connected." },
  { icon: Gift, title: "Promotions unavailable", desc: "Affiliate promotions and bonus accounting are not configured." },
]

const steps = [
  { step: "1", title: "Apply", desc: "Submit your application with your platform or audience details." },
  { step: "2", title: "Get Approved", desc: "Application review and approval timing are not configured." },
  { step: "3", title: "Share Your Link", desc: "Referral link generation is not available yet." },
  { step: "4", title: "Earn Commissions", desc: "Commission calculation and payouts are not connected." },
]

const faqs = [
  { q: "Who can become an affiliate?", a: "Eligibility rules have not been configured for this platform." },
  { q: "How are commissions calculated?", a: "Commission calculation is not configured or available." },
  { q: "When do I get paid?", a: "No affiliate payout schedule or settlement integration is configured." },
  { q: "Is there a minimum payout?", a: "Minimum payout rules are not configured." },
]

export default function AffiliatesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-12 text-center lg:py-20">
            <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">Affiliate Program</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground lg:text-base">Affiliate tracking, commission rates, analytics, and payouts are not connected. No commission offer is currently available.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button disabled title="Affiliate application workflow is not configured" className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground opacity-60">Applications unavailable</Button>
              <Link href="/login"><Button variant="outline" className="h-11 rounded-lg border-border px-6 text-sm font-semibold">Log In</Button></Link>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 px-4 py-10 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">{b.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Commission Tiers */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-14">
            <h2 className="mb-8 text-center text-xl font-bold">Commission Tiers</h2>
            <div className="grid gap-4 md:grid-cols-4">
              {tiers.map((t) => (
                <div key={t.name} className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className={`bg-gradient-to-br ${t.color} p-4 text-center`}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{t.name}</span>
                  </div>
                  <div className="p-5 text-center">
                    <div className="text-3xl font-bold text-primary">{t.commission}</div>
                    <p className="mt-1 text-xs text-muted-foreground">Commission Rate</p>
                    <div className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">
                      Volume: {t.volume}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-14">
            <h2 className="mb-8 text-center text-xl font-bold">How It Works</h2>
            <div className="grid gap-4 md:grid-cols-4">
              {steps.map((s) => (
                <div key={s.step} className="rounded-xl border border-border bg-card p-5 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{s.step}</div>
                  <h3 className="text-sm font-semibold">{s.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="mx-auto max-w-[800px] px-4 py-10 lg:py-14">
            <h2 className="mb-8 text-center text-xl font-bold">Frequently Asked Questions</h2>
            <div className="flex flex-col gap-3">
              {faqs.map((f) => (
                <div key={f.q} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold">{f.q}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{f.a}</p>
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
