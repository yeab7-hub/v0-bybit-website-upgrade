"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { User, Shield, Bell, Key, Plus, Copy, Eye, EyeOff, Trash2, AlertTriangle, Check, Clock, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const sidebarItems = [
  { label: "Profile", href: "/account/settings", icon: User },
  { label: "Security", href: "/account/security", icon: Shield },
  { label: "Notifications", href: "/account/notifications", icon: Bell },
  { label: "API Management", href: "/account/api-management", icon: Key, active: true },
]

const existingKeys = [
  { name: "Trading Bot #1", apiKey: "xk8f...9d2a", created: "2024-01-15", lastUsed: "2 min ago", permissions: ["Read", "Spot Trade"], ipRestriction: "192.168.1.100", status: "active" },
  { name: "Portfolio Tracker", apiKey: "m3j7...1b4c", created: "2024-02-20", lastUsed: "1 hour ago", permissions: ["Read"], ipRestriction: "Any", status: "active" },
  { name: "Old Bot Key", apiKey: "p9w2...7e5f", created: "2023-08-10", lastUsed: "30 days ago", permissions: ["Read", "Spot Trade", "Futures Trade"], ipRestriction: "10.0.0.1", status: "expired" },
]

export default function APIManagementPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [keyName, setKeyName] = useState("")
  const [permissions, setPermissions] = useState<string[]>(["Read"])
  const [ipWhitelist, setIpWhitelist] = useState("")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const allPermissions = ["Read", "Spot Trade", "Futures Trade", "Withdrawal", "Margin Trade"]

  const togglePermission = (p: string) => {
    setPermissions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(text)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex max-w-[1200px] gap-6 px-4 py-6 lg:py-10">
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
            <div className="mb-6 flex gap-1 overflow-x-auto lg:hidden">
              {sidebarItems.map(item => (
                <Link key={item.label} href={item.href} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${item.active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`}>
                  <item.icon className="h-3.5 w-3.5" /> {item.label}
                </Link>
              ))}
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">API Management</h1>
                <p className="text-xs text-muted-foreground">Create and manage API keys for programmatic access</p>
              </div>
              <Button onClick={() => setShowCreate(!showCreate)} size="sm" className="bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-1 h-3.5 w-3.5" /> Create API Key
              </Button>
            </div>

            {/* Warning */}
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium text-foreground">Keep your API keys secure</p>
                <p className="text-[10px] text-muted-foreground">Never share your Secret Key. Use IP restrictions for added security. You can create up to 30 API keys.</p>
              </div>
            </div>

            {/* Create form */}
            {showCreate && (
              <div className="mb-6 rounded-xl border border-primary/30 bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Create New API Key</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Key Name</label>
                    <input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="e.g., Trading Bot" className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Permissions</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {allPermissions.map(p => (
                        <button key={p} onClick={() => togglePermission(p)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${permissions.includes(p) ? "bg-primary/10 text-primary ring-1 ring-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                          {permissions.includes(p) && <Check className="mr-1 inline h-3 w-3" />}{p}
                        </button>
                      ))}
                    </div>
                    {permissions.includes("Withdrawal") && (
                      <p className="mt-2 flex items-center gap-1 text-[10px] text-[#f6465d]"><AlertTriangle className="h-3 w-3" /> Withdrawal permission is high risk. Use with caution.</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">IP Restriction (optional)</label>
                    <input value={ipWhitelist} onChange={(e) => setIpWhitelist(e.target.value)} placeholder="e.g., 192.168.1.100, 10.0.0.1" className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground" />
                    <p className="mt-1 text-[10px] text-muted-foreground">Comma-separated. Leave empty for unrestricted access.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-primary text-xs text-primary-foreground">Create Key</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)} className="text-xs">Cancel</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing keys */}
            <div className="space-y-3">
              {existingKeys.map((key, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${key.status === "active" ? "bg-primary/10" : "bg-secondary"}`}>
                        <Key className={`h-4 w-4 ${key.status === "active" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{key.name}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${key.status === "active" ? "bg-[#0ecb81]/10 text-[#0ecb81]" : "bg-secondary text-muted-foreground"}`}>{key.status}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>Created: {key.created}</span>
                          <span>&middot;</span>
                          <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {key.lastUsed}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"><Settings className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-[#f6465d]"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
                      <span className="text-xs text-muted-foreground">API Key:</span>
                      <code className="font-mono text-xs text-foreground">{key.apiKey}</code>
                      <button onClick={() => copyToClipboard(key.apiKey)} className="text-muted-foreground hover:text-foreground">
                        {copiedKey === key.apiKey ? <Check className="h-3 w-3 text-[#0ecb81]" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground">IP: <span className="text-foreground">{key.ipRestriction}</span></div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {key.permissions.map(p => (
                      <span key={p} className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* API docs link */}
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">API Documentation</h3>
              <p className="mt-1 text-xs text-muted-foreground">Learn how to use the API with our comprehensive documentation.</p>
              <Link href="/api-docs"><Button size="sm" variant="outline" className="mt-3 h-7 text-xs border-border text-foreground hover:bg-secondary">View API Docs</Button></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
