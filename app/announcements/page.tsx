"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Bell, ChevronRight, Pin, Clock, Filter } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const categories = ["All", "New Listings", "Maintenance", "Product Updates", "Events", "Delistings", "API Changes"]

const announcements = [
  { title: "Scheduled System Maintenance - Feb 22, 2026", category: "Maintenance", date: "Feb 21, 2026", pinned: true, desc: "We will perform scheduled maintenance on our trading engine from 06:00-06:30 UTC." },
  { title: "New Listing: PYTH/USDT Perpetual Contract", category: "New Listings", date: "Feb 20, 2026", pinned: true, desc: "Bybit will list PYTH/USDT perpetual contract with up to 25x leverage." },
  { title: "Bybit Trading Competition: $1M Prize Pool", category: "Events", date: "Feb 19, 2026", pinned: false, desc: "Join our biggest trading competition ever. Compete for a share of $1M in prizes." },
  { title: "API Rate Limit Update - Effective March 1", category: "API Changes", date: "Feb 18, 2026", pinned: false, desc: "We are updating API rate limits for improved stability. Please review the changes." },
  { title: "New Feature: Advanced Copy Trading Filters", category: "Product Updates", date: "Feb 17, 2026", pinned: false, desc: "Now filter master traders by risk score, drawdown, and Sharpe ratio." },
  { title: "Delisting Notice: XYZ/USDT", category: "Delistings", date: "Feb 16, 2026", pinned: false, desc: "XYZ/USDT spot pair will be delisted on March 1, 2026. Please close positions." },
  { title: "Margin Requirements Update for BTC Futures", category: "Product Updates", date: "Feb 15, 2026", pinned: false, desc: "Initial margin requirements for BTC perpetual contracts will be adjusted." },
  { title: "New Listing: ARB/USDT Spot Trading", category: "New Listings", date: "Feb 14, 2026", pinned: false, desc: "ARB/USDT spot trading pair is now live with zero-fee promotion until March 1." },
  { title: "Earn Product Update: New Fixed-Term Staking", category: "Product Updates", date: "Feb 13, 2026", pinned: false, desc: "New 90-day fixed-term staking products available for ETH, SOL, and AVAX." },
  { title: "Mobile App v4.5 Release", category: "Product Updates", date: "Feb 12, 2026", pinned: false, desc: "Updated trading charts, improved notification settings, and bug fixes." },
  { title: "Bybit Campus Ambassador Program Launch", category: "Events", date: "Feb 11, 2026", pinned: false, desc: "University students can now apply to become Bybit campus ambassadors." },
  { title: "Maintenance Complete - All Systems Operational", category: "Maintenance", date: "Feb 10, 2026", pinned: false, desc: "Scheduled maintenance has been completed. All services are running normally." },
]

export default function AnnouncementsPage() {
  const [category, setCategory] = useState("All")
  const pinned = announcements.filter(a => a.pinned)
  const filtered = announcements.filter(a => !a.pinned && (category === "All" || a.category === category))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-14">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Bell className="h-5 w-5 text-primary" /></div>
              <div>
                <h1 className="text-2xl font-bold lg:text-3xl">Announcements</h1>
                <p className="text-xs text-muted-foreground">Stay informed about platform updates, new listings, and events.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-8 lg:py-12">
          {/* Pinned */}
          {pinned.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold"><Pin className="h-3.5 w-3.5 text-primary" /> Pinned</h2>
              <div className="flex flex-col gap-2">
                {pinned.map((a) => (
                  <Link key={a.title} href="/announcements" className="group flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4 transition-colors hover:border-primary/40">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{a.category}</span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" />{a.date}</span>
                      </div>
                      <h3 className="mt-1.5 text-sm font-semibold text-foreground group-hover:text-primary">{a.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{a.desc}</p>
                    </div>
                    <ChevronRight className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category filter */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{c}</button>
            ))}
          </div>

          {/* List */}
          <div className="flex flex-col gap-2">
            {filtered.map((a) => (
              <Link key={a.title} href="/announcements" className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{a.category}</span>
                    <span className="text-[10px] text-muted-foreground">{a.date}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-medium text-foreground group-hover:text-primary">{a.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{a.desc}</p>
                </div>
                <ChevronRight className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
