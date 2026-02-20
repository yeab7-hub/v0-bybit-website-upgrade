"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Menu, X, Search, Download, Globe, User, LogOut, Wallet, LayoutDashboard, Shield, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { BybitLogo } from "@/components/bybit-logo"

const navLinks = [
  { label: "Buy Crypto", href: "/buy-crypto" },
  { label: "Markets", href: "/trade" },
  {
    label: "Trade", href: "/trade",
    children: [
      { label: "Spot", href: "/trade" },
      { label: "Derivatives", href: "/trade" },
      { label: "Copy Trading", href: "/trade" },
      { label: "Trading Bots", href: "/trade" },
    ],
  },
  {
    label: "Earn", href: "/earn",
    children: [
      { label: "Easy Earn", href: "/earn" },
      { label: "On-Chain Earn", href: "/earn" },
      { label: "Launchpool", href: "/earn" },
    ],
  },
  { label: "Finance", href: "/finance" },
  {
    label: "More", href: "/about",
    children: [
      { label: "Rewards Hub", href: "/earn" },
      { label: "Referral", href: "/finance" },
      { label: "About Us", href: "/about" },
    ],
  },
]

export function Header() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => setUser(data.user)).catch(() => {})
      const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
      sub = data.subscription
    } catch {}
    return () => sub?.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try { const supabase = createClient(); await supabase.auth.signOut() } catch {}
    setUserMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const initials = (user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="shrink-0">
            <BybitLogo className="h-[18px]" />
          </Link>
          <nav className="hidden items-center lg:flex">
            {navLinks.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-0.5 px-3 py-4 text-[13px] font-medium text-secondary-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3 w-3 opacity-40" />}
                </Link>
                {item.children && hoveredNav === item.label && (
                  <div className="absolute left-0 top-full z-50 min-w-[180px] rounded-lg border border-border bg-card py-1 shadow-xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2.5 text-[13px] text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button className="hidden p-2 text-muted-foreground hover:text-foreground lg:block" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>

          {user ? (
            <div className="flex items-center gap-1">
              <Link href="/wallet" className="hidden lg:block">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-secondary-foreground hover:text-foreground">
                  <Wallet className="h-3.5 w-3.5" /> Assets
                </Button>
              </Link>
              <Link href="/trade" className="hidden lg:block">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-secondary-foreground hover:text-foreground">
                  Trade
                </Button>
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 rounded-md p-2 text-secondary-foreground hover:text-foreground"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                    {initials}
                  </div>
                  <ChevronDown className="hidden h-3 w-3 lg:block" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-border bg-card py-1 shadow-xl">
                      <div className="border-b border-border px-4 pb-3 pt-2">
                        <p className="text-sm font-medium text-foreground">{user.user_metadata?.full_name || user.email?.split("@")[0]}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      {[
                        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                        { href: "/wallet", icon: Wallet, label: "Assets" },
                        { href: "/kyc", icon: Shield, label: "Verification" },
                        { href: "/support", icon: MessageCircle, label: "Support" },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-secondary-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <item.icon className="h-4 w-4" /> {item.label}
                        </Link>
                      ))}
                      <div className="my-1 border-t border-border" />
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" /> Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 text-[13px] font-medium text-secondary-foreground hover:text-foreground">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="h-8 rounded-md bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          <button className="hidden p-2 text-muted-foreground hover:text-foreground lg:block" aria-label="Download">
            <Download className="h-4 w-4" />
          </button>
          <button className="hidden p-2 text-muted-foreground hover:text-foreground lg:block" aria-label="Language">
            <Globe className="h-4 w-4" />
          </button>

          <button className="p-2 text-secondary-foreground lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-6 pt-3 lg:hidden">
          <nav className="flex flex-col">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-3 text-sm font-medium text-foreground"
              >
                {item.label}
                {item.children && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </Link>
            ))}
          </nav>
          {!user && (
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full border-border text-foreground">Log In</Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
