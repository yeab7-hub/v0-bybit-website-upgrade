import { Shield, Zap, BarChart3, Wallet, Users, Lock } from "lucide-react"

const features = [
  { icon: Zap, title: "100K+ TPS", desc: "Matching engine processes 100,000 transactions per second with sub-millisecond latency." },
  { icon: Shield, title: "Bank-Grade Security", desc: "Multi-sig cold wallets, real-time risk monitoring, and full proof-of-reserves audits." },
  { icon: BarChart3, title: "Advanced Charts", desc: "Professional TradingView charts with 100+ technical indicators and drawing tools." },
  { icon: Wallet, title: "Unified Account", desc: "Single wallet for spot, derivatives, and earn. Zero internal transfer fees." },
  { icon: Users, title: "20M+ Traders", desc: "Join a global community of over 20 million users across 160+ countries." },
  { icon: Lock, title: "24/7 Protection", desc: "Hardware key support, biometrics, anti-phishing codes, and withdrawal whitelists." },
]

export function FeaturesSection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1400px] px-4 py-16 lg:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">Why Trade With Us</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Infrastructure built for performance, security, and reliability at every scale.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
