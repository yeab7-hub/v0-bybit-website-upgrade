"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import {
  ChevronDown, Star, Bell, Share2, Pencil, Eye, Grid3X3, Loader2,
} from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"

export default function ChartPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
      <ChartContent />
    </Suspense>
  )
}

type TimeFrame = "Time" | "15m" | "1h" | "4h" | "1D" | "1m"
type ChartTab = "chart" | "overview" | "data" | "feed"

function ChartContent() {
  const searchParams = useSearchParams()
  const pair = searchParams.get("pair") || "BTCUSDT"
  const symbol = pair.replace("USDT", "")
  const { crypto } = useLivePrices(3000)
  const coin = crypto.find(c => c.symbol === symbol) || crypto[0]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [timeframe, setTimeframe] = useState<TimeFrame>("1m")
  const [activeTab, setActiveTab] = useState<ChartTab>("chart")
  const [candles, setCandles] = useState<{ o: number; h: number; l: number; c: number; v: number; t: number }[]>([])

  // Generate realistic candle data
  useEffect(() => {
    if (!coin) return
    const base = coin.price
    const newCandles: typeof candles = []
    let prev = base * (1 - Math.random() * 0.03)
    for (let i = 0; i < 60; i++) {
      const change = (Math.random() - 0.48) * base * 0.004
      const o = prev
      const c = o + change
      const h = Math.max(o, c) + Math.random() * base * 0.002
      const l = Math.min(o, c) - Math.random() * base * 0.002
      const v = Math.random() * 80 + 5
      newCandles.push({ o, h, l, c, v, t: Date.now() - (60 - i) * 60000 })
      prev = c
    }
    setCandles(newCandles)
  }, [coin])

  // Draw candlestick chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || candles.length === 0) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    const chartH = h * 0.75
    const volH = h * 0.2
    const gap = h * 0.05

    const allH = candles.map(c => c.h)
    const allL = candles.map(c => c.l)
    const maxP = Math.max(...allH)
    const minP = Math.min(...allL)
    const maxV = Math.max(...candles.map(c => c.v))
    const range = maxP - minP || 1
    const cw = w / candles.length

    ctx.clearRect(0, 0, w, h)

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.04)"
    ctx.lineWidth = 0.5
    for (let i = 0; i < 5; i++) {
      const y = (i / 4) * chartH
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    // Price labels on right
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    ctx.font = "10px monospace"
    ctx.textAlign = "right"
    for (let i = 0; i < 5; i++) {
      const price = maxP - (i / 4) * range
      const y = (i / 4) * chartH
      ctx.fillText(formatPrice(price), w - 4, y + 10)
    }

    // MA lines
    const calcMA = (period: number) => {
      return candles.map((_, i) => {
        if (i < period - 1) return null
        const slice = candles.slice(i - period + 1, i + 1)
        return slice.reduce((s, c) => s + c.c, 0) / period
      })
    }
    const ma7 = calcMA(7)
    const ma14 = calcMA(14)
    const ma28 = calcMA(28)

    const drawMA = (ma: (number | null)[], color: string) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      let started = false
      ma.forEach((v, i) => {
        if (v === null) return
        const x = i * cw + cw / 2
        const y = ((maxP - v) / range) * chartH
        if (!started) { ctx.moveTo(x, y); started = true }
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    }

    drawMA(ma7, "#f6c244")
    drawMA(ma14, "#c084fc")
    drawMA(ma28, "#60a5fa")

    // Candles
    candles.forEach((c, i) => {
      const x = i * cw + cw * 0.15
      const bw = cw * 0.7
      const isGreen = c.c >= c.o
      const color = isGreen ? "#0ecb81" : "#f6465d"

      const oY = ((maxP - c.o) / range) * chartH
      const cY = ((maxP - c.c) / range) * chartH
      const hY = ((maxP - c.h) / range) * chartH
      const lY = ((maxP - c.l) / range) * chartH

      // Wick
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x + bw / 2, hY)
      ctx.lineTo(x + bw / 2, lY)
      ctx.stroke()

      // Body
      ctx.fillStyle = color
      const bodyTop = Math.min(oY, cY)
      const bodyH = Math.max(Math.abs(oY - cY), 1)
      ctx.fillRect(x, bodyTop, bw, bodyH)
    })

    // Volume bars
    candles.forEach((c, i) => {
      const x = i * cw + cw * 0.2
      const bw = cw * 0.6
      const isGreen = c.c >= c.o
      const vh = (c.v / maxV) * volH
      ctx.fillStyle = isGreen ? "rgba(14,203,129,0.3)" : "rgba(246,70,93,0.3)"
      ctx.fillRect(x, chartH + gap + volH - vh, bw, vh)
    })

    // Current price line
    if (coin) {
      const priceY = ((maxP - coin.price) / range) * chartH
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = coin.change24h >= 0 ? "#0ecb81" : "#f6465d"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, priceY)
      ctx.lineTo(w, priceY)
      ctx.stroke()
      ctx.setLineDash([])

      // Price label box
      ctx.fillStyle = coin.change24h >= 0 ? "#0ecb81" : "#f6465d"
      const label = formatPrice(coin.price)
      const labelW = ctx.measureText(label).width + 12
      ctx.fillRect(w - labelW - 2, priceY - 9, labelW, 18)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 10px monospace"
      ctx.textAlign = "right"
      ctx.fillText(label, w - 6, priceY + 4)
    }
  }, [candles, coin])

  const lastCandle = candles[candles.length - 1]
  const high24h = candles.length > 0 ? Math.max(...candles.map(c => c.h)) : 0
  const low24h = candles.length > 0 ? Math.min(...candles.map(c => c.l)) : 0

  const tabs: ChartTab[] = ["chart", "overview", "data", "feed"]
  const timeframes: TimeFrame[] = ["Time", "15m", "1h", "4h", "1D", "1m"]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Trade type tabs */}
        <div className="scrollbar-none flex items-center gap-4 overflow-x-auto border-b border-border px-4 py-2">
          <Link href="/convert" className="shrink-0 text-sm text-muted-foreground hover:text-foreground">Convert</Link>
          <Link href="/trade" className="shrink-0 text-sm text-muted-foreground hover:text-foreground">Spot</Link>
          <span className="shrink-0 text-sm font-bold text-foreground">Futures</span>
          <Link href="/derivatives" className="shrink-0 text-sm text-muted-foreground hover:text-foreground">Options</Link>
          <Link href="/derivatives" className="shrink-0 text-sm text-muted-foreground hover:text-foreground">TradFi</Link>
        </div>

        {/* Pair header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">{pair}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className={`text-sm font-medium ${coin && coin.change24h >= 0 ? "text-success" : "text-destructive"}`}>
              {coin ? `${coin.change24h >= 0 ? "+" : ""}${coin.change24h.toFixed(2)}%` : "+0.00%"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">MM</span>
            <span className="text-xs text-primary">3.89%</span>
            <div className="ml-2 flex items-center gap-1 rounded-full bg-card px-3 py-1.5">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div className="h-4 w-px bg-border" />
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Chart/Overview/Data/Feed tabs */}
        <div className="flex items-center gap-4 border-b border-border px-4">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`border-b-2 pb-2 text-sm font-medium capitalize transition-colors ${
                activeTab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              {t === "chart" ? "Chart" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" />
            <Bell className="h-4 w-4 text-muted-foreground" />
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {activeTab === "chart" && (
          <>
            {/* Price info */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-muted-foreground">Last Traded Price</div>
                  <div className={`font-mono text-2xl font-bold ${coin && coin.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                    {coin ? formatPrice(coin.price) : "0.00"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Mark Price {coin ? formatPrice(coin.price * 1.0001) : "0.00"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex justify-between gap-6 text-[10px] text-muted-foreground">
                    <span>24h High</span>
                    <span className="font-mono text-foreground">{formatPrice(high24h)}</span>
                  </div>
                  <div className="flex justify-between gap-6 text-[10px] text-muted-foreground">
                    <span>24h Low</span>
                    <span className="font-mono text-foreground">{formatPrice(low24h)}</span>
                  </div>
                  <div className="flex justify-between gap-6 text-[10px] text-muted-foreground">
                    <span>24h Turnover</span>
                    <span className="font-mono text-foreground">6.17B</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeframe selector */}
            <div className="scrollbar-none flex items-center gap-0 overflow-x-auto border-b border-border px-4 pb-2">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`shrink-0 px-3 py-1 text-xs font-medium transition-colors ${
                    timeframe === tf ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {tf}
                  {timeframe === tf && tf === "1m" && <ChevronDown className="ml-0.5 inline h-2.5 w-2.5" />}
                </button>
              ))}
              <span className="shrink-0 px-3 py-1 text-xs text-muted-foreground">Depth</span>
              <div className="ml-auto flex items-center gap-2">
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <Grid3X3 className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* MA legend */}
            <div className="flex items-center gap-3 px-4 py-1.5 text-[10px]">
              <span style={{ color: "#f6c244" }}>MA7: {coin ? formatPrice(coin.price * 0.999) : "0"}</span>
              <span style={{ color: "#c084fc" }}>MA14: {coin ? formatPrice(coin.price * 0.998) : "0"}</span>
              <span style={{ color: "#60a5fa" }}>MA28: {coin ? formatPrice(coin.price * 0.997) : "0"}</span>
            </div>

            {/* Canvas chart */}
            <div className="relative px-2">
              <canvas
                ref={canvasRef}
                className="h-[340px] w-full"
                style={{ imageRendering: "pixelated" }}
              />
              {/* Watermark */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold tracking-widest text-foreground/[0.03]">BYBIT</span>
              </div>
            </div>

            {/* Volume legend */}
            <div className="flex items-center gap-3 px-4 pb-3 text-[10px]">
              <span className="text-primary">VOLUME: {candles.length > 0 ? candles[candles.length - 1].v.toFixed(3) : "0"}</span>
              <span className="text-[#c084fc]">MA5: {(candles.slice(-5).reduce((s, c) => s + c.v, 0) / 5).toFixed(3)}</span>
              <span className="text-[#60a5fa]">MA10: {(candles.slice(-10).reduce((s, c) => s + c.v, 0) / 10).toFixed(3)}</span>
            </div>

            {/* Indicator tabs */}
            <div className="scrollbar-none flex items-center gap-4 overflow-x-auto border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">MA</span>
              <span>EMA</span><span>BOLL</span><span>Mark</span><span>SAR</span>
              <span>MAVOL</span><span>MACD</span>
            </div>

            {/* Bottom action bar */}
            <div className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-background px-4 py-3">
              <button className="flex flex-col items-center gap-0.5 px-3">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Tools</span>
              </button>
              <button className="flex flex-col items-center gap-0.5 px-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Spot</span>
              </button>
              <Link href={`/trade?pair=${pair}`} className="flex flex-1 items-center justify-center rounded-lg bg-success py-3 text-sm font-bold text-card">
                Long
              </Link>
              <Link href={`/trade?pair=${pair}`} className="flex flex-1 items-center justify-center rounded-lg bg-destructive py-3 text-sm font-bold text-card">
                Short
              </Link>
            </div>
          </>
        )}

        {activeTab === "overview" && (
          <div className="p-4">
            <div className="rounded-xl bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">Contract Details</h3>
              <div className="mt-3 space-y-2">
                {[
                  ["Contract Type", "Perpetual"],
                  ["Settlement Asset", "USDT"],
                  ["Max Leverage", "100x"],
                  ["Funding Interval", "8h"],
                  ["Min Order Qty", "0.001 BTC"],
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
          <div className="p-4">
            <div className="rounded-xl bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">Market Data</h3>
              <div className="mt-3 space-y-2">
                {[
                  ["Open Interest", "45,231 BTC"],
                  ["24h Volume", "6.17B USDT"],
                  ["Funding Rate", "0.0100%"],
                  ["Next Funding", "02:59:38"],
                  ["Index Price", coin ? `$${formatPrice(coin.price)}` : "$0"],
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
          <div className="p-4">
            <p className="text-center text-sm text-muted-foreground">Community feed coming soon</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
