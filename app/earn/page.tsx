"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import {
  Search, SlidersHorizontal, LayoutGrid, ChevronDown, ChevronRight,
  ArrowRight, Home, LineChart, TrendingUp, Coins, Wallet, Flame,
} from "lucide-react"
import { MarketAsset } from "@/components/market-asset"
import { BottomNav } from "@/components/bottom-nav"

type EarnCategory = "easy" | "onchain" | "advanced"
type ProductTab = "steady" | "topGains" | "vip"

const featuredProducts = [
  { pair: "BTC-USDT", type: "Dual Asset Buy Low", apy: "401.85%", page: "1/2", icon: "BTC" },
  { pair: "USDC", type: "Mantle Vault", apy: "4.34%", icon: "USDC" },
  { pair: "USDT", type: "Mantle Vault", apy: "3.89%", icon: "USDT" },
]

const earnProducts = [
  {
    coin: "BTC", name: "Bitcoin",
    products: [
      { type: "Easy Earn", term: "Flexible", apr: "2.30%" },
      { type: "Easy Earn", term: "30 Days", apr: "3.80%" },
      { type: "Easy Earn", term: "60 Days", apr: "4.50%" },
    ],
  },
  {
    coin: "ETH", name: "Ethereum",
    products: [
      { type: "Easy Earn", term: "Flexible", apr: "2.80%" },
      { type: "Easy Earn", term: "30 Days", apr: "5.50%" },
    ],
  },
  {
    coin: "USDT", name: "Tether",
    products: [
      { type: "Easy Earn", term: "Flexible", apr: "8.20%" },
      { type: "Easy Earn", term: "7 Days", apr: "10.50%" },
      { type: "Easy Earn", term: "30 Days", apr: "12.50%" },
    ],
  },
  {
    coin: "SOL", name: "Solana",
    products: [
      { type: "Easy Earn", term: "Flexible", apr: "3.20%" },
      { type: "Easy Earn", term: "30 Days", apr: "7.80%" },
    ],
  },
  {
    coin: "USDC", name: "USD Coin",
    products: [
      { type: "Easy Earn", term: "Flexible", apr: "7.80%" },
      { type: "Easy Earn", term: "30 Days", apr: "11.20%" },
    ],
  },
  {
    coin: "AVAX", name: "Avalanche",
    products: [
      { type: "Easy Earn", term: "Flexible", apr: "3.80%" },
    ],
  },
]

