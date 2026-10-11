"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  ThumbsUp, MessageSquare, Repeat2, ExternalLink, MoreHorizontal, Plus, Check,
} from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

type FeedTab = "byx" | "events" | "rooms" | "livestream" | "news"

const mockPosts: any[] = []

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("byx")
  const tabs: { key: FeedTab; label: string }[] = [
    { key: "byx", label: "ByX" },
    { key: "events", label: "Events" },
    { key: "rooms", label: "Rooms" },
    { key: "livestream", label: "Livestream" },
    { key: "news", label: "News" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Tab nav */}
        <div className="scrollbar-none flex items-center gap-0 overflow-x-auto border-b border-border px-4">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`shrink-0 border-b-2 px-4 pb-3 pt-3 text-sm font-medium transition-colors ${
                activeTab === t.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "byx" && (
          <div className="divide-y divide-border">
            {mockPosts.length === 0 && <p className="px-4 py-16 text-center text-sm text-muted-foreground">The social feed is not connected. No mock posts or fabricated engagement counts are shown.</p>}
            {mockPosts.map(post => (
              <article key={post.id} className="px-4 py-4">
                {/* Author row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-foreground">{post.author}</span>
                        {post.verified && (
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{post.time}</span>
                        {post.sentiment && (
                          <span className={post.sentiment === "Bullish" ? "text-success" : "text-destructive"}>
                            {post.sentiment}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="p-1 text-muted-foreground"><MoreHorizontal className="h-5 w-5" /></button>
                </div>

                {/* Content */}
                <div className="mt-3">
                  <h3 className="text-sm font-medium text-foreground">{post.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{post.content}</p>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {post.tags.map((tag, i) => (
                      <span key={i} className={`text-sm font-medium ${tag.color}`}>{tag.label}</span>
                    ))}
                  </div>
                )}

                {/* Image placeholder */}
                <div className="mt-3 flex gap-2">
                  <div className="h-32 flex-1 rounded-lg bg-card" />
                  {post.id % 2 === 0 && <div className="h-32 flex-1 rounded-lg bg-card" />}
                </div>

                {/* Position card */}
                {post.position && (
                  <div className="mt-3 rounded-lg border border-border bg-card p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{post.position.pair}</span>
                        {post.position.type && (
                          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{post.position.type}</span>
                        )}
                        {post.position.leverage && (
                          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{post.position.leverage}</span>
                        )}
                        <span className={`text-xs font-medium ${post.position.side === "Long" ? "text-success" : post.position.side === "Short" ? "text-destructive" : "text-muted-foreground"}`}>
                          {post.position.side}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${post.position.pnl.startsWith("-") ? "text-destructive" : "text-muted-foreground"}`}>
                        PnL: {post.position.pnl}
                      </span>
                    </div>
                  </div>
                )}

                {/* Coin tags */}
                {post.coinTags && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {post.coinTags.map((ct, i) => (
                      <span key={i} className="rounded border border-border px-2 py-0.5 text-xs text-success">
                        {ct.symbol} {ct.change}
                      </span>
                    ))}
                  </div>
                )}

                {/* Engagement */}
                <div className="mt-3 flex items-center justify-between text-muted-foreground">
                  <button className="flex items-center gap-1.5 text-xs hover:text-foreground">
                    <ThumbsUp className="h-4 w-4" /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs hover:text-foreground">
                    <MessageSquare className="h-4 w-4" /> {post.comments}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs hover:text-foreground">
                    <Repeat2 className="h-4 w-4" /> {post.reposts}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs hover:text-foreground">
                    <ExternalLink className="h-4 w-4" /> {post.shares}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab !== "byx" && (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} is not connected yet</p>
          </div>
        )}

        {/* FAB */}
        <button disabled title="Posting is unavailable until the social feed is connected" className="fixed bottom-20 right-4 flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-full bg-secondary opacity-50 shadow-lg lg:bottom-8">
          <Plus className="h-6 w-6 text-primary-foreground" />
        </button>
      </main>

      <BottomNav />
      <div className="hidden lg:block"><Footer /></div>
    </div>
  )
}
