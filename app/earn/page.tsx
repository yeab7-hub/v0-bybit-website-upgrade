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

const earnProducts: { coin: string; name: string; products: { type: string; term: string; apr: string }[] }[] = []

export default function EarnPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState<EarnCategory>("easy")
  const [productTab, setProductTab] = useState<ProductTab>("steady")
  const [expandedCoin, setExpandedCoin] = useState<string | null>("BTC")

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
          <span className="text-sm text-muted-foreground">Earn balance: not connected</span>
          <span className="text-sm text-muted-foreground">|</span>
          <span className="text-sm text-muted-foreground">Auto-Earn</span>
          <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">Not configured</span>
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

        <div className="mx-4 my-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h2 className="font-semibold text-foreground">Earn products unavailable</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Live products, current APRs, subscription orders, and yield accounting are not connected. No estimated or promotional yield is shown as an available offer.</p>
          <Link href="/support" className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-sm text-foreground hover:bg-secondary">Contact support</Link>
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
            {filteredProducts.length === 0 && <p className="rounded-lg border border-border p-5 text-center text-sm text-muted-foreground">No live earn products are configured.</p>}
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
                <span className="text-sm text-muted-foreground">Auto-Earn: not configured</span>
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

            <div className="flex-1 rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
              <h2 className="font-semibold text-foreground">Earn products unavailable</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Live product data, current APRs, subscription orders, and yield accounting are not connected. No estimated yield is offered as a live product.</p>
              <Link href="/support" className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-sm text-foreground hover:bg-secondary">Contact support</Link>
            </div>
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
              {filteredProducts.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No live earn products are configured.</p>}
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
