"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Shield, Lock, Server, Eye, Key, Users, CheckCircle2, AlertTriangle, Fingerprint, Smartphone } from "lucide-react"

const pillars = [
  { icon: Lock, title: "Cold Storage", desc: "95% of all user assets are stored in multi-signature cold wallets across geographically distributed locations.", stat: "95%", statLabel: "Cold Storage" },
  { icon: Shield, title: "Proof of Reserves", desc: "We publish regular Proof of Reserves reports verified by independent third-party auditors.", stat: "1:1", statLabel: "Reserve Ratio" },
  { icon: Server, title: "Infrastructure Security", desc: "Multi-layered defense architecture with DDoS protection, WAF, and real-time intrusion detection.", stat: "99.99%", statLabel: "Uptime" },
  { icon: Eye, title: "24/7 Monitoring", desc: "Dedicated security operations center with real-time threat monitoring and incident response.", stat: "24/7", statLabel: "Monitoring" },
]

const protections = [
  { icon: Fingerprint, title: "Biometric Authentication", desc: "Support for fingerprint and face recognition on mobile devices." },
  { icon: Key, title: "Hardware Key Support", desc: "YubiKey and other FIDO2/WebAuthn hardware security keys supported." },
  { icon: Smartphone, title: "2FA Required", desc: "Two-factor authentication via Google Authenticator or SMS for all critical operations." },
  { icon: Users, title: "Anti-Phishing Code", desc: "Set a personal anti-phishing code that appears in all official Bybit emails." },
  { icon: Lock, title: "Withdrawal Whitelist", desc: "Restrict withdrawals to pre-approved addresses only with a 24-hour lock period for changes." },
  { icon: AlertTriangle, title: "Login Notifications", desc: "Instant alerts for new device logins, IP changes, and suspicious activity." },
]

const certifications = [
  { name: "SOC 2 Type II", desc: "Annual audit of security controls and operations." },
  { name: "ISO 27001", desc: "International standard for information security management." },
  { name: "CSA STAR", desc: "Cloud Security Alliance certification for cloud security." },
  { name: "Bug Bounty Program", desc: "Up to $100K rewards for security researchers." },
]

const timeline = [
  { year: "2025 Q4", event: "Completed SOC 2 Type II annual audit with zero findings." },
  { year: "2025 Q3", event: "Launched hardware security key support for all users." },
  { year: "2025 Q2", event: "Published first Merkle Tree Proof of Reserves report." },
  { year: "2025 Q1", event: "Upgraded cold storage infrastructure to multi-party computation (MPC)." },
  { year: "2024 Q4", event: "Achieved ISO 27001 certification." },
  { year: "2024 Q3", event: "Expanded bug bounty program to $100K maximum reward." },
]

export default function SecurityInfoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-12 text-center lg:py-20">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
              <Shield className="h-7 w-7 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">Security at Bybit</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground lg:text-base">Your security is our top priority. We employ industry-leading practices to protect your assets and data.</p>
          </div>
        </section>

        {/* Security Pillars */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 px-4 py-10 md:grid-cols-2 lg:grid-cols-4 lg:py-14">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <p.icon className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-sm font-semibold">{p.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
                <div className="mt-3 border-t border-border pt-3">
                  <div className="text-xl font-bold text-green-400">{p.stat}</div>
                  <p className="text-[10px] text-muted-foreground">{p.statLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Account Protections */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-14">
            <h2 className="mb-8 text-center text-xl font-bold">Account Protection Features</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {protections.map((p) => (
                <div key={p.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <p.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{p.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-14">
            <h2 className="mb-8 text-center text-xl font-bold">Certifications & Programs</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {certifications.map((c) => (
                <div key={c.name} className="rounded-xl border border-border bg-card p-5 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-400" />
                  <h3 className="text-sm font-bold">{c.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Timeline */}
        <section>
          <div className="mx-auto max-w-[800px] px-4 py-10 lg:py-14">
            <h2 className="mb-8 text-center text-xl font-bold">Security Updates</h2>
            <div className="flex flex-col gap-3">
              {timeline.map((t) => (
                <div key={t.year} className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
                  <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{t.year}</span>
                  <p className="text-xs text-secondary-foreground">{t.event}</p>
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
