"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Search, BookOpen, TrendingUp, Shield, Zap, ChevronRight, Play, Clock, BarChart3, Coins, Layers, GraduationCap } from "lucide-react"
import { useState } from "react"

const categories = [
  { label: "All", icon: Layers },
  { label: "Beginner", icon: BookOpen },
  { label: "Trading", icon: TrendingUp },
  { label: "Blockchain", icon: Zap },
  { label: "Security", icon: Shield },
  { label: "DeFi", icon: Coins },
]

const featuredArticles = [
  { title: "What Is Bitcoin and How Does It Work?", desc: "A comprehensive guide to understanding the world's first cryptocurrency, its technology, and its impact on finance.", category: "Beginner", readTime: "8 min", image: "bg-gradient-to-br from-amber-500/20 to-orange-600/20" },
  { title: "Understanding Spot Trading vs Futures Trading", desc: "Learn the key differences between spot and futures markets, and how to choose the right approach for your strategy.", category: "Trading", readTime: "12 min", image: "bg-gradient-to-br from-blue-500/20 to-cyan-600/20" },
  { title: "How to Secure Your Crypto Assets", desc: "Essential security practices every crypto trader should follow to protect their digital assets from threats.", category: "Security", readTime: "6 min", image: "bg-gradient-to-br from-green-500/20 to-emerald-600/20" },
]

const articles = [
  { title: "What Is Ethereum 2.0?", category: "Blockchain", readTime: "5 min" },
  { title: "Guide to Technical Analysis", category: "Trading", readTime: "15 min" },
  { title: "Understanding DeFi Protocols", category: "DeFi", readTime: "10 min" },
  { title: "How to Read Candlestick Charts", category: "Trading", readTime: "8 min" },
  { title: "What Are NFTs?", category: "Blockchain", readTime: "6 min" },
  { title: "Risk Management Strategies", category: "Trading", readTime: "12 min" },
  { title: "Introduction to Staking", category: "DeFi", readTime: "7 min" },
  { title: "What Is a Blockchain Wallet?", category: "Beginner", readTime: "5 min" },
  { title: "Understanding Market Orders vs Limit Orders", category: "Beginner", readTime: "4 min" },
  { title: "What Is Yield Farming?", category: "DeFi", readTime: "9 min" },
  { title: "How to Use Stop-Loss Orders", category: "Trading", readTime: "6 min" },
  { title: "Introduction to Layer 2 Solutions", category: "Blockchain", readTime: "11 min" },
]

const videos = [
  { title: "Getting Started with Bybit", duration: "5:30", views: "125K" },
  { title: "How to Place Your First Trade", duration: "8:12", views: "98K" },
  { title: "Copy Trading Tutorial", duration: "6:45", views: "76K" },
  { title: "Understanding Leverage", duration: "10:20", views: "142K" },
]

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [search, setSearch] = useState("")

  const filtered = articles.filter(a =>
    (activeCategory === "All" || a.category === activeCategory) &&
    (search === "" || a.title.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-12 text-center lg:py-20">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">Bybit Learn</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground lg:text-base">Your gateway to understanding crypto, blockchain, and trading strategies.</p>
            <div className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-8 lg:py-12">
          {/* Featured */}
          <h2 className="mb-6 text-lg font-semibold">Featured</h2>
          <div className="mb-12 grid gap-4 md:grid-cols-3">
            {featuredArticles.map((a) => (
              <Link key={a.title} href="/learn" className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/30">
                <div className={`h-36 ${a.image}`} />
                <div className="p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{a.category}</span>
                  <h3 className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary">{a.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {a.readTime} read
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Video Tutorials */}
          <h2 className="mb-6 text-lg font-semibold">Video Tutorials</h2>
          <div className="mb-12 grid gap-4 grid-cols-2 lg:grid-cols-4">
            {videos.map((v) => (
              <div key={v.title} className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-secondary to-muted">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 text-primary-foreground transition-transform group-hover:scale-110">
                    <Play className="h-4 w-4 ml-0.5" />
                  </div>
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">{v.duration}</span>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-1 text-[10px] text-muted-foreground">{v.views} views</p>
                </div>
              </div>
            ))}
          </div>

          {/* Categories + Articles */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((c) => (
              <button
                key={c.label}
                onClick={() => setActiveCategory(c.label)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${activeCategory === c.label ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                <c.icon className="h-3.5 w-3.5" /> {c.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <Link key={a.title} href="/learn" className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{a.category}</span>
                  <h3 className="mt-0.5 text-sm font-medium text-foreground group-hover:text-primary">{a.title}</h3>
                  <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-3 w-3" /> {a.readTime}</span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">No articles found. Try a different search or category.</div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
