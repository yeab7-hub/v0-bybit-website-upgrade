"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { User, Shield, Bell, Key, BellRing, Mail, Smartphone, MessageSquare, TrendingUp, AlertCircle, Megaphone, CheckCheck, Circle, Loader2, Inbox } from "lucide-react"
import Link from "next/link"

const sidebarItems = [
  { label: "Profile", href: "/account/settings", icon: User },
  { label: "Security", href: "/account/security", icon: Shield },
  { label: "Notifications", href: "/account/notifications", icon: Bell, active: true },
  { label: "API Management", href: "/account/api-management", icon: Key },
]

type NotifSetting = { label: string; description: string; email: boolean; push: boolean; sms: boolean }

const initialSettings: { category: string; icon: any; items: NotifSetting[] }[] = [
  {
    category: "Trading",
    icon: TrendingUp,
    items: [
      { label: "Order Filled", description: "When your order is fully or partially filled", email: true, push: true, sms: false },
      { label: "Order Cancelled", description: "When your order is cancelled", email: true, push: true, sms: false },
      { label: "Liquidation Warning", description: "When position approaches liquidation", email: true, push: true, sms: true },
      { label: "Funding Rate", description: "Periodic funding rate notifications", email: false, push: true, sms: false },
      { label: "Price Alerts", description: "Custom price target notifications", email: true, push: true, sms: false },
    ],
  },
  {
    category: "Account",
    icon: Shield,
    items: [
      { label: "Login Alerts", description: "New device or location login detected", email: true, push: true, sms: true },
      { label: "Password Changes", description: "When your password is changed", email: true, push: true, sms: true },
      { label: "Withdrawal Alerts", description: "When a withdrawal is initiated", email: true, push: true, sms: true },
      { label: "Deposit Confirmed", description: "When a deposit is confirmed on-chain", email: true, push: true, sms: false },
    ],
  },
  {
    category: "Marketing",
    icon: Megaphone,
    items: [
      { label: "Promotions", description: "Special offers and bonus campaigns", email: true, push: false, sms: false },
      { label: "New Listings", description: "New token listing announcements", email: true, push: true, sms: false },
      { label: "Product Updates", description: "New features and platform updates", email: false, push: true, sms: false },
      { label: "Newsletter", description: "Weekly market insights and analysis", email: true, push: false, sms: false },
    ],
  },
]

type Notification = {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  metadata: Record<string, any> | null
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState(initialSettings)
  const [saved, setSaved] = useState(false)
  const [activeView, setActiveView] = useState<"inbox" | "settings">("inbox")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(true)

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => {
        if (d.notifications) setNotifications(d.notifications)
        setLoadingNotifs(false)
      })
      .catch(() => setLoadingNotifs(false))
  }, [])

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mark_all: true }),
    }).catch(() => {})
  }

  const toggleSetting = (catIdx: number, itemIdx: number, channel: "email" | "push" | "sms") => {
    const updated = [...settings]
    updated[catIdx].items[itemIdx][channel] = !updated[catIdx].items[itemIdx][channel]
    setSettings(updated)
    setSaved(false)
  }

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "withdrawal_rejected": return <AlertCircle className="h-5 w-5 text-destructive" />
      case "deposit_confirmed": return <CheckCheck className="h-5 w-5 text-[#0ecb81]" />
      case "trade": return <TrendingUp className="h-5 w-5 text-primary" />
      default: return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

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

            {/* View tabs: Inbox | Settings */}
            <div className="mb-6 flex items-center gap-4 border-b border-border">
              <button
                onClick={() => setActiveView("inbox")}
                className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition-colors ${activeView === "inbox" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Inbox className="h-4 w-4" />
                Inbox
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
                {activeView === "inbox" && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
              </button>
              <button
                onClick={() => setActiveView("settings")}
                className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition-colors ${activeView === "settings" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Bell className="h-4 w-4" />
                Settings
                {activeView === "settings" && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
              </button>
            </div>

            {/* INBOX VIEW */}
            {activeView === "inbox" && (
              <div>
                {/* Mark all as read */}
                {unreadCount > 0 && (
                  <div className="mb-4 flex justify-end">
                    <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                      <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
                    </button>
                  </div>
                )}

                {loadingNotifs ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No notifications yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">You will see important updates here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map(notif => (
                      <button
                        key={notif.id}
                        onClick={() => { if (!notif.read) markAsRead(notif.id) }}
                        className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${notif.read ? "border-border bg-card" : "border-primary/20 bg-primary/5"}`}
                      >
                        <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{notif.title}</h3>
                            {!notif.read && <Circle className="h-2 w-2 fill-primary text-primary" />}
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{notif.message}</p>
                          <p className="mt-1.5 text-[10px] text-muted-foreground/70">
                            {new Date(notif.created_at).toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS VIEW */}
            {activeView === "settings" && (<div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground">Notification Settings</h1>
              <button onClick={handleSave} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${saved ? "bg-[#0ecb81] text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>

            {/* Channel legend */}
            <div className="mb-6 flex items-center gap-6 rounded-xl border border-border bg-card px-5 py-3">
              <span className="text-xs font-medium text-muted-foreground">Channels:</span>
              <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-foreground">Email</span></div>
              <div className="flex items-center gap-1.5"><BellRing className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-foreground">Push</span></div>
              <div className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-foreground">SMS</span></div>
            </div>

            <div className="space-y-6">
              {settings.map((cat, catIdx) => (
                <div key={cat.category} className="rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
                    <cat.icon className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">{cat.category}</h2>
                  </div>
                  {cat.items.map((item, itemIdx) => (
                    <div key={item.label} className="flex items-center justify-between border-b border-border px-5 py-4 last:border-0">
                      <div className="flex-1 pr-4">
                        <div className="text-sm font-medium text-foreground">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        {(["email", "push", "sms"] as const).map(ch => (
                          <button key={ch} onClick={() => toggleSetting(catIdx, itemIdx, ch)} className={`relative h-5 w-9 rounded-full transition-colors ${item[ch] ? "bg-primary" : "bg-border"}`}>
                            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${item[ch] ? "translate-x-4" : "translate-x-0.5"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Do Not Disturb */}
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Do Not Disturb</h3>
                  <p className="text-xs text-muted-foreground">Mute all push and SMS notifications during set hours</p>
                </div>
                <button className="relative h-5 w-9 rounded-full bg-border transition-colors"><div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" /></button>
              </div>
            </div>
            </div>)}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
