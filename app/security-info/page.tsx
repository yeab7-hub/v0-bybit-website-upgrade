"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Shield, Lock, Server, Eye, Key, Users, CheckCircle2, AlertTriangle, Fingerprint, Smartphone } from "lucide-react"

const pillars = [
  { icon: Lock, title: "Cold Storage", desc: "Cold-storage custody is not integrated or independently verified by this application.", stat: "Not verified", statLabel: "Custody status" },
  { icon: Shield, title: "Proof of Reserves", desc: "This application does not publish an independently audited proof-of-reserves report.", stat: "Not published", statLabel: "Proof of reserves" },
  { icon: Server, title: "Infrastructure Security", desc: "Independent infrastructure certification and uptime commitments have not been verified for this project.", stat: "Not measured", statLabel: "Uptime" },
  { icon: Eye, title: "24/7 Monitoring", desc: "A dedicated 24/7 security operations center is not configured or verified by this project.", stat: "Not verified", statLabel: "Monitoring" },
]

const protections = [
  { icon: Fingerprint, title: "Biometric Authentication", desc: "Biometric authentication integration is not configured in this application." },
  { icon: Key, title: "Hardware Key Support", desc: "Hardware security key support is not configured in this application." },
  { icon: Smartphone, title: "2FA Required", desc: "Two-factor authentication enforcement is not configured for critical operations in this application." },
  { icon: Users, title: "Anti-Phishing Code", desc: "An anti-phishing code feature is not configured in this application." },
  { icon: Lock, title: "Withdrawal Whitelist", desc: "Withdrawal address whitelisting and change-lock workflows are not configured in this application." },
  { icon: AlertTriangle, title: "Login Notifications", desc: "Login alerts and suspicious-activity monitoring depend on integrations not configured here." },
]

const certifications = [
  { name: "SOC 2 Type II — not verified", desc: "Annual audit of security controls and operations." },
  { name: "ISO 27001 — not verified", desc: "International standard for information security management." },
  { name: "CSA STAR — not verified", desc: "Cloud Security Alliance certification for cloud security." },
  { name: "Bug Bounty Program", desc: "No bug bounty program or reward amount is configured in this project." },
]

const timeline: any[] = []

export default function SecurityInfoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <div role="status" className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-3 text-center text-sm text-muted-foreground">No custody percentage, proof-of-reserves report, third-party certification, insurance coverage, or uptime guarantee is verified by this application.</div>
        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-12 text-center lg:py-20">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
              <Shield className="h-7 w-7 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">Platform Security Status</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground lg:text-base">This page lists security capabilities that still require integration or independent verification. Do not infer custody, insurance, proof of reserves, or certification from this page.</p>
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
