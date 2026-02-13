"use client"

import { ArrowRight, Clock } from "lucide-react"

const news = [
  {
    category: "Announcement",
    title: "Tryd Launches Zero-Fee Spot Trading Promotion for New Users",
    excerpt:
      "New users can enjoy zero trading fees on all spot pairs for their first 30 days. Limited time offer.",
    date: "Feb 13, 2026",
    readTime: "2 min read",
  },
  {
    category: "Product Update",
    title: "Grid Trading Bot 2.0: Smarter Automation with AI-Powered Parameters",
    excerpt:
      "Our upgraded grid bot now uses machine learning to suggest optimal grid parameters based on market conditions.",
    date: "Feb 12, 2026",
    readTime: "4 min read",
  },
  {
    category: "Market Insight",
    title: "Bitcoin Breaks $97K as Institutional Inflows Surge in Q1 2026",
    excerpt:
      "Record ETF inflows and growing corporate treasury adoption push BTC to new highs.",
    date: "Feb 11, 2026",
    readTime: "5 min read",
  },
  {
    category: "New Listing",
    title: "RENDER, ONDO, and JUP Now Available on Tryd Spot",
    excerpt:
      "Three new tokens added to our spot marketplace with USDT trading pairs and competitive maker/taker fees.",
    date: "Feb 10, 2026",
    readTime: "2 min read",
  },
  {
    category: "Education",
    title: "Beginner Guide: How to Set Up Your First Copy Trading Portfolio",
    excerpt:
      "Step-by-step walkthrough of selecting traders, setting risk limits, and monitoring performance.",
    date: "Feb 9, 2026",
    readTime: "7 min read",
  },
  {
    category: "Security",
    title: "Tryd Publishes Q4 2025 Proof of Reserves Report",
    excerpt:
      "Independent audit confirms 1:1 backing across all user assets with $12B+ in reserves.",
    date: "Feb 8, 2026",
    readTime: "3 min read",
  },
]

const categoryColors: Record<string, string> = {
  Announcement: "bg-primary/10 text-primary",
  "Product Update": "bg-chart-4/10 text-[hsl(199,89%,48%)]",
  "Market Insight": "bg-success/10 text-success",
  "New Listing": "bg-chart-5/10 text-[hsl(262,83%,58%)]",
  Education: "bg-primary/10 text-primary",
  Security: "bg-success/10 text-success",
}

export function NewsSection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Stay Updated
            </span>
            <h2 className="mt-3 text-balance text-3xl font-bold text-foreground">
              Latest News & Announcements
            </h2>
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            View All News
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <article
              key={item.title}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:border-primary/20"
            >
              {/* Color bar */}
              <div className="h-1 bg-primary/30 group-hover:bg-primary" />

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                      categoryColors[item.category] || "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>

                <h3 className="mb-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                  {item.title}
                </h3>

                <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
                  {item.excerpt}
                </p>

                <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
                  <span className="text-[10px] text-muted-foreground">
                    {item.date}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {item.readTime}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
