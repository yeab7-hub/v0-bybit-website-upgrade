"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, TrendingUp, BarChart3, Coins, Wallet } from "lucide-react"

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Markets", icon: TrendingUp, href: "/markets" },
  { label: "Trade", icon: BarChart3, href: "/trade" },
  { label: "Earn", icon: Coins, href: "/earn" },
  { label: "Assets", icon: Wallet, href: "/wallet" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-40 flex items-center justify-around border-t border-border bg-background py-2 lg:hidden">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <item.icon
              className={`h-5 w-5 ${isActive ? "text-foreground" : "text-muted-foreground"}`}
            />
            <span
              className={`text-[10px] ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
