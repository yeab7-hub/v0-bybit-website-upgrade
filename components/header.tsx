"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown, Menu, X, Search, Download, Globe, User, LogOut, Wallet, LayoutDashboard,
  Shield, MessageCircle, Settings, Bell, Key, FileText, BarChart3, TrendingUp, Copy,
  Bot, Coins, Rocket, Layers, Gem, CreditCard, Users, Gift, BookOpen, Building2,
  ArrowLeftRight, CircleDollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { BybitLogo } from "@/components/bybit-logo"

const navLinks = [
  {
    label: "Buy Crypto", href: "/buy-crypto",
    children: [
      { label: "One-Click Buy", href: "/buy-crypto", icon: CircleDollarSign, desc: "Buy crypto with card or bank" },
      { label: "P2P Trading", href: "/p2p", icon: Users, desc: "Trade directly with other users" },
      { label: "Convert", href: "/convert", icon: ArrowLeftRight, desc: "Instant crypto conversion" },
    ],
  },
  { label: "Markets", href: "/markets" },
  {
    label: "Trade", href: "/trade",
    children: [
      { label: "Spot Trading", href: "/trade", icon: BarChart3, desc: "Buy and sell crypto at market price" },
      { label: "Derivatives", href: "/derivatives", icon: TrendingUp, desc: "Futures and perpetual contracts" },
      { label: "Copy Trading", href: "/copy-trading", icon: Copy, desc: "Follow top traders automatically" },
      { label: "Trading Bots", href: "/trading-bots", icon: Bot, desc: "Automated trading strategies" },
      { label: "Convert", href: "/convert", icon: ArrowLeftRight, desc: "Instant swap between tokens" },
    ],
  },
  {
    label: "Earn", href: "/earn",
    children: [
      { label: "Bybit Earn", href: "/earn", icon: Coins, desc: "Flexible and fixed savings" },
      { label: "Launchpad", href: "/launchpad", icon: Rocket, desc: "Subscribe to new token launches" },
      { label: "Launchpool", href: "/launchpool", icon: Layers, desc: "Stake to earn new tokens" },
    ],
  },
  {
    label: "Finance", href: "/finance",
    children: [
      { label: "Crypto Loans", href: "/finance", icon: CircleDollarSign, desc: "Borrow against your crypto" },
      { label: "Bybit Card", href: "/card", icon: CreditCard, desc: "Spend crypto anywhere" },
      { label: "Institutional", href: "/institutional", icon: Building2, desc: "Solutions for institutions" },
    ],
  },
  {
    label: "Web3", href: "/web3",
    children: [
      { label: "Web3 Wallet", href: "/web3", icon: Wallet, desc: "Non-custodial DeFi access" },
      { label: "NFT Marketplace", href: "/nft", icon: Gem, desc: "Buy, sell, and mint NFTs" },
    ],
  },
  {
    label: "More", href: "/about",
    children: [
      { label: "Rewards Hub", href: "/rewards", icon: Gift, desc: "Missions, coupons, and bonuses" },
      { label: "Referral", href: "/referral", icon: Users, desc: "Invite friends and earn" },
      { label: "Affiliates", href: "/affiliates", icon: CircleDollarSign, desc: "Earn up to 50% commission" },
      { label: "Learn", href: "/learn", icon: BookOpen, desc: "Crypto education center" },
      { label: "About Bybit", href: "/about", icon: Building2, desc: "Our story and mission" },
    ],
  },
]

const userMenuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/wallet", icon: Wallet, label: "Assets" },
  { href: "/asset-overview", icon: BarChart3, label: "Asset Overview" },
  { href: "/orders", icon: FileText, label: "Orders" },
  { href: "/account/settings", icon: Settings, label: "Settings" },
  { href: "/account/security", icon: Shield, label: "Security" },
  { href: "/account/notifications", icon: Bell, label: "Notifications" },
  { href: "/account/api-management", icon: Key, label: "API Management" },
  { href: "/kyc", icon: Shield, label: "Verification" },
  { href: "/referral", icon: Users, label: "Referral" },
  { href: "/rewards", icon: Gift, label: "Rewards Hub" },
  { href: "/support", icon: MessageCircle, label: "Support" },
]

