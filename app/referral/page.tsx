"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Copy, Check, Users, DollarSign, Gift, Share2, Trophy, ArrowRight, QrCode, Twitter, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const leaderboard = [
  { rank: 1, name: "Crypto***ter", referrals: 1248, earned: "$45,200" },
  { rank: 2, name: "Trad***Pro", referrals: 892, earned: "$32,100" },
  { rank: 3, name: "Moon***Boy", referrals: 756, earned: "$28,500" },
  { rank: 4, name: "DeFi***King", referrals: 621, earned: "$22,800" },
  { rank: 5, name: "Whal***Aler", referrals: 543, earned: "$19,400" },
]

const tiers = [
  { level: "Bronze", referrals: "0-9", commission: "20%", bonus: "$0" },
  { level: "Silver", referrals: "10-49", commission: "25%", bonus: "$50" },
  { level: "Gold", referrals: "50-199", commission: "30%", bonus: "$200" },
  { level: "Platinum", referrals: "200-999", commission: "35%", bonus: "$1,000" },
  { level: "Diamond", referrals: "1000+", commission: "40%", bonus: "$5,000" },
]

const history = [
  { user: "user***42", date: "Feb 15, 2024", status: "Active", traded: "Yes", commission: "$12.50" },
  { user: "cryp***88", date: "Feb 14, 2024", status: "Active", traded: "Yes", commission: "$8.20" },
  { user: "new_***er", date: "Feb 13, 2024", status: "Pending", traded: "No", commission: "$0.00" },
  { user: "trad***55", date: "Feb 12, 2024", status: "Active", traded: "Yes", commission: "$25.00" },
  { user: "hold***99", date: "Feb 10, 2024", status: "Active", traded: "Yes", commission: "$15.80" },
]

export default function ReferralPage() {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<"overview" | "history" | "leaderboard">("overview")
  const referralCode = "BYBIT-X8K2M"
  const referralLink = "https://www.bybit.com/register?ref=X8K2M"

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="mx-auto max-w-[1400px] px-4 py-10 lg:py-14">
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Refer Friends, Earn Crypto</h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">Invite friends and earn up to 40% commission on their trading fees. Unlimited referrals, unlimited earnings.</p>
            <div className="mt-6 grid grid-cols-3 gap-6 lg:max-w-lg">
              <div><div className="text-2xl font-bold text-primary">$1,245</div><div className="text-xs text-muted-foreground">Total Earned</div></div>
              <div><div className="text-2xl font-bold text-foreground">28</div><div className="text-xs text-muted-foreground">Total Referrals</div></div>
              <div><div className="text-2xl font-bold text-[#0ecb81]">25%</div><div className="text-xs text-muted-foreground">Commission Rate</div></div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-6">
          {/* Referral link box */}
          <div className="mb-8 rounded-xl border border-primary/20 bg-card p-5 lg:p-6">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Your Referral Link</h2>
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-secondary px-4 py-3">
                <code className="flex-1 truncate font-mono text-sm text-foreground">{referralLink}</code>
                <button onClick={() => handleCopy(referralLink)} className="shrink-0 text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="h-4 w-4 text-[#0ecb81]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"><Share2 className="mr-1 h-3.5 w-3.5" /> Share</Button>
                <Button size="sm" variant="outline" className="text-xs border-border text-foreground"><QrCode className="mr-1 h-3.5 w-3.5" /> QR Code</Button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Referral Code:</span>
              <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs font-medium text-primary">{referralCode}</code>
              <button onClick={() => handleCopy(referralCode)} className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex items-center gap-1.5 rounded-lg bg-[#1DA1F2]/10 px-3 py-1.5 text-xs text-[#1DA1F2] hover:bg-[#1DA1F2]/20"><Twitter className="h-3.5 w-3.5" /> Twitter</button>
              <button className="flex items-center gap-1.5 rounded-lg bg-[#0088cc]/10 px-3 py-1.5 text-xs text-[#0088cc] hover:bg-[#0088cc]/20"><Send className="h-3.5 w-3.5" /> Telegram</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 border-b border-border">
            {(["overview", "history", "leaderboard"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-8">
              {/* How it works */}
              <div>
                <h2 className="mb-4 text-lg font-bold text-foreground">How It Works</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { step: "1", icon: Share2, title: "Share Your Link", desc: "Share your unique referral link with friends via social media or messaging." },
                    { step: "2", icon: Users, title: "Friends Sign Up", desc: "When they register using your link and start trading, you both earn rewards." },
                    { step: "3", icon: DollarSign, title: "Earn Commission", desc: "Receive up to 40% of their trading fees as commission, paid in real-time." },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{item.step}</div>
                      <h3 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commission tiers */}
              <div>
                <h2 className="mb-4 text-lg font-bold text-foreground">Commission Tiers</h2>
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full"><thead><tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Level</th><th className="px-4 py-3 font-medium">Referrals</th><th className="px-4 py-3 font-medium">Commission</th><th className="px-4 py-3 font-medium">Bonus</th>
                  </tr></thead><tbody>
                    {tiers.map((t, i) => (
                      <tr key={i} className={`border-b border-border last:border-0 ${t.level === "Silver" ? "bg-primary/5" : ""}`}>
                        <td className="px-4 py-3"><span className="text-xs font-semibold text-foreground">{t.level}</span>{t.level === "Silver" && <span className="ml-1.5 text-[10px] text-primary">Current</span>}</td>
                        <td className="px-4 py-3 text-xs text-foreground">{t.referrals}</td>
                        <td className="px-4 py-3 text-xs font-medium text-[#0ecb81]">{t.commission}</td>
                        <td className="px-4 py-3 text-xs text-foreground">{t.bonus}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="rounded-xl border border-border bg-card overflow-x-auto">
              <table className="w-full"><thead><tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                <th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Traded</th><th className="px-4 py-3 font-medium">Commission</th>
              </tr></thead><tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{h.user}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{h.date}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${h.status === "Active" ? "bg-[#0ecb81]/10 text-[#0ecb81]" : "bg-primary/10 text-primary"}`}>{h.status}</span></td>
                    <td className="px-4 py-3 text-xs text-foreground">{h.traded}</td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{h.commission}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
          )}

          {tab === "leaderboard" && (
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-4 py-3"><h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Trophy className="h-4 w-4 text-primary" /> Top Referrers This Month</h3></div>
              {leaderboard.map((l, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0 hover:bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${l.rank <= 3 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{l.rank}</div>
                    <span className="text-sm font-medium text-foreground">{l.name}</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <span className="text-muted-foreground">{l.referrals} referrals</span>
                    <span className="font-semibold text-[#0ecb81]">{l.earned}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
