import {
  Shield,
  Zap,
  BarChart3,
  Wallet,
  Users,
  Lock,
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Execution",
    description: "Match engine processes 100,000+ orders per second with sub-millisecond latency.",
    stat: "100K+",
    statLabel: "Orders/sec",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Multi-sig cold wallets, real-time risk monitoring, and full proof-of-reserves.",
    stat: "$12B+",
    statLabel: "Protected",
  },
  {
    icon: BarChart3,
    title: "Advanced Trading Tools",
    description: "Professional charting with 100+ indicators and customizable workspace.",
    stat: "100+",
    statLabel: "Indicators",
  },
  {
    icon: Wallet,
    title: "Unified Wallet",
    description: "Single wallet for spot, derivatives, and earn products. Transfer funds instantly.",
    stat: "0",
    statLabel: "Transfer fees",
  },
  {
    icon: Users,
    title: "Copy Trading",
    description: "Follow elite traders and automatically mirror their positions in real time.",
    stat: "20M+",
    statLabel: "Users",
  },
  {
    icon: Lock,
    title: "2FA & Advanced Auth",
    description: "Hardware key support, biometric login, anti-phishing codes, and withdrawal whitelists.",
    stat: "24/7",
    statLabel: "Monitoring",
  },
]

export function FeaturesSection() {
  return (
    <section className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
            Built for Serious Traders
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Whether you are a beginner or a professional, we give you the tools and infrastructure to trade with confidence.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-foreground">{feature.stat}</div>
                  <div className="text-[10px] text-muted-foreground">{feature.statLabel}</div>
                </div>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
