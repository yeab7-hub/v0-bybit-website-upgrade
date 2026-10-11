"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Clock, TrendingUp, Users, Coins, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type ActiveProject = { name: string; fullName: string; pool: string; totalStaked: string; apr: string; duration: string; participants: number; earned: string; endsIn: string; status: string }
type UpcomingProject = { name: string; fullName: string; pool: string; totalRewards: string; duration: string; startsIn: string }
type PastProject = { name: string; fullName: string; pool: string; totalStaked: string; apr: string; participants: number; status: string }

const activeProjects: ActiveProject[] = []
const upcomingProjects: UpcomingProject[] = []
const pastProjects: PastProject[] = []

export default function LaunchpoolPage() {
  const [tab, setTab] = useState<"active" | "upcoming" | "past">("active")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="mx-auto max-w-[1400px] px-4 py-10 lg:py-14">
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Launchpool</h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">Campaign data, staking custody, reward accounting, and withdrawals are not connected. No staking campaign is currently available.</p>
            <div className="mt-6 flex gap-6">
              {[{ label: "Active Projects", value: String(activeProjects.length) }, { label: "Total Value Locked", value: "Not connected" }, { label: "Tokens Distributed", value: "Not connected" }].map(s => (
                <div key={s.label}>
                  <div className="text-lg font-bold text-primary">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div role="status" className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-3 text-center text-sm text-muted-foreground">
          Launchpool is unavailable until campaign data, staking custody, reward settlement, and withdrawal flows are implemented and tested.
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-6">
          {/* Tabs */}
          <div className="mb-6 flex gap-1 border-b border-border">
            {(["active", "upcoming", "past"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t} {t === "active" && <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{activeProjects.length}</span>}
              </button>
            ))}
          </div>

          {/* Active */}
          {tab === "active" && (
            <div className="grid gap-4 lg:grid-cols-3">
              {activeProjects.length === 0 && <p className="col-span-full rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">No verified active staking campaigns are configured.</p>}
              {activeProjects.map((p, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{p.name.charAt(0)}</div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">{p.fullName}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#0ecb81]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#0ecb81]">Active</span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-secondary p-3">
                      <div className="text-[10px] text-muted-foreground">APR</div>
                      <div className="text-lg font-bold text-[#0ecb81]">{p.apr}</div>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <div className="text-[10px] text-muted-foreground">Total Staked</div>
                      <div className="text-sm font-semibold text-foreground">{p.totalStaked}</div>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <div className="text-[10px] text-muted-foreground">Participants</div>
                      <div className="text-sm font-semibold text-foreground">{p.participants.toLocaleString()}</div>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <div className="text-[10px] text-muted-foreground">Ends In</div>
                      <div className="text-sm font-semibold text-primary">{p.endsIn}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2">
                    <span className="text-xs text-muted-foreground">{p.pool}</span>
                    <span className="text-xs text-muted-foreground">Duration: {p.duration}</span>
                  </div>
                  <Button className="mt-4 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90">Stake Now</Button>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming */}
          {tab === "upcoming" && (
            <div className="grid gap-4 lg:grid-cols-2">
              {upcomingProjects.length === 0 && <p className="col-span-full rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">No verified upcoming campaigns are configured.</p>}
              {upcomingProjects.map((p, i) => (
                <div key={i} className="rounded-xl border border-dashed border-primary/30 bg-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">{p.name.charAt(0)}</div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">{p.fullName}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">Starts in {p.startsIn}</span>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <div><div className="text-[10px] text-muted-foreground">Total Rewards</div><div className="text-sm font-semibold text-foreground">{p.totalRewards}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">Pool</div><div className="text-sm font-semibold text-foreground">{p.pool}</div></div>
                    <div><div className="text-[10px] text-muted-foreground">Duration</div><div className="text-sm font-semibold text-foreground">{p.duration}</div></div>
                  </div>
                  <Button variant="outline" className="mt-4 w-full border-primary/30 text-primary hover:bg-primary/10">Subscribe to Alerts</Button>
                </div>
              ))}
            </div>
          )}

          {/* Past */}
          {tab === "past" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Project</th><th className="pb-3 font-medium">Pool</th><th className="pb-3 font-medium">Total Staked</th><th className="pb-3 font-medium">APR</th><th className="pb-3 font-medium">Participants</th>
                </tr></thead>
                <tbody>
                  {pastProjects.map((p, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-3"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">{p.name.charAt(0)}</div><div><div className="text-sm font-medium text-foreground">{p.name}</div><div className="text-[10px] text-muted-foreground">{p.fullName}</div></div></div></td>
                      <td className="py-3 text-xs text-foreground">{p.pool}</td>
                      <td className="py-3 text-xs text-foreground">{p.totalStaked}</td>
                      <td className="py-3 text-xs text-[#0ecb81]">{p.apr}</td>
                      <td className="py-3 text-xs text-foreground">{p.participants.toLocaleString()}</td>
                    </tr>
                  ))}
                  {pastProjects.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No verified past campaign records are available.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
