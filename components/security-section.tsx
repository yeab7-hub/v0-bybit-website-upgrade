"use client"

import {
  ShieldCheck,
  Lock,
  Eye,
  Server,
  FileKey,
  AlertTriangle,
} from "lucide-react"

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: "Proof of Reserves",
    description:
      "1:1 backed reserves verified by independent third-party auditors. View real-time reserve data anytime.",
  },
  {
    icon: Lock,
    title: "Cold Storage",
    description:
      "95% of all assets stored in multi-signature cold wallets with hardware security modules (HSM).",
  },
  {
    icon: Eye,
    title: "Real-Time Monitoring",
    description:
      "AI-powered risk detection system monitors every transaction for suspicious activity 24/7.",
  },
  {
    icon: Server,
    title: "Enterprise Infrastructure",
    description:
      "Distributed across multiple data centers with DDoS protection and 99.99% uptime SLA.",
  },
  {
    icon: FileKey,
    title: "Regulatory Compliance",
    description:
      "Licensed and regulated in multiple jurisdictions. Full KYC/AML compliance with leading identity providers.",
  },
  {
    icon: AlertTriangle,
    title: "Insurance Fund",
    description:
      "Dedicated insurance fund covering user assets against potential security breaches and system failures.",
  },
]

export function SecuritySection() {
  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Visual */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8">
              <div className="absolute left-0 top-0 h-48 w-48 rounded-full bg-primary/5 blur-[80px]" />

              <div className="relative">
                {/* Shield Graphic */}
                <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Assets Protected", value: "$12B+" },
                    { label: "Security Audits", value: "47" },
                    { label: "Uptime Record", value: "99.99%" },
                    { label: "Bug Bounty Paid", value: "$4.2M" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl border border-border bg-secondary/30 p-4 text-center"
                    >
                      <div className="text-xl font-bold text-foreground">
                        {m.value}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {m.label}
                      </div>
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
            <h2 className="mt-3 text-balance text-3xl font-bold text-foreground">
              Your Assets, Fully Protected
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We employ the most advanced security infrastructure in the
              industry. From multi-sig cold storage to real-time AI monitoring,
              every layer is engineered to keep your funds safe.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {securityFeatures.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-xl border border-border bg-card p-4 hover:border-primary/20"
                >
                  <f.icon className="mb-2 h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
