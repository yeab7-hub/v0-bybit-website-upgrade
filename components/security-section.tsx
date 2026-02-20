import {
  ShieldCheck,
  Lock,
  Eye,
  Server,
  FileKey,
  AlertTriangle,
} from "lucide-react"

const securityFeatures = [
  { icon: ShieldCheck, title: "Proof of Reserves", description: "1:1 backed reserves verified by independent third-party auditors." },
  { icon: Lock, title: "Cold Storage", description: "95% of all assets stored in multi-signature cold wallets with HSM." },
  { icon: Eye, title: "Real-Time Monitoring", description: "AI-powered risk detection monitors every transaction 24/7." },
  { icon: Server, title: "Enterprise Infrastructure", description: "Distributed data centers with DDoS protection and 99.99% uptime." },
  { icon: FileKey, title: "Regulatory Compliance", description: "Licensed in multiple jurisdictions with full KYC/AML compliance." },
  { icon: AlertTriangle, title: "Insurance Fund", description: "Dedicated fund covering user assets against potential breaches." },
]

export function SecuritySection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left: Metrics */}
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 lg:p-8">
              <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-primary/[0.04] blur-[80px]" />

              <div className="relative">
                {/* Shield icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Assets Protected", value: "$12B+" },
                    { label: "Security Audits", value: "47" },
                    { label: "Uptime Record", value: "99.99%" },
                    { label: "Bug Bounty Paid", value: "$4.2M" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl border border-border bg-secondary/20 p-4 text-center">
                      <div className="font-mono text-lg font-bold text-foreground">{m.value}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Security First
            </span>
            <h2 className="mt-2 text-balance text-2xl font-bold text-foreground md:text-3xl">
              Your Assets, Fully Protected
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We employ the most advanced security infrastructure in the industry. Every layer is engineered to keep your funds safe.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {securityFeatures.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/20"
                >
                  <f.icon className="mb-2 h-4 w-4 text-primary" />
                  <h3 className="text-xs font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
