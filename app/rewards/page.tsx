"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Gift, Trophy, Star, Zap, Clock, Check, Lock, ChevronRight, Target, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

const missions = [
  { title: "First Trade", desc: "Complete your first spot trade", reward: "5 USDT", progress: 100, status: "claimed" },
  { title: "Deposit $100+", desc: "Make a deposit of $100 or more", reward: "10 USDT", progress: 100, status: "claimable" },
  { title: "Trade 5 Days", desc: "Trade on 5 different days", reward: "15 USDT", progress: 60, status: "active", current: 3, total: 5 },
  { title: "Refer a Friend", desc: "Invite a friend who signs up", reward: "20 USDT", progress: 0, status: "locked" },
  { title: "KYC Verification", desc: "Complete identity verification", reward: "10 USDT", progress: 0, status: "locked" },
  { title: "Trade $10,000 Volume", desc: "Reach $10,000 in trading volume", reward: "50 USDT", progress: 35, status: "active", current: 3500, total: 10000 },
]

const dailyCheckins = [
  { day: 1, reward: "1 USDT", claimed: true },
  { day: 2, reward: "1 USDT", claimed: true },
  { day: 3, reward: "2 USDT", claimed: true },
  { day: 4, reward: "2 USDT", claimed: false },
  { day: 5, reward: "3 USDT", claimed: false },
  { day: 6, reward: "3 USDT", claimed: false },
  { day: 7, reward: "5 USDT", claimed: false },
]

const coupons = [
  { type: "Trading Fee", value: "20% Off", expiry: "Mar 15, 2024", status: "active" },
  { type: "Deposit Bonus", value: "$50 Bonus", expiry: "Feb 28, 2024", status: "active" },
  { type: "Futures Trial", value: "100 USDT", expiry: "Apr 1, 2024", status: "active" },
  { type: "VIP Upgrade", value: "7-Day VIP", expiry: "Feb 20, 2024", status: "expired" },
]

const vipLevels = [
  { level: "Regular", volume: "$0", fee: "0.10%", benefits: 1 },
  { level: "VIP 1", volume: "$1M", fee: "0.08%", benefits: 3, current: true },
  { level: "VIP 2", volume: "$5M", fee: "0.06%", benefits: 5 },
  { level: "VIP 3", volume: "$25M", fee: "0.04%", benefits: 8 },
  { level: "VVIP", volume: "$100M", fee: "0.02%", benefits: 12 },
]

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
            <h1 className="mt-2 text-2xl font-bold text-foreground lg:text-3xl">Earn Rewards Every Day</h1>
            <p className="mt-2 text-sm text-muted-foreground">Complete missions, check in daily, and unlock exclusive bonuses.</p>
            <div className="mt-6 flex gap-6">
              <div><div className="text-xl font-bold text-primary">$85.00</div><div className="text-xs text-muted-foreground">Total Earned</div></div>
              <div><div className="text-xl font-bold text-foreground">3</div><div className="text-xs text-muted-foreground">Active Coupons</div></div>
              <div><div className="text-xl font-bold text-[#0ecb81]">VIP 1</div><div className="text-xs text-muted-foreground">Current Tier</div></div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-6">
          {/* Daily Check-in */}
          <div className="mb-8 rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground"><Flame className="h-4 w-4 text-primary" /> Daily Check-in</h2>
              <span className="text-xs text-muted-foreground">Day 3 of 7</span>
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
            <Button className="mt-4 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90" size="sm">Check In Today</Button>
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
            </div>
          )}

          {tab === "vip" && (
            <div>
              <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center justify-between">
                  <div><div className="text-xs text-muted-foreground">Current Level</div><div className="text-xl font-bold text-primary">VIP 1</div></div>
                  <div className="text-right"><div className="text-xs text-muted-foreground">30D Volume</div><div className="text-lg font-bold text-foreground">$1,245,000</div></div>
                </div>
                <div className="mt-3"><div className="mb-1 flex justify-between text-[10px] text-muted-foreground"><span>$1.2M / $5M to VIP 2</span><span>24%</span></div>
                  <div className="h-2 w-full rounded-full bg-border"><div className="h-full rounded-full bg-primary" style={{ width: "24%" }} /></div>
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
