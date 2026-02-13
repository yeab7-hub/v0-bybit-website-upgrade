"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowRight, Play, TrendingUp, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const livePrices = [
  { symbol: "BTC", base: 97432.5 },
  { symbol: "ETH", base: 3842.18 },
  { symbol: "SOL", base: 214.67 },
]

export function HeroSection() {
  const [prices, setPrices] = useState(livePrices.map((p) => ({ ...p, price: p.base, change: 0 })))

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) =>
        prev.map((p) => {
          const delta = (Math.random() - 0.48) * p.base * 0.001
          const newPrice = p.price + delta
          const change = ((newPrice - p.base) / p.base) * 100
          return { ...p, price: newPrice, change }
        })
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-success/5 blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-24 lg:px-6 lg:py-36">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-medium text-primary">
              New: Zero-Fee Trading for 30 Days
            </span>
            <ArrowRight className="h-3 w-3 text-primary" />
          </div>

          <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-8xl">
            Trade Crypto with
            <br />
            <span className="text-primary">Confidence</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Access 500+ trading pairs, deep liquidity, and
            institutional-grade security. Join 20 million traders building
            their future with Tryd.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/trade">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-border px-8 text-base text-foreground hover:bg-secondary"
              >
                <Play className="mr-2 h-4 w-4" />
                Explore Markets
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: Shield, text: "Bank-Grade Security" },
              { icon: Zap, text: "Sub-ms Execution" },
              { icon: TrendingUp, text: "$42B+ Daily Volume" },
            ].map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <badge.icon className="h-3.5 w-3.5 text-primary" />
                {badge.text}
              </div>
            ))}
          </div>

          {/* Live Price Cards */}
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {prices.map((coin) => (
              <div
                key={coin.symbol}
                className="group relative overflow-hidden rounded-xl border border-border bg-card/80 p-5 backdrop-blur-sm hover:border-primary/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                      {coin.symbol[0]}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-foreground">
                        {coin.symbol}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {coin.symbol}/USDT
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold text-foreground">
                      $
                      {coin.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div
                      className={`font-mono text-xs ${
                        coin.change >= 0
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {coin.change >= 0 ? "+" : ""}
                      {coin.change.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Mini sparkline */}
                <div className="mt-3 h-8 w-full overflow-hidden rounded bg-secondary/50">
                  <svg
                    viewBox="0 0 200 30"
                    className="h-full w-full"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={
                        coin.change >= 0
                          ? "M0,25 C30,22 50,18 80,15 C110,12 130,20 160,10 C180,5 190,8 200,3"
                          : "M0,5 C30,8 50,12 80,15 C110,18 130,10 160,20 C180,25 190,22 200,27"
                      }
                      fill="none"
                      stroke={
                        coin.change >= 0
                          ? "hsl(142, 72%, 50%)"
                          : "hsl(0, 72%, 51%)"
                      }
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                <Link
                  href="/trade"
                  className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-primary/10 py-2 text-xs font-medium text-primary hover:bg-primary/20"
                >
                  Trade {coin.symbol}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "$42B+", label: "24h Trading Volume" },
              { value: "20M+", label: "Registered Users" },
              { value: "500+", label: "Trading Pairs" },
              { value: "99.99%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
