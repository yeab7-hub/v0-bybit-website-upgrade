"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { User, Mail, Phone, Globe, Camera, Shield, Bell, Key, ChevronRight, Check, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

const sidebarItems = [
  { label: "Profile", href: "/account/settings", icon: User, active: true },
  { label: "Security", href: "/account/security", icon: Shield },
  { label: "Notifications", href: "/account/notifications", icon: Bell },
  { label: "API Management", href: "/account/api-management", icon: Key },
]

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(true)

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
    } catch {}
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

          {/* Content */}
          <div className="flex-1">
            {/* Mobile nav */}
            <div className="mb-6 flex gap-1 overflow-x-auto lg:hidden">
              {sidebarItems.map(item => (
                <Link key={item.label} href={item.href} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${item.active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}>
                  <item.icon className="h-3.5 w-3.5" /> {item.label}
                </Link>
              ))}
            </div>

            <h1 className="mb-6 text-xl font-bold text-foreground">Profile Settings</h1>

            {loading ? (
              <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
            ) : (
              <div className="space-y-6">
                {/* Avatar */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                        {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Camera className="h-3 w-3" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{user?.user_metadata?.full_name || "User"}</h3>
                      <p className="text-xs text-muted-foreground">UID: {user?.id?.slice(0, 8)?.toUpperCase()}</p>
                      <p className="text-[10px] text-muted-foreground">Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Info fields */}
                <div className="rounded-xl border border-border bg-card">
                  {/* Nickname */}
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Nickname</div>
                        {editing === "nickname" ? (
                          <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-0.5 rounded border border-border bg-secondary px-2 py-1 text-sm text-foreground outline-none focus:border-primary" autoFocus />
                        ) : (
                          <div className="text-sm font-medium text-foreground">{user?.user_metadata?.full_name || "Not set"}</div>
                        )}
                      </div>
                    </div>
                    {editing === "nickname" ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)} className="h-7 text-xs">Cancel</Button>
                        <Button size="sm" onClick={handleSaveNickname} className="h-7 bg-primary text-xs text-primary-foreground">Save</Button>
                      </div>
                    ) : (
                      <button onClick={() => setEditing("nickname")} className="text-xs text-primary hover:underline"><Pencil className="h-3.5 w-3.5" /></button>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Email Address</div>
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          {user?.email || "Not set"}
                          {user?.email && <span className="rounded-full bg-[#0ecb81]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0ecb81]">Verified</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Phone Number</div>
                        <div className="text-sm font-medium text-foreground">{user?.phone || "Not linked"}</div>
                      </div>
                    </div>
                    <button className="text-xs text-primary hover:underline">{user?.phone ? "Change" : "Link"}</button>
                  </div>

                  {/* KYC */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Identity Verification</div>
                        <div className="text-sm font-medium text-foreground">Not Verified</div>
                      </div>
                    </div>
                    <Link href="/kyc"><Button size="sm" variant="outline" className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">Verify Now</Button></Link>
                  </div>
                </div>

                {/* Preferences */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">Preferences</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Language", value: "English" },
                      { label: "Currency", value: "USD" },
                      { label: "Timezone", value: "UTC+0" },
                    ].map((pref, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                        <span className="text-sm text-foreground">{pref.label}</span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {pref.value} <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger */}
                <div className="rounded-xl border border-destructive/20 bg-card p-5">
                  <h3 className="mb-2 text-sm font-semibold text-destructive">Danger Zone</h3>
                  <p className="mb-4 text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
                  <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">Delete Account</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
