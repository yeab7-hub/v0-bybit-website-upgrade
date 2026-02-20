"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"

export function HeroSection() {
  const { crypto, isLoading } = useLivePrices(5000)
  const [email, setEmail] = useState("")

  const topCoins = crypto.slice(0, 6)

  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 lg:px-6 lg:pb-16 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left side -- CTA */}
          <div>
            {/* Promo banner */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <Gift className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">
                Sign up to unlock up to 5,100 USDT in Welcome Bonuses
              </span>
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Your crypto journey, <span className="text-primary">simplified.</span>
            </h1>

            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
              Buy, sell, and trade 500+ cryptocurrencies with deep liquidity and institutional-grade security.
            </p>

            {/* Email sign-up inline */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center rounded-lg border border-border bg-card px-4 py-3 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or phone number"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Link href={email ? `/register?email=${encodeURIComponent(email)}` : "/register"}>
                <Button
                  size="lg"
                  className="h-12 w-full bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto"
                >
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Or <Link href="/register" className="text-primary hover:underline">sign up</Link> with Google or Apple
            </p>
          </div>

          {/* Right side -- Live price cards grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {isLoading || topCoins.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-secondary" />
                      <div className="h-3 w-10 animate-pulse rounded bg-secondary" />
                    </div>
                    <div className="mt-3 h-4 w-20 animate-pulse rounded bg-secondary" />
                    <div className="mt-1 h-3 w-12 animate-pulse rounded bg-secondary" />
                  </div>
                ))
              : topCoins.map((coin) => (
                  <Link
                    key={coin.id}
                    href={`/trade?pair=${coin.symbol}USDT`}
                    className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                        {coin.symbol.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {coin.symbol}/USDT
                      </span>
                    </div>
                    <div className="mt-3 font-mono text-sm font-semibold text-foreground">
                      ${formatPrice(coin.price)}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className={`font-mono text-xs ${
                          coin.change24h >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {coin.change24h >= 0 ? "+" : ""}
                        {coin.change24h.toFixed(2)}%
                      </span>
                      {/* Mini sparkline */}
                      {coin.sparkline && coin.sparkline.length > 1 && (
                        <svg
                          viewBox="0 0 60 20"
                          className="h-4 w-12"
                          preserveAspectRatio="none"
                        >
                          <path
                            d={coin.sparkline
                              .map((v, i) => {
                                const x = (i / (coin.sparkline!.length - 1)) * 60
                                const min = Math.min(...coin.sparkline!)
                                const max = Math.max(...coin.sparkline!)
                                const range = max - min || 1
                                const y = 18 - ((v - min) / range) * 16
                                return `${i === 0 ? "M" : "L"}${x},${y}`
                              })
                              .join(" ")}
                            fill="none"
                            stroke={
                              coin.change24h >= 0
                                ? "hsl(142, 72%, 50%)"
                                : "hsl(0, 72%, 51%)"
                            }
                            strokeWidth="1.5"
                          />
                        </svg>
                      )}
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </section>
  )
}
