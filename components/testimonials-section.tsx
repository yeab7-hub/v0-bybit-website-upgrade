"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

const testimonials = [
  {
    name: "Marcus Chen",
    role: "Professional Trader",
    location: "Singapore",
    text: "Tryd has the fastest execution I have experienced on any exchange. The order book depth on major pairs is exceptional, and the fee structure makes it my go-to for high-frequency trading.",
    rating: 5,
  },
  {
    name: "Sarah Williams",
    role: "Portfolio Manager",
    location: "London, UK",
    text: "The institutional-grade tools and API reliability are exactly what our fund needed. Proof of reserves gives our clients confidence, and the derivatives suite is world-class.",
    rating: 5,
  },
  {
    name: "Ahmed Al-Rashid",
    role: "Crypto Investor",
    location: "Dubai, UAE",
    text: "I have been using the copy trading feature for six months and the returns have been outstanding. The platform makes it easy to follow verified traders with transparent track records.",
    rating: 5,
  },
  {
    name: "Elena Kowalski",
    role: "DeFi Researcher",
    location: "Berlin, Germany",
    text: "Tryd Earn products are some of the most competitive in the market. The auto-compounding feature on savings is brilliant, and the launchpad has given me access to great early-stage projects.",
    rating: 4,
  },
  {
    name: "James Okafor",
    role: "Day Trader",
    location: "Lagos, Nigeria",
    text: "The mobile app experience is incredible. I can manage my entire portfolio, set advanced orders, and monitor positions from anywhere. The push notifications for price alerts are a lifesaver.",
    rating: 5,
  },
  {
    name: "Yuki Tanaka",
    role: "Algorithmic Trader",
    location: "Tokyo, Japan",
    text: "The trading bot builder changed my workflow completely. I went from spending hours coding strategies to deploying grid bots in minutes. Backtesting engine is surprisingly accurate.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  const [page, setPage] = useState(0)
  const perPage = 3
  const totalPages = Math.ceil(testimonials.length / perPage)
  const visible = testimonials.slice(page * perPage, page * perPage + perPage)

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Testimonials
            </span>
            <h2 className="mt-3 text-balance text-3xl font-bold text-foreground">
              Loved by Traders Worldwide
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Join millions of traders who trust Tryd for their crypto journey.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {visible.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-xl border border-border bg-card p-6 hover:border-primary/20"
            >
              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < t.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-foreground">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.role} &middot; {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-2 rounded-full transition-all ${
                page === i ? "w-6 bg-primary" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
