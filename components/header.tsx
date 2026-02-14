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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navItems = [
  {
    label: "Buy Crypto",
    href: "#",
    children: [
      { label: "Express Buy", href: "#" },
      { label: "P2P Trading", href: "#" },
      { label: "Third Party", href: "#" },
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
      { label: "Spot Trading", href: "/trade" },
      { label: "Margin Trading", href: "/trade" },
      { label: "Derivatives", href: "/trade" },
      { label: "Copy Trading", href: "#" },
      { label: "Trading Bots", href: "#" },
    ],
  },
  {
    label: "Earn",
    href: "#",
    children: [
      { label: "Savings", href: "#" },
      { label: "Liquidity Mining", href: "#" },
      { label: "Launchpool", href: "#" },
    ],
  },
  {
    label: "Finance",
    href: "#",
  },
  {
    label: "More",
    href: "#",
    children: [
      { label: "Rewards Hub", href: "#" },
      { label: "Referral", href: "#" },
      { label: "Affiliates", href: "#" },
    ],
  },
]

export function Header() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

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

          if (currentUser) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", currentUser.id)
              .single()
            setIsAdmin(profile?.role === "admin")
          }
        } catch {
          // Auth not available yet
        }
      }
      getUser()

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user) setIsAdmin(false)
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
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                T
              </span>
            </div>
            <span className="text-xl font-bold text-foreground">Tryd</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
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
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3 w-3" />}
                </Link>

                {item.children && activeDropdown === item.label && (
                  <div className="absolute left-0 top-full z-50 min-w-[200px] rounded-lg border border-border bg-card p-2 shadow-xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <button className="hidden rounded-md p-2 text-muted-foreground hover:text-foreground lg:block">
            <Search className="h-4 w-4" />
          </button>

          {user ? (
            /* Logged in state */
            <div className="flex items-center gap-2">
              <Link href="/wallet">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden text-muted-foreground hover:text-foreground lg:flex"
                >
                  <Wallet className="mr-1.5 h-4 w-4" />
                  Wallet
                </Button>
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden text-sm lg:block">
                    {displayName}
                  </span>
                  <ChevronDown className="hidden h-3 w-3 lg:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-card p-2 shadow-xl">
                      <div className="border-b border-border px-3 pb-2 pt-1">
                        <p className="text-sm font-medium text-foreground">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <div className="pt-2">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/wallet"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Wallet className="h-4 w-4" />
                          Wallet
                        </Link>
                        <Link
                          href="/kyc"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Shield className="h-4 w-4" />
                          KYC Verification
                        </Link>
                        <Link
                          href="/support"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Support
                        </Link>
                        <Link
                          href="#"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
                          >
                            <Shield className="h-4 w-4" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
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
            /* Logged out state */
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          <button className="hidden rounded-md p-2 text-muted-foreground hover:text-foreground lg:block">
            <Download className="h-4 w-4" />
          </button>
          <button className="hidden rounded-md p-2 text-muted-foreground hover:text-foreground lg:block">
            <Globe className="h-4 w-4" />
          </button>

          {/* Mobile toggle */}
          <button
            className="rounded-md p-2 text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block rounded-md px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setMobileOpen(false)}
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
      )}
    </header>
  )
}
