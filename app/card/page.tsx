"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CreditCard, Shield, Globe, Zap, Percent, Gift, Check, ArrowRight, Wallet } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const features = [
  { icon: Globe, title: "Accepted Worldwide", desc: "Use your Bybit Card at 90M+ merchants across 200+ countries." },
  { icon: Percent, title: "Up to 10% Cashback", desc: "Earn crypto cashback on every purchase, deposited instantly." },
  { icon: Zap, title: "Instant Top-Up", desc: "Load your card from your Bybit wallet in seconds, zero fees." },
  { icon: Shield, title: "Advanced Security", desc: "Real-time fraud monitoring, instant freeze, and 3D Secure." },
  { icon: Gift, title: "Exclusive Perks", desc: "Airport lounge access, subscription benefits, and more." },
  { icon: Wallet, title: "Multi-Currency", desc: "Spend in BTC, ETH, USDT, or 50+ other cryptocurrencies." },
]

const tiers = [
  { name: "Standard", color: "from-zinc-600/30 to-zinc-800/30", cashback: "2%", fee: "Free", limit: "$10,000/mo", perks: ["Free ATM withdrawals (3x/mo)", "Virtual card instant issue", "Basic spending analytics"] },
  { name: "Premium", color: "from-primary/30 to-amber-600/30", cashback: "5%", fee: "$9.99/mo", limit: "$50,000/mo", perks: ["Unlimited ATM withdrawals", "Physical metal card", "Priority support", "Airport lounge (2x/yr)"] },
  { name: "Elite", color: "from-amber-400/30 to-yellow-600/30", cashback: "10%", fee: "$29.99/mo", limit: "Unlimited", perks: ["Everything in Premium", "Concierge service", "Unlimited lounge access", "Exclusive event invites", "Custom card design"] },
]

const steps = [
  { n: "1", title: "Sign Up", desc: "Create or log in to your Bybit account and complete verification." },
  { n: "2", title: "Choose Your Card", desc: "Select the card tier that matches your spending needs." },
  { n: "3", title: "Top Up & Spend", desc: "Load crypto from your wallet and start spending worldwide." },
]

export default function CardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-12 text-center lg:py-20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">Bybit Card</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground lg:text-base">Spend your crypto anywhere. Earn up to 10% cashback on every purchase with the Bybit Visa Card.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/register"><Button className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground">Get Your Card <ArrowRight className="ml-1.5 h-4 w-4" /></Button></Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-4 px-4 py-10 lg:grid-cols-3">
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
        </section>

        {/* Card Tiers */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-14">
            <h2 className="mb-8 text-center text-xl font-bold">Choose Your Card</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {tiers.map((t) => (
                <div key={t.name} className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className={`bg-gradient-to-br ${t.color} p-6 text-center`}>
                    <CreditCard className="mx-auto h-10 w-10 text-foreground" />
                    <h3 className="mt-2 text-lg font-bold">{t.name}</h3>
                  </div>
                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <div className="text-2xl font-bold text-primary">{t.cashback}</div>
                        <p className="text-[10px] text-muted-foreground">Cashback</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{t.fee}</div>
                        <p className="text-[10px] text-muted-foreground">Monthly</p>
                      </div>
                    </div>
                    <p className="mb-3 text-xs text-muted-foreground">Limit: {t.limit}</p>
                    <div className="flex flex-col gap-2">
                      {t.perks.map((p) => (
                        <div key={p} className="flex items-start gap-1.5 text-xs text-secondary-foreground">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> {p}
                        </div>
                      ))}
                    </div>
                    <Link href="/register">
                      <Button className="mt-4 w-full rounded-lg bg-primary text-xs font-semibold text-primary-foreground">Apply Now</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section>
          <div className="mx-auto max-w-[800px] px-4 py-10 lg:py-14">
            <h2 className="mb-8 text-center text-xl font-bold">How It Works</h2>
            <div className="flex flex-col gap-4">
              {steps.map((s) => (
                <div key={s.n} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{s.n}</div>
                  <div>
                    <h3 className="text-sm font-semibold">{s.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
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
