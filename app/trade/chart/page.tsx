"use client"

import { useState, Suspense, Component, type ReactNode } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ChevronDown, Star, Bell, Share2, Pencil, Eye,
  Grid3X3, Loader2, BarChart3, Settings2, Maximize2,
} from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"
import { TradingViewChart } from "@/components/trading/tradingview-chart"

/* Error boundary to prevent chart crashes from killing the page */
class ChartErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-card">
          <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">Chart temporarily unavailable</p>
          <button onClick={() => this.setState({ hasError: false })} className="mt-1 rounded bg-secondary px-3 py-1.5 text-xs text-foreground">
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function ChartPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
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

function ChartContent() {
  const searchParams = useSearchParams()
  const pair = searchParams.get("pair") || "BTCUSDT"
  const symbol = pair.replace("USDT", "")
  const { crypto } = useLivePrices(15000)
  const coin = crypto.find((c) => c.symbol === symbol) || crypto[0]
  const [activeTab, setActiveTab] = useState<ChartTab>("chart")
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>("1m")

  const price = coin?.price ?? 0
  const change = coin?.change24h ?? 0
  const high24h = price * 1.015
  const low24h = price * 0.985
  const turnover = coin?.volume ?? 0

  const tabs: ChartTab[] = ["chart", "overview", "data", "feed"]
  const intervals: TimeInterval[] = ["Time", "15m", "1h", "4h", "1D", "1m"]

  // Map interval to TradingView interval
  const tvIntervalMap: Record<string, string> = {
    Time: "1",
    "15m": "15",
    "1h": "60",
    "4h": "240",
    "1D": "D",
    "1m": "1",
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Top navigation - Convert / Spot / Futures / Options / TradFi */}
      <div className="scrollbar-none flex items-center gap-1 overflow-x-auto border-b border-border px-3 py-2">
        <button className="rounded-lg p-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#f7a600]">
            <span className="text-[10px] font-bold text-background">{"="}</span>
          </div>
        </button>
        <Link
          href="/convert"
          className="shrink-0 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          Convert
        </Link>
        <Link
          href={`/trade?pair=${pair}`}
          className="shrink-0 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          Spot
        </Link>
        <span className="shrink-0 px-3 py-1.5 text-sm font-bold text-foreground">
          Futures
        </span>
        <Link
          href="/derivatives"
          className="shrink-0 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          Options
        </Link>
        <span className="shrink-0 px-3 py-1.5 text-sm text-muted-foreground">
          TradFi
        </span>
      </div>

      {/* Pair header with symbol, change%, MM badge, settings */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-foreground">{pair}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <span
            className={`text-sm font-medium ${change >= 0 ? "text-destructive" : "text-destructive"}`}
            style={{ color: change >= 0 ? undefined : undefined }}
          >
            <span className={change >= 0 ? "text-success" : "text-destructive"}>
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
              MM
            </span>
            <span className="text-xs text-primary">3.91%</span>
          </div>
          <div className="flex items-center gap-0.5 rounded-full bg-card px-2.5 py-1.5 border border-border">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <div className="mx-1 h-4 w-px bg-border" />
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Chart / Overview / Data / Feed tabs */}
      <div className="flex items-center border-b border-border px-4">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`border-b-2 px-4 pb-2.5 pt-1 text-sm font-medium capitalize transition-colors ${
              activeTab === t
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {t === "chart"
              ? "Chart"
              : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 pb-2">
          <Star className="h-4 w-4 text-muted-foreground" />
          <Bell className="h-4 w-4 text-muted-foreground" />
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {activeTab === "chart" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Price info section */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  Last Traded Price
                  <ChevronDown className="h-2.5 w-2.5" />
                </div>
                <div
                  className={`font-mono text-[28px] font-bold leading-tight ${
                    change >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {formatPrice(price)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Mark Price {formatPrice(price * 1.0001)}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] text-muted-foreground">
                    24h High
                  </span>
                  <span className="font-mono text-[11px] text-foreground">
                    {formatPrice(high24h)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] text-muted-foreground">
                    24h Low
                  </span>
                  <span className="font-mono text-[11px] text-foreground">
                    {formatPrice(low24h)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] text-muted-foreground">
                    24h Turnover
                  </span>
                  <span className="font-mono text-[11px] text-foreground">
                    {turnover >= 1e9
                      ? `${(turnover / 1e9).toFixed(2)}B`
                      : turnover >= 1e6
                        ? `${(turnover / 1e6).toFixed(2)}M`
                        : turnover.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Time interval bar */}
          <div className="flex items-center border-y border-border px-2 py-1.5">
            <div className="scrollbar-none flex flex-1 items-center gap-0.5 overflow-x-auto">
              {intervals.map((iv) => (
                <button
                  key={iv}
                  onClick={() => setSelectedInterval(iv)}
                  className={`shrink-0 rounded px-3 py-1 text-xs font-medium transition-colors ${
                    selectedInterval === iv
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {iv}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 border-l border-border pl-2">
              <span className="text-muted-foreground">Depth</span>
              <div className="mx-1 h-4 w-px bg-border" />
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* MA indicator labels */}
          <div className="flex items-center gap-3 px-4 py-1.5 text-[10px]">
            <span className="text-[#f7a600]">
              MA7: {formatPrice(price * 0.9998)}
            </span>
            <span className="text-[#e040fb]">
              MA14: {formatPrice(price * 1.0001)}
            </span>
            <span className="text-[#29b6f6]">
              MA28: {formatPrice(price * 0.9995)}
            </span>
          </div>

          {/* TradingView chart - full width, prominent */}
          <div className="relative flex-1 border-b border-border" style={{ minHeight: "360px" }}>
            <ChartErrorBoundary>
              <TradingViewChart
                symbol={pair}
                theme="dark"
                interval={tvIntervalMap[selectedInterval] || "1"}
                hideTopToolbar
                className="h-full w-full"
              />
            </ChartErrorBoundary>
          </div>

          {/* Volume indicator labels */}
          <div className="flex items-center gap-3 px-4 py-1.5 text-[10px]">
            <span className="text-[#f7a600]">
              VOLUME: {((turnover || 2.8e9) / 1e9).toFixed(3)}
            </span>
            <span className="text-[#e040fb]">
              MA5: {((turnover || 2.8e9) * 0.85 / 1e9).toFixed(3)}
            </span>
            <span className="text-[#29b6f6]">
              MA10: {((turnover || 2.8e9) * 0.75 / 1e9).toFixed(3)}
            </span>
          </div>

          {/* Indicator type tabs - MA / EMA / BOLL / Mark / SAR / MAVOL / MACD */}
          <div className="scrollbar-none flex items-center gap-3 overflow-x-auto border-t border-border px-4 py-2 text-[11px]">
            <span className="font-semibold text-foreground">MA</span>
            <span className="text-muted-foreground">EMA</span>
            <span className="text-muted-foreground">BOLL</span>
            <span className="text-muted-foreground">Mark</span>
            <span className="text-muted-foreground">SAR</span>
            <span className="text-muted-foreground">MAVOL</span>
            <span className="text-muted-foreground">MACD</span>
            <div className="ml-auto">
              <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Bottom action bar - Tools / Spot / Long / Short */}
          <div className="sticky bottom-14 flex items-center gap-2 border-t border-border bg-background px-3 py-2.5">
            <Link
              href={`/trade?pair=${pair}`}
              className="flex flex-col items-center gap-0.5 px-3"
            >
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Tools</span>
            </Link>
            <Link
              href={`/trade?pair=${pair}`}
              className="flex flex-col items-center gap-0.5 px-3"
            >
              <Eye className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Spot</span>
            </Link>
            <Link
              href={`/trade?pair=${pair}`}
              className="flex flex-1 items-center justify-center rounded-lg bg-success py-3 text-sm font-bold text-[#0a0e17]"
            >
              Long
            </Link>
            <Link
              href={`/trade?pair=${pair}`}
              className="flex flex-1 items-center justify-center rounded-lg bg-destructive py-3 text-sm font-bold text-white"
            >
              Short
            </Link>
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="flex-1 p-4">
          <div className="rounded-xl bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Contract Details
            </h3>
            <div className="mt-3 space-y-2.5">
              {[
                ["Contract Type", "Perpetual"],
                ["Settlement Asset", "USDT"],
                ["Max Leverage", "100x"],
                ["Funding Interval", "8h"],
                ["Min Order Qty", "0.001 BTC"],
                ["Tick Size", "0.1"],
                ["Max Order Qty", "100 BTC"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "data" && (
        <div className="flex-1 p-4">
          <div className="rounded-xl bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Market Data
            </h3>
            <div className="mt-3 space-y-2.5">
              {[
                ["Open Interest", "45,231 BTC"],
                [
                  "24h Volume",
                  `${
                    turnover >= 1e9
                      ? `${(turnover / 1e9).toFixed(2)}B`
                      : "N/A"
                  } USDT`,
                ],
                ["Funding Rate", "0.0100%"],
                ["Next Funding", "02:59:38"],
                ["Index Price", `$${formatPrice(price)}`],
                ["Mark Price", `$${formatPrice(price * 1.0001)}`],
                ["Open Interest Value", "$4.2B"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "feed" && (
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-center text-sm text-muted-foreground">
            Community feed coming soon
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
