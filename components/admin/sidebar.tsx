"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import useSWR from "swr"
import {
  LayoutDashboard,
  Users,
  Shield,
  Activity,
  Settings,
  ArrowLeft,
  MessageCircle,
  ArrowLeftRight,
  Bell,
  X,
  Headphones,
  TrendingUp,
} from "lucide-react"

import { BybitLogo } from "@/components/bybit-logo"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface NavLink {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  superAdminOnly?: boolean
}

const navLinks: NavLink[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/trades", label: "Trade Management", icon: TrendingUp },
  { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/admin/kyc", label: "KYC Review", icon: Shield },
  { href: "/admin/chat", label: "Live Chat", icon: Headphones },
  { href: "/admin/support", label: "Support Tickets", icon: MessageCircle },
  { href: "/admin/activity", label: "Activity Logs", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings, superAdminOnly: true },
]

interface Notification {
  id: string
  subject: string
  event: string
  user_email: string
  details: Record<string, string>
  read: boolean
  created_at: string
}

export function AdminSidebar({ role }: { role?: string }) {
  const pathname = usePathname()
  const [bellOpen, setBellOpen] = useState(false)
  const { data: notifData, mutate } = useSWR<{ notifications: Notification[] }>(
    "/api/admin/notifications",
    fetcher,
    { refreshInterval: 10000 }
  )
  const notifications = notifData?.notifications ?? []
  const unread = notifications.filter((n) => !n.read).length

  const isSuperAdmin = role === "super_admin"
  const filteredLinks = navLinks.filter(
    (link) => !link.superAdminOnly || isSuperAdmin
  )

  const markRead = async (id: string) => {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    mutate()
  }

  const markAllRead = async () => {
    await Promise.all(notifications.filter((n) => !n.read).map((n) => markRead(n.id)))
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <BybitLogo className="h-5" />
          <div className="h-4 w-px bg-border" />
          <p className="text-xs font-medium text-muted-foreground">
            {isSuperAdmin ? "Master Admin" : "Admin"}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#f7a600] px-1 text-[9px] font-bold text-[#0a0e17]">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-[#f7a600] hover:underline">
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setBellOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs text-muted-foreground">No notifications yet</p>
                ) : (
                  notifications.slice(0, 20).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors hover:bg-secondary/50 ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        {!n.read && <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f7a600]" />}
                        <span className="text-xs font-medium text-foreground">{n.event}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{n.user_email}</p>
                      <p className="text-[10px] text-muted-foreground/70">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <div className="flex flex-col gap-1">
          {filteredLinks.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-4">
        <Link
          href="/trade"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Platform
        </Link>
        <p className="mt-3 px-3 text-[10px] text-muted-foreground/60">
          &copy; 2026 Bybit
        </p>
      </div>
    </aside>
  )
}
