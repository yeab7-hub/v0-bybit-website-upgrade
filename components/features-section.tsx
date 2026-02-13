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
    description:
      "Match engine processes 100,000+ orders per second with sub-millisecond latency.",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description:
      "Multi-sig cold wallets, real-time risk monitoring, and full proof-of-reserves.",
  },
  {
    icon: BarChart3,
    title: "Advanced Trading Tools",
    description:
      "Professional charting, 100+ indicators, and customizable trading workspace.",
  },
  {
    icon: Wallet,
    title: "Unified Wallet",
    description:
      "Single wallet for spot, derivatives, and earn products. Transfer funds instantly.",
  },
  {
    icon: Users,
    title: "Copy Trading",
    description:
      "Follow elite traders and automatically mirror their positions in real time.",
  },
  {
    icon: Lock,
    title: "2FA & Advanced Auth",
    description:
      "Hardware key support, biometric login, anti-phishing codes, and withdrawal whitelists.",
  },
]

export function FeaturesSection() {
  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground">
            Built for Serious Traders
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Whether you are a beginner or a professional, Tryd gives you the
            tools and infrastructure to trade with confidence.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:bg-secondary/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