export function Header() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const handleMouseEnter = (label: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setHoveredNav(label)
  }

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setHoveredNav(null), 150)
  }

  const initials = (user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()

  const searchPages = [
    { label: "Spot Trading", href: "/trade" }, { label: "Derivatives", href: "/derivatives" },
    { label: "Copy Trading", href: "/copy-trading" }, { label: "Markets", href: "/markets" },
    { label: "Buy Crypto", href: "/buy-crypto" }, { label: "P2P Trading", href: "/p2p" },
    { label: "Convert", href: "/convert" }, { label: "Earn", href: "/earn" },
    { label: "Launchpad", href: "/launchpad" }, { label: "Launchpool", href: "/launchpool" },
    { label: "Web3", href: "/web3" }, { label: "NFT", href: "/nft" },
    { label: "Trading Bots", href: "/trading-bots" }, { label: "Card", href: "/card" },
    { label: "Fee Schedule", href: "/fee-schedule" }, { label: "API Docs", href: "/api-docs" },
    { label: "Learn", href: "/learn" }, { label: "Blog", href: "/blog" },
    { label: "Support", href: "/support" }, { label: "About", href: "/about" },
    { label: "Announcements", href: "/announcements" }, { label: "Referral", href: "/referral" },
    { label: "Rewards Hub", href: "/rewards" }, { label: "Security", href: "/security-info" },
    { label: "Trading Rules", href: "/trading-rules" }, { label: "Careers", href: "/careers" },
    { label: "Affiliates", href: "/affiliates" }, { label: "Institutional", href: "/institutional" },
    { label: "Settings", href: "/account/settings" }, { label: "Notifications", href: "/account/notifications" },
    { label: "Orders", href: "/orders" }, { label: "Dashboard", href: "/dashboard" },
    { label: "Asset Overview", href: "/asset-overview" }, { label: "Account Settings", href: "/account/settings" },
    { label: "Account Security", href: "/account/security" }, { label: "API Management", href: "/account/api-management" },
  ]

  const filteredSearch = searchQuery.length > 0
    ? searchPages.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4">
        {/* Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
            <BybitLogo className="h-[18px]" />
          </Link>
          <nav className="hidden items-center lg:flex">
            {navLinks.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children ? handleMouseEnter(item.label) : undefined}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-0.5 px-2.5 py-4 text-[13px] font-medium text-secondary-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3 w-3 opacity-40" />}
                </Link>
                {/* Mega menu dropdown */}
                {item.children && hoveredNav === item.label && (
                  <div
                    className="absolute left-0 top-full z-50 min-w-[280px] rounded-xl border border-border bg-card py-2 shadow-2xl"
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-secondary"
                      >
                        {'icon' in child && child.icon && (
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                            <child.icon className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div>
                          <span className="text-[13px] font-medium text-foreground">{child.label}</span>
                          {'desc' in child && child.desc && (
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{child.desc}</p>
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

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <div className="relative hidden lg:block">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-muted-foreground hover:text-foreground" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
            {searchOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => { setSearchOpen(false); setSearchQuery("") }} />
                <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-border bg-card shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search pages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      autoFocus
                    />
                  </div>
                  {filteredSearch.length > 0 && (
                    <div className="max-h-64 overflow-y-auto py-1">
                      {filteredSearch.map((p) => (
                        <Link
                          key={p.href}
                          href={p.href}
                          onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                          className="block px-4 py-2 text-[13px] text-secondary-foreground hover:bg-secondary hover:text-foreground"
                        >
                          {p.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchQuery && filteredSearch.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">No results found</div>
                  )}
                </div>
              </>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-0.5">
              <Link href="/wallet" className="hidden lg:block">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-secondary-foreground hover:text-foreground">
                  <Wallet className="h-3.5 w-3.5" /> Assets
                </Button>
              </Link>
              <Link href="/orders" className="hidden lg:block">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-secondary-foreground hover:text-foreground">
                  <FileText className="h-3.5 w-3.5" /> Orders
                </Button>
              </Link>
              <Link href="/trade" className="hidden lg:block">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-secondary-foreground hover:text-foreground">
                  Trade
                </Button>
              </Link>

              {/* Notification bell */}
              <Link href="/account/notifications" className="hidden p-2 text-muted-foreground hover:text-foreground lg:block" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Link>

              {/* User dropdown */}
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
                    <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-card py-1 shadow-2xl">
                      <div className="border-b border-border px-4 pb-3 pt-2">
                        <p className="text-sm font-medium text-foreground">{user.user_metadata?.full_name || user.email?.split("@")[0]}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="max-h-72 overflow-y-auto py-1">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-secondary-foreground hover:bg-secondary hover:text-foreground"
                          >
                            <item.icon className="h-4 w-4" /> {item.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-border" />
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

          <button className="hidden p-2 text-muted-foreground hover:text-foreground lg:block" aria-label="Download App">
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

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-border bg-card px-4 pb-6 pt-3 lg:hidden">
          {/* Mobile search */}
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>

          <nav className="flex flex-col">
            {navLinks.map((item) => (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (item.children) {
                      setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                    } else {
                      router.push(item.href)
                      setMobileOpen(false)
                    }
                  }}
                  className="flex w-full items-center justify-between py-3 text-sm font-medium text-foreground"
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`} />
                  )}
                </button>
                {item.children && mobileExpanded === item.label && (
                  <div className="mb-2 flex flex-col gap-0.5 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg py-2.5 pl-2 text-[13px] text-secondary-foreground hover:text-foreground"
                      >
                        {'icon' in child && child.icon && <child.icon className="h-4 w-4 text-primary" />}
                        <div>
                          <span className="font-medium">{child.label}</span>
                          {'desc' in child && child.desc && (
                            <p className="text-[10px] text-muted-foreground">{child.desc}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile user section */}
          {user ? (
            <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
              {userMenuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg py-2.5 text-[13px] text-secondary-foreground hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="mt-2 flex items-center gap-2.5 py-2.5 text-[13px] text-destructive"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
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
