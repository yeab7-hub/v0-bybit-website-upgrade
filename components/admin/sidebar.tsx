"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Shield,
  Activity,
  Settings,
  ArrowLeft,
  MessageCircle,
  ArrowLeftRight,
} from "lucide-react"

const navLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/admin/kyc", label: "KYC Review", icon: Shield },
  { href: "/admin/support", label: "Support Tickets", icon: MessageCircle },
  { href: "/admin/activity", label: "Activity Logs", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <img
          src="/images/bybit-logo.png"
          alt="Bybit"
          className="h-5"
        />
        <div className="h-4 w-px bg-border" />
        <p className="text-xs font-medium text-muted-foreground">Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <div className="flex flex-col gap-1">
          {navLinks.map((link) => {
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
          Bybit 2026
        </p>
      </div>
    </aside>
  )
}
