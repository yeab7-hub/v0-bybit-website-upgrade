"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, Shield, Bell, Key, User, FileText, Wallet, Gift, Users, LayoutDashboard } from "lucide-react"

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Assets", href: "/wallet", icon: Wallet },
  { label: "Orders", href: "/orders", icon: FileText },
  { divider: true, label: "divider-1" },
  { label: "Profile Settings", href: "/account/settings", icon: Settings },
  { label: "Security", href: "/account/security", icon: Shield },
  { label: "Notifications", href: "/account/notifications", icon: Bell },
  { label: "API Management", href: "/account/api-management", icon: Key },
  { label: "Identity Verification", href: "/kyc", icon: User },
  { divider: true, label: "divider-2" },
  { label: "Referral", href: "/referral", icon: Users },
  { label: "Rewards Hub", href: "/rewards", icon: Gift },
]

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-20 flex flex-col gap-0.5">
        {menuItems.map((item) => {
          if ('divider' in item && item.divider) {
            return <div key={item.label} className="my-2 border-t border-border" />
          }
          const active = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href!}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-secondary-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
