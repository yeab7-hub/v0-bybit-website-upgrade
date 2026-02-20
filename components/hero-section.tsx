"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"

export function HeroSection() {
  const { crypto, isLoading } = useLivePrices(5000)
  const [email, setEmail] = useState("")
  const topCoins = crypto.slice(0, 4)

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-16 lg:pt-24">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          {/* Left */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
              <span className="text-xs font-medium text-primary">Up to 30,000 USDT in Rewards</span>
              <ArrowRight className="h-3 w-3 text-primary" />
            </div>

            <h1 className="text-balance text-[40px] font-bold leading-[1.15] tracking-tight text-foreground md:text-[52px] lg:text-[56px]">
              Buy & Sell Crypto in Minutes
            </h1>

            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Join over 40 million users on the world{"'"}s fastest growing crypto exchange. Trade 600+ tokens with deep liquidity.
            </p>

            {/* Sign up input */}
            <div className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email / Phone number"
                className="flex-1 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <Link href={email ? `/register?email=${encodeURIComponent(email)}` : "/register"}>
                <Button className="h-[46px] w-full rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto">
                  Sign Up
                </Button>
              </Link>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>Or continue with</span>
              <div className="flex gap-3">
                <Link href="/register" className="flex items-center gap-1 text-foreground hover:text-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </Link>
                <Link href="/register" className="flex items-center gap-1 text-foreground hover:text-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.17-.03-.36-.03-.56 0-1.12.535-2.3 1.235-3.07C13.236 1.88 14.316 1.22 15.365 1c.02.16.03.32.03.43zm4.563 17.97c-.43 1.38-1.12 2.73-2.02 3.9-.79 1.01-1.6 2.02-2.87 2.05-1.13.03-1.59-.67-3.22-.67-1.63 0-2.13.65-3.2.7-1.22.05-2.15-1.1-2.95-2.1-1.63-2.05-2.88-5.79-1.2-8.32.83-1.25 2.31-2.04 3.92-2.06 1.1-.02 2.14.74 2.81.74.67 0 1.93-.92 3.26-.78.55.02 2.1.22 3.1 1.68-.08.05-1.85 1.08-1.83 3.22.03 2.56 2.24 3.42 2.27 3.43z"/></svg>
                  Apple
                </Link>
              </div>
            </div>
          </div>

          {/* Right -- Live price cards */}
          <div className="grid grid-cols-2 gap-3">
            {(isLoading || topCoins.length === 0
              ? Array.from({ length: 4 })
              : topCoins
            ).map((coin: any, i) => (
              <Link
                key={coin?.id || i}
                href={coin ? `/trade?pair=${coin.symbol}USDT` : "/trade"}
                className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                {!coin ? (
                  <>
                    <div className="flex items-center gap-2"><div className="h-8 w-8 animate-pulse rounded-full bg-secondary" /><div className="h-3 w-14 animate-pulse rounded bg-secondary" /></div>
                    <div className="mt-3 h-5 w-24 animate-pulse rounded bg-secondary" />
                    <div className="mt-1.5 h-3 w-14 animate-pulse rounded bg-secondary" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                        {coin.symbol.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">{coin.symbol}</span>
                        <span className="text-xs text-muted-foreground">/USDT</span>
                      </div>
                    </div>
                    <div className="mt-3 font-mono text-lg font-semibold text-foreground">
                      ${formatPrice(coin.price)}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`font-mono text-xs font-medium ${coin.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                        {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                      </span>
                      {coin.sparkline && coin.sparkline.length > 1 && (
                        <svg viewBox="0 0 60 20" className="h-4 w-14" preserveAspectRatio="none">
                          <path
                            d={coin.sparkline.map((v: number, idx: number) => {
                              const x = (idx / (coin.sparkline.length - 1)) * 60
                              const mn = Math.min(...coin.sparkline)
                              const mx = Math.max(...coin.sparkline)
                              const y = 18 - ((v - mn) / (mx - mn || 1)) * 16
                              return `${idx === 0 ? "M" : "L"}${x},${y}`
                            }).join(" ")}
                            fill="none"
                            stroke={coin.change24h >= 0 ? "hsl(145,63%,49%)" : "hsl(0,84%,60%)"}
                            strokeWidth="1.5"
                          />
                        </svg>
                      )}
                    </div>
                  </>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
