"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowRight, Rocket, Clock, Users, Shield, Star, CheckCircle, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"

const activeProjects = [
  { name: "NexGen Protocol", token: "NXG", raise: "$2,500,000", price: "$0.045", supply: "55,555,556 NXG", start: "Feb 28, 2026", end: "Mar 03, 2026", progress: 72, participants: 14832, status: "active" as const },
  { name: "ChainVault Finance", token: "CVF", raise: "$1,800,000", price: "$0.12", supply: "15,000,000 CVF", start: "Mar 05, 2026", end: "Mar 08, 2026", progress: 0, participants: 0, status: "upcoming" as const },
]

const pastProjects = [
  { name: "MetaWorld", token: "MWD", raise: "$3,000,000", roi: "+1,240%", participants: 22104 },
  { name: "DefiPulse", token: "DFP", raise: "$1,500,000", roi: "+856%", participants: 18543 },
  { name: "ZeroLayer", token: "ZLR", raise: "$2,000,000", roi: "+534%", participants: 25678 },
  { name: "QuantumSwap", token: "QSW", raise: "$1,200,000", roi: "+423%", participants: 12987 },
  { name: "SolarChain", token: "SLC", raise: "$2,500,000", roi: "+312%", participants: 31204 },
  { name: "NeonDEX", token: "NDX", raise: "$800,000", roi: "+289%", participants: 9876 },
]

const stats = [
  { label: "Projects Launched", value: "85+" },
  { label: "Avg. ATH ROI", value: "+720%" },
  { label: "Total Raised", value: "$180M+" },
  { label: "Unique Participants", value: "2.5M+" },
]

export default function LaunchpadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1400px] px-4 py-12 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
                <Rocket className="h-4 w-4" /> Token Launch Platform
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">Bybit Launchpad</h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">Get early access to the most promising crypto projects. Subscribe with BIT or USDT to earn new token allocations.</p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/register"><Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">Participate Now <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-8">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-mono text-3xl font-bold text-primary">{s.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-8">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Active & Upcoming</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {activeProjects.map((p) => (
                <div key={p.name} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">{p.token.charAt(0)}</div>
                        <div>
                          <h3 className="font-semibold text-foreground">{p.name}</h3>
                          <span className="text-xs text-muted-foreground">{p.token}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.status === "active" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                      {p.status === "active" ? "Live" : "Upcoming"}
                    </span>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Total Raise</span><div className="font-semibold text-foreground">{p.raise}</div></div>
                    <div><span className="text-muted-foreground">Token Price</span><div className="font-semibold text-foreground">{p.price}</div></div>
                    <div><span className="text-muted-foreground">Token Supply</span><div className="font-semibold text-foreground">{p.supply}</div></div>
                    <div><span className="text-muted-foreground">Period</span><div className="font-semibold text-foreground">{p.start} - {p.end}</div></div>
                  </div>
                  {p.status === "active" && (
                    <>
                      <div className="mb-2 flex items-center justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="text-foreground">{p.progress}%</span></div>
                      <div className="mb-4 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} /></div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3 w-3" /> {p.participants.toLocaleString()} participants</div>
                    </>
                  )}
                  <Link href="/register"><Button className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90" size="sm">{p.status === "active" ? "Subscribe Now" : "Get Notified"}</Button></Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[1400px] px-4 py-8">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Past Projects</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[600px]">
                <thead><tr className="border-b border-border bg-card/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Project</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total Raised</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">ATH ROI</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Participants</th>
                </tr></thead>
                <tbody>
                  {pastProjects.map((p) => (
                    <tr key={p.name} className="border-b border-border/50 hover:bg-card/30">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{p.token.charAt(0)}</div><div><span className="text-sm font-semibold text-foreground">{p.name}</span><span className="ml-2 text-xs text-muted-foreground">{p.token}</span></div></div></td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{p.raise}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-success">{p.roi}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{p.participants.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
