"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { User, Shield, Bell, Key, Lock, Smartphone, Mail, Eye, EyeOff, AlertTriangle, Check, X, ChevronRight, Fingerprint, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const sidebarItems = [
  { label: "Profile", href: "/account/settings", icon: User },
  { label: "Security", href: "/account/security", icon: Shield, active: true },
  { label: "Notifications", href: "/account/notifications", icon: Bell },
  { label: "API Management", href: "/account/api-management", icon: Key },
]

export default function SecurityPage() {
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showOldPw, setShowOldPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleChangePassword = async () => {
    setPasswordMessage(null)
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Use at least 8 characters for your new password." })
      return
    }
    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Enter your current password to continue." })
      return
    }
    setPasswordLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error("Please sign in again before changing your password.")
      const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })
      if (verifyError) throw new Error("Your current password is incorrect.")
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      setCurrentPassword("")
      setNewPassword("")
      setPasswordMessage({ type: "success", text: "Your password has been updated." })
    } catch (cause) {
      setPasswordMessage({ type: "error", text: cause instanceof Error ? cause.message : "Could not update your password." })
    } finally {
      setPasswordLoading(false)
    }
  }

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
                  <div className="mt-1 text-lg font-bold text-foreground">Password protected</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">Additional security features are not configured in this app yet.</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/30">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
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
                    <span className="rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground">Provider-managed</span>
                    <Button size="sm" variant="ghost" onClick={() => setShowChangePassword(!showChangePassword)} className="h-7 text-xs text-primary">Change</Button>
                  </div>
                </div>
                {showChangePassword && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Current Password</label>
                      <div className="relative mt-1"><input value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} type={showOldPw ? "text" : "password"} autoComplete="current-password" className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 pr-10 text-base text-foreground outline-none focus:border-primary" /><button type="button" onClick={() => setShowOldPw(!showOldPw)} aria-label={showOldPw ? "Hide current password" : "Show current password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showOldPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">New Password</label>
                      <div className="relative mt-1"><input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type={showNewPw ? "text" : "password"} autoComplete="new-password" minLength={8} className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 pr-10 text-base text-foreground outline-none focus:border-primary" /><button type="button" onClick={() => setShowNewPw(!showNewPw)} aria-label={showNewPw ? "Hide new password" : "Show new password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                    </div>
                    {passwordMessage && <p role={passwordMessage.type === "error" ? "alert" : "status"} className={`rounded-lg p-3 text-sm ${passwordMessage.type === "error" ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"}`}>{passwordMessage.text}</p>}
                    <div className="flex flex-wrap gap-2"><Button size="sm" onClick={handleChangePassword} disabled={passwordLoading} className="bg-primary text-xs text-primary-foreground">{passwordLoading ? "Updating…" : "Confirm"}</Button><Button size="sm" variant="ghost" onClick={() => setShowChangePassword(false)} className="text-xs">Cancel</Button></div>
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
                    <Button size="sm" variant="outline" disabled title="Two-factor authentication is not configured yet" className="h-7 border-primary/30 text-xs text-muted-foreground">Not configured</Button>
                  </div>
                </div>
              </div>

              {/* Email verification */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary"><Mail className="h-4 w-4 text-foreground" /></div>
                    <div><h3 className="text-sm font-semibold text-foreground">Email Authentication</h3><p className="text-xs text-muted-foreground">Sign-in and recovery are managed by the configured authentication provider.</p></div>
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
                  <span className="rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground">Not configured</span>
                </div>
              </div>

              {/* Withdrawal whitelist */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary"><Globe className="h-4 w-4 text-foreground" /></div>
                    <div><h3 className="text-sm font-semibold text-foreground">Withdrawal Whitelist</h3><p className="text-xs text-muted-foreground">Only withdraw to pre-approved addresses</p></div>
                  </div>
                  <span className="rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground">Not configured</span>
                </div>
              </div>

              {/* Login history */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Recent Login Activity</h3>
                <p className="text-sm text-muted-foreground">Login history tracking is not connected yet. This page does not display fabricated device or location records.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
