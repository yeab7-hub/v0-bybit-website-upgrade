import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Shield, Globe, Zap, Users, TrendingUp, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const stats = [
  { label: "Registered Users", value: "10M+" },
  { label: "Daily Volume", value: "$4.2B" },
  { label: "Countries", value: "170+" },
  { label: "Supported Assets", value: "200+" },
]

const values = [
  { icon: Shield, title: "Security First", desc: "Multi-layer security architecture with cold storage, multi-sig wallets, and 24/7 monitoring to protect your assets." },
  { icon: Zap, title: "Lightning Fast", desc: "Matching engine capable of processing 100,000+ orders per second with sub-millisecond latency." },
  { icon: Globe, title: "Global Access", desc: "Available in 170+ countries with local currency support, multi-language platform, and 24/7 customer service." },
  { icon: Users, title: "Community Driven", desc: "Built with input from our community of traders. Your feedback shapes our product roadmap and priorities." },
  { icon: TrendingUp, title: "Deep Liquidity", desc: "Access deep order books across 200+ trading pairs with tight spreads and minimal slippage." },
  { icon: Lock, title: "Compliance", desc: "Fully licensed and regulated. We maintain the highest standards of regulatory compliance worldwide." },
]

const timeline = [
  { year: "2023", title: "Founded", desc: "Tryd was founded with a mission to make crypto trading accessible to everyone." },
  { year: "2024", title: "Global Expansion", desc: "Expanded to 100+ countries, launched derivatives trading, and reached 1M users." },
  { year: "2025", title: "Institutional Grade", desc: "Launched OTC desk, institutional custody, and crossed $1B daily trading volume." },
  { year: "2026", title: "Next Generation", desc: "Introduced AI-powered trading tools, copy trading, and advanced financial products." },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                About Tryd
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                We are building the most trusted and advanced cryptocurrency exchange
                for traders worldwide. Our mission is to make digital asset trading
                accessible, secure, and efficient for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-mono text-4xl font-bold text-primary">{s.value}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-foreground">Our Values</h2>
              <p className="mt-2 text-muted-foreground">The principles that guide everything we build</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {values.map((v) => (
                <div key={v.title} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <v.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-foreground">Our Journey</h2>
            </div>
            <div className="mx-auto max-w-2xl space-y-8">
              {timeline.map((t, i) => (
                <div key={t.year} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-mono text-sm font-bold text-primary">
                      {t.year.slice(2)}
                    </div>
                    {i < timeline.length - 1 && <div className="flex-1 w-px bg-border mt-2" />}
                  </div>
                  <div className="pb-8">
                    <div className="text-xs font-medium text-primary">{t.year}</div>
                    <h3 className="mt-1 text-lg font-bold text-foreground">{t.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <div className="rounded-2xl border border-border bg-card p-10 text-center lg:p-16">
              <h2 className="text-3xl font-bold text-foreground">Join the Future of Trading</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Start trading on the platform trusted by millions of users worldwide.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/trade">
                  <Button size="lg" variant="outline">Start Trading</Button>
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
