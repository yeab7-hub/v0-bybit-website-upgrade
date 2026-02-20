"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  Menu,
  X,
  Globe,
  Search,
  Download,
  User,
  Settings,
  Shield,
  LogOut,
  Wallet,
  MessageCircle,
  LayoutDashboard,
  BarChart3,
  Layers,
  Copy,
  Bot,
  Coins,
  Rocket,
  CreditCard,
  Users,
  Gift,
  FileText,
  Landmark,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { BybitLogo } from "@/components/bybit-logo"

const navItems = [
  {
    label: "Buy Crypto",
    href: "/buy-crypto",
    children: [
      { label: "Express Buy", desc: "Buy crypto with card", icon: CreditCard, href: "/buy-crypto" },
      { label: "P2P Trading", desc: "Trade with other users", icon: Users, href: "/buy-crypto" },
    ],
  },
  {
    label: "Markets",
    href: "/trade",
  },
  {
    label: "Trade",
    href: "/trade",
    children: [
      { label: "Spot Trading", desc: "Buy and sell crypto", icon: BarChart3, href: "/trade" },
      { label: "Derivatives", desc: "Futures & perpetuals", icon: Layers, href: "/trade" },
      { label: "Copy Trading", desc: "Follow top traders", icon: Copy, href: "/trade" },
      { label: "Trading Bots", desc: "Automated strategies", icon: Bot, href: "/trade" },
    ],
  },
  {
    label: "Earn",
    href: "/earn",
    children: [
      { label: "Savings", desc: "Flexible & fixed", icon: Coins, href: "/earn" },
      { label: "Liquidity Mining", desc: "Provide liquidity", icon: Landmark, href: "/earn" },
      { label: "Launchpool", desc: "Stake to earn new tokens", icon: Rocket, href: "/earn" },
    ],
  },
  {
    label: "Finance",
    href: "/finance",
  },
  {
    label: "More",
    href: "/about",
    children: [
      { label: "Rewards Hub", desc: "Bonuses & rewards", icon: Gift, href: "/earn" },
      { label: "Referral", desc: "Invite and earn", icon: Users, href: "/finance" },
      { label: "About Us", desc: "Learn about Bybit", icon: FileText, href: "/about" },
    ],
  },
]

export function Header() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    try {
      const supabase = createClient()

      const getUser = async () => {
        try {
          const {
            data: { user: currentUser },
          } = await supabase.auth.getUser()
          setUser(currentUser)
        } catch {
          // Auth not available yet
        }
      }
      getUser()

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })
      subscription = data.subscription
    } catch {
      // Supabase not configured yet
    }

    return () => subscription?.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
    setUserMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User"

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-2.5 lg:px-6">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center">
            <BybitLogo className="h-5" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() =>
                  item.children && setActiveDropdown(item.label)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3 w-3 opacity-50" />}
                </Link>

                {item.children && activeDropdown === item.label && (
                  <div className="absolute left-0 top-full z-50 min-w-[260px] rounded-xl border border-border bg-card p-2 shadow-2xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary"
                      >
                        {"icon" in child && child.icon && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                            <child.icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {child.label}
                          </div>
                          {"desc" in child && (
                            <div className="text-xs text-muted-foreground">
                              {child.desc}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1.5">
          <button
            className="hidden rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:flex"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {user ? (
            <div className="flex items-center gap-1.5">
              <Link href="/wallet">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground lg:flex"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  Assets
                </Button>
              </Link>

              <Link href="/trade">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground lg:flex"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Trade
                </Button>
              </Link>

              {/* User avatar menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="hidden h-3 w-3 lg:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-border bg-card p-1.5 shadow-2xl">
                      <div className="border-b border-border px-3 pb-2.5 pt-1.5">
                        <p className="text-sm font-medium text-foreground">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <div className="pt-1.5">
                        {[
                          { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                          { href: "/wallet", icon: Wallet, label: "Wallet" },
                          { href: "/kyc", icon: Shield, label: "KYC Verification" },
                          { href: "/support", icon: MessageCircle, label: "Support" },
                        ].map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        ))}
                        <div className="my-1 border-t border-border" />
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="h-8 bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          <button
            className="hidden rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:flex"
            aria-label="Download app"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            className="hidden rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:flex"
            aria-label="Language"
          >
            <Globe className="h-4 w-4" />
          </button>

          {/* Mobile toggle */}
          <button
            className="rounded-lg p-2 text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-6 pt-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </Link>
              </div>
            ))}
          </nav>
          {!user && (
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full border-border text-foreground">
                  Log In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
