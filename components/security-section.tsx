import { ShieldCheck, Lock, Eye, Server, FileKey, AlertTriangle } from "lucide-react"

const items = [
  { icon: ShieldCheck, title: "Proof of Reserves", desc: "1:1 backed and verified by independent third-party auditors." },
  { icon: Lock, title: "Cold Storage", desc: "95% of assets in multi-signature cold wallets with HSM protection." },
  { icon: Eye, title: "Real-Time Monitoring", desc: "AI-powered risk engine monitors every transaction 24/7." },
  { icon: Server, title: "Enterprise Infra", desc: "Distributed data centers with DDoS protection and 99.99% uptime." },
  { icon: FileKey, title: "Compliance", desc: "Licensed across multiple jurisdictions with full KYC/AML." },
  { icon: AlertTriangle, title: "Insurance Fund", desc: "Dedicated fund to protect user assets against potential breaches." },
]

const stats = [
  { value: "$12B+", label: "Assets Protected" },
  { value: "47", label: "Security Audits" },
  { value: "99.99%", label: "Uptime" },
  { value: "$4.2M", label: "Bug Bounties Paid" },
]

export function SecuritySection() {
  return (
    <section className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-[1400px] px-4 py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Shield + Stats */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-secondary/30 p-4 text-center">
                  <div className="font-mono text-lg font-bold text-foreground">{s.value}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-primary">Security</span>
            <h2 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">Your Assets, Fully Protected</h2>
            <p className="mt-2 text-sm text-muted-foreground">Industry-leading security infrastructure engineered to keep every layer of your funds safe.</p>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {items.map((f) => (
                <div key={f.title} className="rounded-lg border border-border bg-card p-3">
                  <f.icon className="mb-1.5 h-4 w-4 text-primary" />
                  <h3 className="text-xs font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
