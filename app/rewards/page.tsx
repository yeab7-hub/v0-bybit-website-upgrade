"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Gift, Trophy, Star, Zap, Clock, Check, Lock, ChevronRight, Target, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

const missions: any[] = []
const dailyCheckins: any[] = []
const coupons: any[] = []
const vipLevels: any[] = []

export default function RewardsPage() {
  const [tab, setTab] = useState<"missions" | "coupons" | "vip">("missions")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="mx-auto max-w-[1400px] px-4 py-10 lg:py-14">
            <div className="flex items-center gap-2 text-primary"><Gift className="h-5 w-5" /><span className="text-xs font-semibold uppercase tracking-wider">Rewards Hub</span></div>
            <h1 className="mt-2 text-2xl font-bold text-foreground lg:text-3xl">Rewards and VIP status</h1>
            <p className="mt-2 text-sm text-muted-foreground">Reward campaigns, coupon issuance, check-ins, and VIP volume calculations are not connected. No reward balance or eligibility is available to claim.</p>
            <div className="mt-6 flex gap-6">
              <div><div className="text-xl font-bold text-primary">Unavailable</div><div className="text-xs text-muted-foreground">Total Earned</div></div>
              <div><div className="text-xl font-bold text-foreground">Not connected</div><div className="text-xs text-muted-foreground">Active Coupons</div></div>
              <div><div className="text-xl font-bold text-[#0ecb81]">Not configured</div><div className="text-xs text-muted-foreground">Current Tier</div></div>
            </div>
          </div>
        </div>

        <div role="status" className="mx-auto mt-4 max-w-[1400px] rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">Rewards are not configured. Claims, check-ins, coupons, and VIP tiers are disabled until backed by verified account data and a reward ledger.</div>
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          {/* Daily Check-in */}
          <div className="mb-8 rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground"><Flame className="h-4 w-4 text-primary" /> Daily Check-in</h2>
              <span className="text-xs text-muted-foreground">Not configured</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {dailyCheckins.map((d, i) => (
                <div key={i} className={`flex flex-col items-center rounded-lg p-3 text-center transition-all ${d.claimed ? "bg-primary/10 border border-primary/20" : i === 3 ? "bg-secondary border border-primary/30 ring-1 ring-primary/20" : "bg-secondary border border-transparent"}`}>
                  <span className="text-[10px] text-muted-foreground">Day {d.day}</span>
                  <span className="mt-1 text-xs font-bold text-foreground">{d.reward}</span>
                  {d.claimed ? <Check className="mt-1 h-3.5 w-3.5 text-primary" /> : i === 3 ? <Gift className="mt-1 h-3.5 w-3.5 text-primary" /> : <Lock className="mt-1 h-3.5 w-3.5 text-muted-foreground/30" />}
                </div>
              ))}
            </div>
            <Button disabled title="Daily check-in rewards are not connected" className="mt-4 w-full" size="sm">Check-in unavailable</Button>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 border-b border-border">
            {(["missions", "coupons", "vip"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t === "vip" ? "VIP Program" : t}</button>
            ))}
          </div>

          {tab === "missions" && (
            <div className="space-y-3">
              {missions.map((m, i) => (
                <div key={i} className={`rounded-xl border bg-card p-4 ${m.status === "claimable" ? "border-primary/30" : "border-border"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.status === "claimed" ? "bg-[#0ecb81]/10" : m.status === "claimable" ? "bg-primary/10" : "bg-secondary"}`}>
                        {m.status === "claimed" ? <Check className="h-4 w-4 text-[#0ecb81]" /> : m.status === "locked" ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Target className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{m.title}</h3>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary">{m.reward}</span>
                      {m.status === "claimable" && <Button size="sm" className="h-7 bg-primary text-[10px] font-semibold text-primary-foreground">Claim</Button>}
                      {m.status === "claimed" && <span className="rounded-full bg-[#0ecb81]/10 px-2 py-0.5 text-[10px] font-medium text-[#0ecb81]">Claimed</span>}
                    </div>
                  </div>
                  {m.status === "active" && (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[10px] text-muted-foreground"><span>{m.current}/{m.total}</span><span>{m.progress}%</span></div>
                      <div className="h-1.5 w-full rounded-full bg-border"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${m.progress}%` }} /></div>
                    </div>
                  )}
                </div>
              ))}
              {missions.length === 0 && <p className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">No verified reward missions are configured.</p>}
            </div>
          )}

          {tab === "coupons" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {coupons.map((c, i) => (
                <div key={i} className={`rounded-xl border bg-card p-5 ${c.status === "expired" ? "border-border opacity-60" : "border-primary/20"}`}>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{c.type}</span>
                    <span className={`text-[10px] ${c.status === "expired" ? "text-muted-foreground" : "text-muted-foreground"}`}>Expires: {c.expiry}</span>
                  </div>
                  <div className="mt-3 text-xl font-bold text-foreground">{c.value}</div>
                  <Button size="sm" disabled={c.status === "expired"} className={`mt-3 w-full text-xs font-semibold ${c.status === "expired" ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                    {c.status === "expired" ? "Expired" : "Use Now"}
                  </Button>
                </div>
              ))}
              {coupons.length === 0 && <p className="col-span-full rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">No verified coupons are available.</p>}
            </div>
          )}

          {tab === "vip" && (
            <div>
              <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center justify-between">
                  <div><div className="text-xs text-muted-foreground">Current Level</div><div className="text-xl font-bold text-primary">Not configured</div></div>
                  <div className="text-right"><div className="text-xs text-muted-foreground">30D Volume</div><div className="text-lg font-bold text-foreground">Not connected</div></div>
                </div>
                <div className="mt-3"><div className="mb-1 flex justify-between text-[10px] text-muted-foreground"><span>Volume calculation unavailable</span><span>—</span></div>
                  <div className="h-2 w-full rounded-full bg-border"><div className="h-full rounded-full bg-primary" style={{ width: "0%" }} /></div>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full"><thead><tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Level</th><th className="px-4 py-3 font-medium">30D Volume</th><th className="px-4 py-3 font-medium">Maker Fee</th><th className="px-4 py-3 font-medium">Benefits</th>
                </tr></thead><tbody>
                  {vipLevels.map((v, i) => (
                    <tr key={i} className={`border-b border-border last:border-0 ${v.current ? "bg-primary/5" : ""}`}>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><Star className={`h-3.5 w-3.5 ${v.current ? "text-primary" : "text-muted-foreground/30"}`} /><span className="text-xs font-semibold text-foreground">{v.level}</span>{v.current && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">Current</span>}</div></td>
                      <td className="px-4 py-3 text-xs text-foreground">{v.volume}</td>
                      <td className="px-4 py-3 text-xs text-[#0ecb81]">{v.fee}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{v.benefits} perks</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