export default function EarnPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState<EarnCategory>("easy")
  const [productTab, setProductTab] = useState<ProductTab>("steady")
  const [expandedCoin, setExpandedCoin] = useState<string | null>("BTC")
  const [autoEarn, setAutoEarn] = useState(true)

  const filteredProducts = searchQuery
    ? earnProducts.filter(p => p.coin.toLowerCase().includes(searchQuery.toLowerCase()) || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : earnProducts



  const categories: { id: EarnCategory; label: string; hot?: boolean }[] = [
    { id: "easy", label: "Easy Earn" },
    { id: "onchain", label: "On-Chain Earn" },
    { id: "advanced", label: "Advanced Earn", hot: true },
  ]

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Desktop header */}
      <div className="hidden lg:block">
        <Header />
      </div>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="flex flex-1 flex-col pb-16 lg:hidden">
        {/* Search Bar */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Please enter your preferred coin"
              className="w-full rounded-lg border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#f7a600] focus:outline-none"
            />
          </div>
          <button className="rounded-lg border border-border p-2.5">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="rounded-lg border border-border p-2.5">
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Total Earn + Auto-Earn */}
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="text-sm text-muted-foreground">Total Earn Asset 0.00 USD</span>
          <span className="text-sm text-muted-foreground">|</span>
          <span className="text-sm text-muted-foreground">Auto-Earn</span>
          <button onClick={() => setAutoEarn(!autoEarn)} className="flex items-center gap-1 rounded-full bg-[#f7a600]/10 px-2 py-0.5 text-xs font-medium text-[#f7a600]">
            {autoEarn ? "On" : "Off"} <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Category Icons */}
        <div className="flex items-center justify-around px-4 py-4">
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)} className="flex flex-col items-center gap-2">
              <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${category === c.id ? "bg-[#f7a600]/10" : "bg-secondary"}`}>
                {c.id === "easy" && (
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-foreground">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
                {c.id === "onchain" && (
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-foreground">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
                {c.id === "advanced" && (
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-foreground">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                )}
                {c.hot && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 py-0.5 text-[8px] font-bold text-white">Hot</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </button>
          ))}
        </div>

        {/* Featured Products Cards */}
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-none">
          {/* Left large card */}
          <div className="shrink-0 rounded-xl border border-border bg-card p-4" style={{ minWidth: "200px" }}>
            <div className="mb-2 flex items-center justify-between">
              <MarketAsset symbol="BTC" size={28} />
              <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">1/2</span>
            </div>
            <p className="text-sm font-bold text-foreground">BTC-USDT</p>
            <p className="text-xs text-muted-foreground">Dual Asset Buy Low</p>
            <p className="mt-2 text-2xl font-bold text-success">401.85%</p>
          </div>
          {/* Right stacked cards */}
          <div className="flex shrink-0 flex-col gap-3">
            <div className="rounded-xl border border-border bg-card p-4" style={{ minWidth: "180px" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MarketAsset symbol="USDC" size={24} />
                  <span className="text-sm font-bold text-foreground">USDC</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Mantle Vault</p>
                  <p className="text-lg font-bold text-success">4.34%</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4" style={{ minWidth: "180px" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MarketAsset symbol="USDT" size={24} />
                  <span className="text-sm font-bold text-foreground">USDT</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Mantle Vault</p>
                  <p className="text-lg font-bold text-success">3.89%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Banner */}
        <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f7a600]/10">
            <Flame className="h-5 w-5 text-[#f7a600]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground">Events</p>
            <p className="text-sm text-foreground">{"BYUSDT: Earn while you trade"} <ArrowRight className="inline h-3.5 w-3.5" /></p>
          </div>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">1/4</span>
        </div>

        {/* Explore Products */}
        <div className="border-t border-border px-4 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Explore Products</h2>
            <button className="p-1.5 text-muted-foreground"><SlidersHorizontal className="h-4 w-4" /></button>
          </div>

          {/* Product Tabs */}
          <div className="mb-4 flex items-center gap-3">
            <button onClick={() => setProductTab("steady")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${productTab === "steady" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
              Steady Returns
            </button>
            <button onClick={() => setProductTab("topGains")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${productTab === "topGains" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
              Top Gains
            </button>
            <button onClick={() => setProductTab("vip")}
              className={`px-4 py-1.5 text-sm font-medium text-[#f7a600]`}>
              VIP Exclusive
            </button>
          </div>

          {/* Product List - Expandable Cards */}
          <div className="flex flex-col gap-0">
            {filteredProducts.map((product) => (
              <div key={product.coin} className="border-b border-border">
                {/* Header row */}
                <button
                  onClick={() => setExpandedCoin(expandedCoin === product.coin ? null : product.coin)}
                  className="flex w-full items-center justify-between py-4"
                >
                  <div className="flex items-center gap-3">
                    <MarketAsset symbol={product.coin} size={32} />
                    <span className="text-base font-bold text-foreground">{product.coin}</span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedCoin === product.coin ? "rotate-180" : ""}`} />
                </button>

                {/* Expanded products */}
                {expandedCoin === product.coin && (
                  <div className="pb-3">
                    {product.products.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2.5 pl-11">
                        <div>
                          <p className="text-xs text-muted-foreground">{p.type}</p>
                          <p className="text-sm font-semibold text-foreground">{p.term}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">APR</p>
                            <p className="font-mono text-sm font-bold text-success">{p.apr}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden flex-1 lg:block">
        <main className="mx-auto max-w-7xl px-6 py-8">
          {/* Search + Total + Auto-Earn */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search coin..."
                  className="rounded-lg border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#f7a600] focus:outline-none"
                />
              </div>
              <span className="text-sm text-muted-foreground">Total Earn Asset: 0.00 USD</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Auto-Earn</span>
                <button onClick={() => setAutoEarn(!autoEarn)} className="flex items-center gap-1 rounded-full bg-[#f7a600]/10 px-2.5 py-1 text-xs font-medium text-[#f7a600]">
                  {autoEarn ? "On" : "Off"} <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Category + Featured */}
          <div className="mb-8 flex items-start gap-8">
            {/* Category buttons */}
            <div className="flex gap-6">
              {categories.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.id)} className="flex flex-col items-center gap-2">
                  <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${category === c.id ? "bg-[#f7a600]/10" : "bg-secondary"}`}>
                    {c.id === "easy" && (
                      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-foreground"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    )}
                    {c.id === "onchain" && (
                      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-foreground"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /></svg>
                    )}
                    {c.id === "advanced" && (
                      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-foreground"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                    )}
                    {c.hot && <span className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 py-0.5 text-[8px] font-bold text-white">Hot</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                </button>
              ))}
            </div>

            {/* Featured cards - desktop */}
            <div className="flex flex-1 gap-4">
              <div className="flex-1 rounded-xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <MarketAsset symbol="BTC" size={32} />
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">1/2</span>
                </div>
                <p className="text-base font-bold text-foreground">BTC-USDT</p>
                <p className="text-sm text-muted-foreground">Dual Asset Buy Low</p>
                <p className="mt-3 text-3xl font-bold text-success">401.85%</p>
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MarketAsset symbol="USDC" size={28} />
                      <span className="text-base font-bold text-foreground">USDC</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Mantle Vault</p>
                      <p className="text-xl font-bold text-success">4.34%</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MarketAsset symbol="USDT" size={28} />
                      <span className="text-base font-bold text-foreground">USDT</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Mantle Vault</p>
                      <p className="text-xl font-bold text-success">3.89%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Events */}
          <div className="mb-8 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f7a600]/10">
              <Flame className="h-6 w-6 text-[#f7a600]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Events</p>
              <p className="text-base text-foreground">{"BYUSDT: Earn while you trade"} <ArrowRight className="inline h-4 w-4" /></p>
            </div>
            <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">1/4</span>
          </div>

          {/* Explore Products */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Explore Products</h2>
              <button className="p-2 text-muted-foreground"><SlidersHorizontal className="h-5 w-5" /></button>
            </div>
            <div className="mb-6 flex items-center gap-4">
              <button onClick={() => setProductTab("steady")}
                className={`rounded-full px-5 py-2 text-sm font-medium ${productTab === "steady" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
                Steady Returns
              </button>
              <button onClick={() => setProductTab("topGains")}
                className={`rounded-full px-5 py-2 text-sm font-medium ${productTab === "topGains" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
                Top Gains
              </button>
              <button onClick={() => setProductTab("vip")}
                className="px-5 py-2 text-sm font-medium text-[#f7a600]">
                VIP Exclusive
              </button>
            </div>

            {/* Product Table - Desktop */}
            <div className="rounded-xl border border-border bg-card">
              {filteredProducts.map((product) => (
                <div key={product.coin} className="border-b border-border last:border-0">
                  <button
                    onClick={() => setExpandedCoin(expandedCoin === product.coin ? null : product.coin)}
                    className="flex w-full items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <MarketAsset symbol={product.coin} size={36} />
                      <div>
                        <span className="text-base font-bold text-foreground">{product.coin}</span>
                        <span className="ml-2 text-sm text-muted-foreground">{product.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-sm text-muted-foreground">{product.products.length} products</span>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedCoin === product.coin ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {expandedCoin === product.coin && (
                    <div className="border-t border-border bg-secondary/10 px-6 pb-4 pt-2">
                      {product.products.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-border/50 py-3 last:border-0">
                          <div className="flex items-center gap-8">
                            <div className="w-28">
                              <p className="text-xs text-muted-foreground">{p.type}</p>
                              <p className="text-sm font-semibold text-foreground">{p.term}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div>
                              <p className="text-xs text-muted-foreground">APR</p>
                              <p className="font-mono text-base font-bold text-success">{p.apr}</p>
                            </div>
                            <Link href="/register" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-[#f7a600] hover:text-[#f7a600]">
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <BottomNav />
    </div>
  )
}
