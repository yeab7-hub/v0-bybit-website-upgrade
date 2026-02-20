"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  User, Mail, Phone, Camera, Shield, Bell, Key, ChevronRight, Pencil, Copy, Check,
  Clock, Wallet, ArrowLeftRight, Route, BellRing, MailOpen, Globe, Moon, LogOut,
  Headphones, ScanLine, UserPlus, CreditCard, Gift, Calendar, Coins, MoreHorizontal,
  Diamond, Percent, Users, Link2, Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BybitLogo } from "@/components/bybit-logo"

type Tab = "info" | "preference" | "general"

const sidebarItems = [
  { label: "Profile", href: "/account/settings", icon: User, active: true },
  { label: "Security", href: "/account/security", icon: Shield },
  { label: "Notifications", href: "/account/notifications", icon: Bell },
  { label: "API Management", href: "/account/api-management", icon: Key },
]

export default function AccountSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tab, setTab] = useState<Tab>("info")
  const [editing, setEditing] = useState<string | null>(null)
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setNickname(data.user?.user_metadata?.full_name || "")
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleSaveNickname = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.updateUser({ data: { full_name: nickname } })
      setEditing(null)
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    } catch {}
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    router.push("/")
    router.refresh()
  }

  const copyUID = () => {
    navigator.clipboard.writeText(user?.id?.slice(0, 8)?.toUpperCase() || "").catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const initials = (user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()
  const maskedEmail = user?.email ? user.email.replace(/(.{3}).*(@.*)/, "$1***$2") : "User"
  const uid = user?.id?.slice(0, 8)?.toUpperCase() || "00000000"

  const myInfoItems = [
    { icon: User, label: "Profile Picture", right: <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">{initials}</div>, href: "#" },
    { icon: Pencil, label: "Nickname", right: <span className="text-sm text-muted-foreground">{maskedEmail}</span>, action: () => setEditing("nickname") },
    { icon: Key, label: "UID", right: <button onClick={copyUID} className="flex items-center gap-1 text-sm text-muted-foreground">{uid} {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}</button> },
    { icon: Shield, label: "Identity Verification", right: <span className="text-sm text-muted-foreground">Lv.1 Verified</span>, href: "/kyc" },
    { icon: Shield, label: "Security", right: null, href: "/account/security" },
    { icon: Diamond, label: "VIP level", right: <span className="text-sm text-muted-foreground">Non-VIP</span>, href: "/fee-schedule" },
    { icon: Percent, label: "My Fee Rates", right: null, href: "/fee-schedule" },
    { icon: Users, label: "Subaccount", right: null, href: "#" },
    { icon: Link2, label: "Link Account", right: <Send className="h-4 w-4 text-primary" />, href: "#" },
  ]

  const preferenceItems = [
    { icon: Clock, label: "Benchmark Time Zone", right: <span className="text-sm text-muted-foreground">Last 24 hours</span>, href: "#" },
    { icon: Wallet, label: "Withdrawal Address", right: null, href: "#" },
    { icon: Shield, label: "Manage Crypto Withdrawal Limits", right: null, href: "#" },
    { icon: ArrowLeftRight, label: "Switch routing", right: null, href: "#" },
    { icon: Route, label: "Route Deposits To", right: <span className="text-sm text-muted-foreground">Funding Account</span>, href: "#" },
    { icon: BellRing, label: "Notification Settings", right: null, href: "/account/notifications" },
    { icon: MailOpen, label: "Email Subscriptions", right: null, href: "#" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex max-w-[1200px] gap-6 px-4 py-6 lg:py-10">
          {/* Sidebar -- desktop */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <h2 className="mb-4 text-lg font-bold text-foreground">Account</h2>
            <nav className="flex flex-col gap-0.5">
              {sidebarItems.map(item => (
                <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${item.active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}>
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1">
            {/* Mobile header for User Center */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <button onClick={() => router.back()} className="p-1 text-muted-foreground">
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
              <h1 className="text-base font-semibold text-foreground">User Center</h1>
              <div className="flex items-center gap-2">
                <button className="p-1 text-muted-foreground"><Moon className="h-5 w-5" /></button>
                <button className="p-1 text-muted-foreground"><Globe className="h-5 w-5" /></button>
              </div>
            </div>

            {/* Profile Header */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#87ceeb]/30 text-xl font-bold text-primary">
                  {initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground">
                  <Check className="h-3 w-3" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{maskedEmail}</h2>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">Security level</span>
                  <span className="text-sm font-medium text-success">High</span>
                  <div className="flex gap-0.5">
                    <div className="h-1.5 w-3 rounded-full bg-success" />
                    <div className="h-1.5 w-3 rounded-full bg-success" />
                    <div className="h-1.5 w-3 rounded-full bg-success" />
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <span className="mt-0.5 inline-block rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">Site: Bybit Global</span>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="mb-6 flex items-center border-b border-border">
              {([
                { key: "info" as Tab, label: "My info" },
                { key: "preference" as Tab, label: "Preference" },
                { key: "general" as Tab, label: "General" },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`border-b-2 px-4 pb-3 text-sm font-medium transition-colors ${
                    tab === t.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                {/* MY INFO TAB */}
                {tab === "info" && (
                  <div className="flex flex-col">
                    {myInfoItems.map((item, i) => (
                      <div key={i}>
                        {editing === "nickname" && item.label === "Nickname" ? (
                          <div className="flex items-center justify-between border-b border-border/50 py-4">
                            <div className="flex items-center gap-3">
                              <item.icon className="h-5 w-5 text-muted-foreground" />
                              <input
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="rounded border border-border bg-secondary px-2 py-1 text-sm text-foreground outline-none focus:border-primary"
                                autoFocus
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setEditing(null)} className="h-7 text-xs">Cancel</Button>
                              <Button size="sm" onClick={handleSaveNickname} className="h-7 bg-primary text-xs text-primary-foreground">Save</Button>
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={item.href || "#"}
                            onClick={item.action ? (e) => { e.preventDefault(); item.action?.() } : undefined}
                            className="flex items-center justify-between border-b border-border/50 py-4 transition-colors hover:bg-secondary/30"
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm text-foreground">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.right}
                              {item.href && item.href !== "#" && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                              {!item.right && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            </div>
                          </Link>
                        )}
                      </div>
                    ))}

                    {/* Log Out button */}
                    <button
                      onClick={handleSignOut}
                      className="mt-8 w-full rounded-lg border border-border py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      Log Out
                    </button>
                  </div>
                )}

                {/* PREFERENCE TAB */}
                {tab === "preference" && (
                  <div className="flex flex-col">
                    {preferenceItems.map((item, i) => (
                      <Link
                        key={i}
                        href={item.href || "#"}
                        className="flex items-center justify-between border-b border-border/50 py-4 transition-colors hover:bg-secondary/30"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-foreground">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.right}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* GENERAL TAB */}
                {tab === "general" && (
                  <div>
                    {/* Profile summary card */}
                    <div className="rounded-xl bg-card p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#87ceeb]/30 text-lg font-bold text-primary">
                              {initials}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-success text-success-foreground">
                              <Check className="h-2.5 w-2.5" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{maskedEmail}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              UID: {uid}
                              <button onClick={copyUID}>
                                {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                              </button>
                              <span>|</span>
                              <span>Site: Bybit Gl...</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[10px] text-foreground">
                                <Check className="h-2.5 w-2.5" /> Verified
                              </span>
                              <span className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                                Non-VIP <ChevronRight className="h-2.5 w-2.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>

                    {/* VIP Card */}
                    <div className="mt-4 rounded-xl bg-card p-5">
                      <div className="mb-2 h-1 w-16 rounded-full bg-muted-foreground/20" />
                      <div className="flex items-center justify-between">
                        <Link href="/fee-schedule" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                          VIP Benefits <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link href="/trade" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                          Trade Now
                        </Link>
                      </div>
                    </div>

                    {/* Quick cards */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Link href="/card" className="flex items-center gap-3 rounded-xl bg-card p-4 transition-colors hover:bg-secondary/30">
                        <CreditCard className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-medium text-foreground">Bybit Card</span>
                          <p className="text-[11px] text-muted-foreground">Check Now</p>
                        </div>
                      </Link>
                      <Link href="/rewards" className="flex items-center gap-3 rounded-xl bg-card p-4 transition-colors hover:bg-secondary/30">
                        <Gift className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-medium text-foreground">Rewards Hub</span>
                          <p className="text-[11px] text-muted-foreground">Check Now</p>
                        </div>
                      </Link>
                    </div>

                    {/* Recently used */}
                    <div className="mt-6">
                      <span className="text-xs text-muted-foreground">Recently used</span>
                      <div className="mt-3 grid grid-cols-4 gap-4">
                        {[
                          { label: "Card", icon: CreditCard, href: "/card" },
                          { label: "Daily Delight", icon: Calendar, href: "/rewards" },
                          { label: "Rewards Hub", icon: Gift, href: "/rewards" },
                          { label: "Deposit", icon: Wallet, href: "/deposit" },
                        ].map((item) => (
                          <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1.5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-muted-foreground">
                              <item.icon className="h-5 w-5" />
                            </div>
                            <span className="text-center text-[10px] text-muted-foreground">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* All Services */}
                    <div className="mt-6 flex justify-center">
                      <Link href="/dashboard" className="rounded-full border border-border px-8 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
                        All Services
                      </Link>
                    </div>

                    {/* Bottom links */}
                    <div className="mt-8 flex items-center justify-center gap-8 border-t border-border pt-4">
                      <Link href="/about" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        Bybit Lite <ArrowLeftRight className="h-3.5 w-3.5" />
                      </Link>
                      <div className="h-4 w-px bg-border" />
                      <Link href="/about" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        About Us <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
