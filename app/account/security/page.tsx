"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { User, Shield, Bell, Key, Lock, Smartphone, Mail, Eye, EyeOff, AlertTriangle, Check, X, ChevronRight, Fingerprint, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const sidebarItems = [
  { label: "Profile", href: "/account/settings", icon: User },
  { label: "Security", href: "/account/security", icon: Shield, active: true },
  { label: "Notifications", href: "/account/notifications", icon: Bell },
  { label: "API Management", href: "/account/api-management", icon: Key },
]

const loginHistory = [
  { device: "Chrome on macOS", ip: "192.168.1.***", location: "New York, US", time: "2 min ago", status: "current" },
  { device: "Safari on iPhone", ip: "10.0.0.***", location: "New York, US", time: "3 hours ago", status: "success" },
  { device: "Firefox on Windows", ip: "172.16.0.***", location: "London, UK", time: "2 days ago", status: "success" },
  { device: "Chrome on Android", ip: "192.168.2.***", location: "Tokyo, JP", time: "5 days ago", status: "failed" },
]

export default function SecurityPage() {
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showOldPw, setShowOldPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [antiPhishing, setAntiPhishing] = useState(false)
  const [withdrawalWhitelist, setWithdrawalWhitelist] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex max-w-[1200px] gap-6 px-4 py-6 lg:py-10">
          {/* Sidebar */}
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

          <div className="flex-1">
            {/* Mobile nav */}
            <div className="mb-6 flex gap-1 overflow-x-auto lg:hidden">
              {sidebarItems.map(item => (
                <Link key={item.label} href={item.href} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${item.active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}>
                  <item.icon className="h-3.5 w-3.5" /> {item.label}
                </Link>
              ))}
            </div>

            <h1 className="mb-6 text-xl font-bold text-foreground">Security Settings</h1>

            {/* Security level */}
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary">Security Level</div>
                  <div className="mt-1 text-lg font-bold text-foreground">Medium</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">Enable 2FA and anti-phishing code to increase your security level.</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/30">
                  <span className="text-xl font-bold text-primary">2/4</span>
                </div>
              </div>
              <div className="mt-4 flex gap-1">
                <div className="h-1.5 flex-1 rounded-full bg-primary" />
                <div className="h-1.5 flex-1 rounded-full bg-primary" />
                <div className="h-1.5 flex-1 rounded-full bg-border" />
                <div className="h-1.5 flex-1 rounded-full bg-border" />
              </div>
            </div>

            <div className="space-y-4">
              {/* Password */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary"><Lock className="h-4 w-4 text-foreground" /></div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Login Password</h3>
                      <p className="text-xs text-muted-foreground">Used to log in to your account</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#0ecb81]/10 px-2 py-0.5 text-[10px] font-medium text-[#0ecb81]">Enabled</span>
                    <Button size="sm" variant="ghost" onClick={() => setShowChangePassword(!showChangePassword)} className="h-7 text-xs text-primary">Change</Button>
                  </div>
                </div>
                {showChangePassword && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Current Password</label>
                      <div className="relative mt-1"><input type={showOldPw ? "text" : "password"} className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" /><button onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showOldPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">New Password</label>
                      <div className="relative mt-1"><input type={showNewPw ? "text" : "password"} className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" /><button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                    </div>
                    <div className="flex gap-2"><Button size="sm" className="bg-primary text-xs text-primary-foreground">Confirm</Button><Button size="sm" variant="ghost" onClick={() => setShowChangePassword(false)} className="text-xs">Cancel</Button></div>
                  </div>
                )}
              </div>

              {/* 2FA */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary"><Smartphone className="h-4 w-4 text-foreground" /></div>
                    <div><h3 className="text-sm font-semibold text-foreground">Two-Factor Authentication (2FA)</h3><p className="text-xs text-muted-foreground">Google Authenticator or SMS verification</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#f6465d]/10 px-2 py-0.5 text-[10px] font-medium text-[#f6465d]">Disabled</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">Enable</Button>
                  </div>
                </div>
              </div>

              {/* Email verification */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary"><Mail className="h-4 w-4 text-foreground" /></div>
                    <div><h3 className="text-sm font-semibold text-foreground">Email Verification</h3><p className="text-xs text-muted-foreground">Verify actions via email confirmation</p></div>
                  </div>
                  <span className="rounded-full bg-[#0ecb81]/10 px-2 py-0.5 text-[10px] font-medium text-[#0ecb81]">Enabled</span>
                </div>
              </div>

              {/* Anti-phishing */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary"><Fingerprint className="h-4 w-4 text-foreground" /></div>
                    <div><h3 className="text-sm font-semibold text-foreground">Anti-Phishing Code</h3><p className="text-xs text-muted-foreground">Custom code shown in official emails to verify authenticity</p></div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setAntiPhishing(!antiPhishing)} className={`h-7 text-xs ${antiPhishing ? "border-[#0ecb81]/30 text-[#0ecb81]" : "border-primary/30 text-primary hover:bg-primary/10"}`}>{antiPhishing ? "Configured" : "Set Up"}</Button>
                </div>
              </div>

              {/* Withdrawal whitelist */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary"><Globe className="h-4 w-4 text-foreground" /></div>
                    <div><h3 className="text-sm font-semibold text-foreground">Withdrawal Whitelist</h3><p className="text-xs text-muted-foreground">Only withdraw to pre-approved addresses</p></div>
                  </div>
                  <button onClick={() => setWithdrawalWhitelist(!withdrawalWhitelist)} className={`relative h-6 w-11 rounded-full transition-colors ${withdrawalWhitelist ? "bg-primary" : "bg-border"}`}>
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${withdrawalWhitelist ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>

              {/* Login history */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Recent Login Activity</h3>
                <div className="space-y-0">
                  {loginHistory.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${entry.status === "current" ? "bg-primary/10" : entry.status === "failed" ? "bg-[#f6465d]/10" : "bg-secondary"}`}>
                          {entry.status === "current" ? <Check className="h-3.5 w-3.5 text-primary" /> : entry.status === "failed" ? <X className="h-3.5 w-3.5 text-[#f6465d]" /> : <Check className="h-3.5 w-3.5 text-[#0ecb81]" />}
                        </div>
                        <div>
                          <div className="text-sm text-foreground">{entry.device}</div>
                          <div className="text-[10px] text-muted-foreground">{entry.ip} &middot; {entry.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">{entry.time}</div>
                        {entry.status === "current" && <span className="text-[10px] font-medium text-primary">Current</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
