"use client"

import { useState, Suspense, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ChevronDown, Star, Bell, Share2, Pencil, Eye,
  Grid3X3, Loader2, BarChart3, Settings2, Maximize2,
} from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { useLivePrices, formatPrice, safeFindPrice, type PriceData } from "@/hooks/use-live-prices"
import { TradingViewChart } from "@/components/trading/tradingview-chart"
import { PairSelector } from "@/components/trading/pair-selector"

export default function ChartPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[100dvh] items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <ChartContent />
    </Suspense>
  )
}

type ChartTab = "chart" | "overview" | "data" | "feed"
type TimeInterval = "Time" | "15m" | "1h" | "4h" | "1D" | "1m"

const tvIntervalMap: Record<string, string> = {
  Time: "1", "15m": "15", "1h": "60", "4h": "240", "1D": "D", "1m": "1",
}

function ChartContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawPair = searchParams?.get("pair") || "BTCUSDT"

  const { crypto, forex, commodities, stocks, cfd } = useLivePrices(5000)
  const allPrices: PriceData[] = [
    ...(commodities ?? []), ...(forex ?? []),
    ...(stocks ?? []), ...(cfd ?? []), ...(crypto ?? []),
  ]

  const coin = safeFindPrice(allPrices, rawPair)

  const [activeTab, setActiveTab] = useState<ChartTab>("chart")
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>("1m")
  const [showPairSelector, setShowPairSelector] = useState(false)

  const handlePairSelect = useCallback((newPair: string) => {
    setShowPairSelector(false)
    router.push(`/trade/chart?pair=${encodeURIComponent(newPair)}`)
  }, [router])

  const price = coin?.price ?? 0
  const change = coin?.change24h ?? 0
  const high24h = coin?.high24h || (price > 0 ? price * 1.015 : 0)
  const low24h = coin?.low24h || (price > 0 ? price * 0.985 : 0)
  const turnover = coin?.volume ?? 0

  const displayPair = coin?.symbol
    ? (coin.symbol.includes("/") ? coin.symbol : coin.symbol + "/USDT")
    : (rawPair.includes("/") ? rawPair : rawPair.replace("USDT", "/USDT"))

  const tabs: ChartTab[] = ["chart", "overview", "data", "feed"]
  const intervals: TimeInterval[] = ["Time", "15m", "1h", "4h", "1D", "1m"]

  /* ── Pair selector fullscreen overlay ── */
  if (showPairSelector) {
    return (
      <div className="fixed inset-0 z-[100] bg-background">
        {/* Close button */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Select Pair</span>
          <button
            onClick={() => setShowPairSelector(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
            aria-label="Close pair selector"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <PairSelector
          activePair={rawPair}
          onSelectPair={handlePairSelect}
        />
      </div>
    )
  }

  return (
    <>
      {/*
        LAYOUT KEY:
        We use CSS Grid with explicit row sizing so the chart
        ALWAYS fills all remaining viewport space regardless of
        screen size.  grid-rows: [auto auto auto 1fr auto]
      */}
      <div
        className="grid h-[100dvh] w-full bg-background"
        style={{ gridTemplateRows: "auto auto auto 1fr auto" }}
      >
        {/* ROW 1 - Top navigation */}
        <div className="scrollbar-none flex items-center gap-1 overflow-x-auto border-b border-border px-3 py-2">
          <button className="rounded-lg p-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#f7a600]">
              <span className="text-[10px] font-bold text-background">{"="}</span>
            </div>
          </button>
          {["Convert", "Spot", "Futures", "Options", "TradFi"].map((label) => {
            const href = label === "Convert" ? "/convert"
              : label === "Spot" ? `/trade?pair=${rawPair}`
              : label === "Options" ? "/derivatives"
              : "#"
            return (
              <Link key={label} href={href}
                className={`shrink-0 px-3 py-1.5 text-sm ${label === "Futures" ? "font-bold text-foreground" : "text-muted-foreground"}`}
              >{label}</Link>
            )
          })}
        </div>

        {/* ROW 2 - Pair header + tabs */}
        <div>
          {/* Pair & settings row */}
          <div className="flex items-center justify-between px-4 py-2">
            <button
              onClick={() => setShowPairSelector(true)}
              className="flex items-center gap-1.5 active:opacity-70"
              aria-label="Change trading pair"
            >
              <span className="text-lg font-bold text-foreground">{displayPair}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">MM</span>
                <span className="text-xs text-primary">3.91%</span>
              </div>
              <div className="flex items-center gap-0.5 rounded-full border border-border bg-card px-2.5 py-1.5">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <div className="mx-1 h-4 w-px bg-border" />
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center border-b border-border px-4">
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`border-b-2 px-4 pb-2 pt-1 text-sm font-medium capitalize ${
                  activeTab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
                }`}
              >{t === "chart" ? "Chart" : t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
            <div className="ml-auto flex items-center gap-3 pb-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* ROW 3 - Price info + intervals + MA (only on "chart" tab) */}
        {activeTab === "chart" ? (
          <div>
            {/* Price row */}
            <div className="flex items-start justify-between px-4 py-2">
              <div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  Last Traded Price <ChevronDown className="h-2.5 w-2.5" />
                </div>
                <div className={`font-mono text-[26px] font-bold leading-tight ${change >= 0 ? "text-success" : "text-destructive"}`}>
                  {price > 0 ? formatPrice(price) : "--"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Mark Price {price > 0 ? formatPrice(price * 1.0001) : "--"}
                </div>
              </div>
              <div className="space-y-0.5 text-right">
                {[
                  ["24h High", high24h],
                  ["24h Low", low24h],
                  ["24h Turnover", turnover],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex items-center justify-between gap-3">
                    <span className="text-[10px] text-muted-foreground">{label as string}</span>
                    <span className="font-mono text-[11px] text-foreground">
                      {label === "24h Turnover"
                        ? (val as number) >= 1e9 ? `${((val as number) / 1e9).toFixed(2)}B`
                          : (val as number) >= 1e6 ? `${((val as number) / 1e6).toFixed(2)}M` : "--"
                        : (val as number) > 0 ? formatPrice(val as number) : "--"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Time intervals */}
            <div className="flex items-center border-y border-border px-2 py-1">
              <div className="scrollbar-none flex flex-1 items-center gap-0.5 overflow-x-auto">
                {intervals.map((iv) => (
                  <button key={iv} onClick={() => setSelectedInterval(iv)}
                    className={`shrink-0 rounded px-3 py-1 text-xs font-medium ${
                      selectedInterval === iv ? "bg-secondary text-foreground" : "text-muted-foreground"
                    }`}
                  >{iv}</button>
                ))}
              </div>
              <div className="flex items-center gap-1 border-l border-border pl-2">
                <span className="text-xs text-muted-foreground">Depth</span>
                <div className="mx-1 h-4 w-px bg-border" />
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* MA labels */}
            <div className="flex items-center gap-3 px-4 py-1 text-[10px]">
              <span className="text-[#f7a600]">MA7: {price > 0 ? formatPrice(price * 0.9998) : "--"}</span>
              <span className="text-[#e040fb]">MA14: {price > 0 ? formatPrice(price * 1.0001) : "--"}</span>
              <span className="text-[#29b6f6]">MA28: {price > 0 ? formatPrice(price * 0.9995) : "--"}</span>
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* ROW 4 - Main content (chart / overview / data / feed) - FILLS REMAINING SPACE */}
        {activeTab === "chart" ? (
          <div className="relative min-h-0 overflow-hidden">
            <TradingViewChart
              key={`${rawPair}-${selectedInterval}`}
              symbol={rawPair}
              theme="dark"
              interval={tvIntervalMap[selectedInterval] || "1"}
              hideTopToolbar
              className="absolute inset-0"
            />
          </div>
        ) : activeTab === "overview" ? (
          <div className="overflow-y-auto p-4">
            <div className="rounded-xl bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">Contract Details</h3>
              <div className="mt-3 space-y-2.5">
                {[["Contract Type","Perpetual"],["Settlement Asset","USDT"],["Max Leverage","100x"],
                  ["Funding Interval","8h"],["Min Order Qty","0.001"],["Tick Size","0.1"],["Max Order Qty","100"]
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === "data" ? (
          <div className="overflow-y-auto p-4">
            <div className="rounded-xl bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">Market Data</h3>
              <div className="mt-3 space-y-2.5">
                {[["24h Volume", turnover >= 1e9 ? `${(turnover/1e9).toFixed(2)}B USDT` : "N/A"],
                  ["Funding Rate","0.0100%"],["Next Funding","02:59:38"],
                  ["Index Price",`$${price > 0 ? formatPrice(price) : "--"}`],
                  ["Mark Price",`$${price > 0 ? formatPrice(price * 1.0001) : "--"}`],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4">
            <p className="text-center text-sm text-muted-foreground">Community feed coming soon</p>
          </div>
        )}

        {/* ROW 5 - Bottom action bar + nav */}
        <div>
          {activeTab === "chart" && (
            <div className="flex items-center gap-2 border-t border-border bg-background px-3 py-2">
              <Link href={`/trade?pair=${rawPair}`} className="flex flex-col items-center gap-0.5 px-3">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Tools</span>
              </Link>
              <Link href={`/trade?pair=${rawPair}`} className="flex flex-col items-center gap-0.5 px-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Spot</span>
              </Link>
              <Link href={`/trade?pair=${rawPair}`} className="flex flex-1 items-center justify-center rounded-lg bg-success py-3 text-sm font-bold text-[#0a0e17]">
                Long
              </Link>
              <Link href={`/trade?pair=${rawPair}`} className="flex flex-1 items-center justify-center rounded-lg bg-destructive py-3 text-sm font-bold text-white">
                Short
              </Link>
            </div>
          )}
          <BottomNav />
        </div>
      </div>
    </>
  )
}
