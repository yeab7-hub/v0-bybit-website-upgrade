"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Clock, ChevronRight, Tag } from "lucide-react"
import { useState } from "react"

const tags = ["All", "Product Updates", "Market Insights", "Tutorials", "Partnerships", "Events", "Research"]

const posts = [
  { title: "Bybit Launches New Copy Trading Pro Features", desc: "We are excited to introduce enhanced copy trading capabilities including multi-strategy support and advanced risk controls.", tag: "Product Updates", date: "Feb 15, 2026", readTime: "3 min", featured: true, gradient: "from-primary/20 to-amber-600/20" },
  { title: "Weekly Market Wrap: BTC Breaks New Highs", desc: "Bitcoin surges past key resistance levels as institutional demand continues to grow. Here is our analysis.", tag: "Market Insights", date: "Feb 14, 2026", readTime: "5 min", featured: true, gradient: "from-blue-500/20 to-cyan-600/20" },
  { title: "How to Use Grid Trading Bot Effectively", desc: "A step-by-step guide to maximizing your returns with our automated grid trading bot feature.", tag: "Tutorials", date: "Feb 13, 2026", readTime: "8 min", featured: true, gradient: "from-green-500/20 to-emerald-600/20" },
  { title: "Bybit Partners with Major European Bank", desc: "New partnership enables seamless fiat on-ramp for European users.", tag: "Partnerships", date: "Feb 12, 2026", readTime: "2 min", featured: false },
  { title: "Understanding the New Fee Tier Structure", desc: "Breaking down the updated VIP fee schedule and how it benefits active traders.", tag: "Product Updates", date: "Feb 11, 2026", readTime: "4 min", featured: false },
  { title: "ETH Staking Rewards Update for Q1 2026", desc: "Latest staking yields and upcoming changes to Ethereum staking on Bybit.", tag: "Market Insights", date: "Feb 10, 2026", readTime: "3 min", featured: false },
  { title: "Bybit Global Trading Competition Results", desc: "Congratulations to all winners. See the final leaderboard and prize distribution.", tag: "Events", date: "Feb 9, 2026", readTime: "2 min", featured: false },
  { title: "Deep Dive: Layer 2 Token Performance", desc: "Research analysis on the top performing Layer 2 tokens and their outlook.", tag: "Research", date: "Feb 8, 2026", readTime: "10 min", featured: false },
  { title: "New Listing: PYTH Token on Bybit", desc: "PYTH is now available for spot trading with zero-fee promotion.", tag: "Product Updates", date: "Feb 7, 2026", readTime: "2 min", featured: false },
  { title: "Risk Management Best Practices for 2026", desc: "Expert strategies to protect your portfolio in volatile markets.", tag: "Tutorials", date: "Feb 6, 2026", readTime: "7 min", featured: false },
  { title: "Bybit at Consensus 2026: Event Recap", desc: "Highlights from our presence at the world's largest crypto conference.", tag: "Events", date: "Feb 5, 2026", readTime: "4 min", featured: false },
  { title: "DeFi Market Quarterly Report", desc: "Comprehensive analysis of DeFi protocols, TVL trends, and yield opportunities.", tag: "Research", date: "Feb 4, 2026", readTime: "12 min", featured: false },
]

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState("All")
  const featured = posts.filter(p => p.featured)
  const filtered = posts.filter(p => !p.featured && (activeTag === "All" || p.tag === activeTag))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-16">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Bybit Blog</h1>
            <p className="mt-2 text-sm text-muted-foreground">Latest news, updates, insights, and research from Bybit.</p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-8 lg:py-12">
          {/* Featured */}
          <div className="mb-12 grid gap-4 md:grid-cols-3">
            {featured.map((p) => (
              <Link key={p.title} href="/blog" className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/30">
                <div className={`h-40 bg-gradient-to-br ${p.gradient}`} />
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{p.tag}</span>
                    <span className="text-[10px] text-muted-foreground">{p.date}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-foreground group-hover:text-primary">{p.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-3 w-3" />{p.readTime} read</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Tags */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${activeTag === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {t === "All" ? null : <Tag className="h-3 w-3" />} {t}
              </button>
            ))}
          </div>

          {/* Articles */}
          <div className="flex flex-col gap-3">
            {filtered.map((p) => (
              <Link key={p.title} href="/blog" className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{p.tag}</span>
                    <span className="text-[10px] text-muted-foreground">{p.date}</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" />{p.readTime}</span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-medium text-foreground group-hover:text-primary">{p.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{p.desc}</p>
                </div>
                <ChevronRight className="ml-4 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
