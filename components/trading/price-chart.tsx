"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const timeframes = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"]
const chartTypes = ["Candles", "Line"] as const
const indicators = ["MA", "EMA", "BOLL", "VOL", "RSI", "MACD"] as const
type Indicator = (typeof indicators)[number]

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// ---- Indicator calculation helpers ----
function calcSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue }
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += data[j]
    result.push(sum / period)
  }
  return result
}

function calcEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = []
  const multiplier = 2 / (period + 1)
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue }
    if (i === period - 1) {
      let sum = 0
      for (let j = 0; j < period; j++) sum += data[j]
      result.push(sum / period)
      continue
    }
    const prev = result[i - 1]
    if (prev === null) { result.push(null); continue }
    result.push((data[i] - prev) * multiplier + prev)
  }
  return result
}

function calcBollinger(data: number[], period: number = 20, mult: number = 2) {
  const middle = calcSMA(data, period)
  const upper: (number | null)[] = []
  const lower: (number | null)[] = []
  for (let i = 0; i < data.length; i++) {
    if (middle[i] === null) { upper.push(null); lower.push(null); continue }
    let variance = 0
    for (let j = i - period + 1; j <= i; j++) variance += (data[j] - middle[i]!) ** 2
    const std = Math.sqrt(variance / period)
    upper.push(middle[i]! + mult * std)
    lower.push(middle[i]! - mult * std)
  }
  return { middle, upper, lower }
}

function calcRSI(data: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [null]
  const gains: number[] = []
  const losses: number[] = []
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? -change : 0)
    if (i < period) { result.push(null); continue }
    if (i === period) {
      const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
      const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period
      result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
      continue
    }
    const prevRsi = result[i - 1]
    if (prevRsi === null) { result.push(null); continue }
    const prevAvgGain = (100 / (100 - prevRsi) - 1) !== Infinity ? gains[gains.length - 1] : 0
    const avgGain = (prevAvgGain * (period - 1) + gains[gains.length - 1]) / period
    const avgLoss = ((100 - prevRsi) !== 0 ? losses[losses.length - 1] : 0)
    const smooth = (avgGain * (period - 1) + gains[gains.length - 1]) / period
    const smoothLoss = (avgLoss * (period - 1) + losses[losses.length - 1]) / period
    result.push(smoothLoss === 0 ? 100 : 100 - 100 / (1 + smooth / smoothLoss))
  }
  return result
}

export function PriceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTimeframe, setActiveTimeframe] = useState("15m")
  const [chartType, setChartType] = useState<typeof chartTypes[number]>("Candles")
  const [activeIndicators, setActiveIndicators] = useState<Set<Indicator>>(new Set(["VOL", "MA"]))
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false)
  const { crypto } = useLivePrices(3000)
  const btcData = crypto.find((c) => c.symbol === "BTC")
  const currentPrice = btcData?.price ?? 0
  const change24h = btcData?.change24h ?? 0
  const high24h = btcData?.high24h ?? 0
  const low24h = btcData?.low24h ?? 0

  const { data: candleData, error: candleError } = useSWR(
    `/api/candles?symbol=BTCUSDT&interval=${activeTimeframe}&limit=300`,
    fetcher,
    { refreshInterval: activeTimeframe === "1m" ? 5000 : 15000, revalidateOnFocus: true }
  )

  const candles: CandleData[] = candleData?.candles ?? []



  const toggleIndicator = (ind: Indicator) => {
    setActiveIndicators((prev) => {
      const next = new Set(prev)
      if (next.has(ind)) next.delete(ind)
      else next.add(ind)
      return next
    })
  }

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || candles.length === 0) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)
    const w = rect.width
    const h = rect.height

    // Background
    ctx.fillStyle = "hsl(220, 18%, 7%)"
    ctx.fillRect(0, 0, w, h)

    const hasSubChart = activeIndicators.has("RSI") || activeIndicators.has("MACD")
    const padding = { top: 20, right: 65, bottom: hasSubChart ? 80 : 40, left: 10 }
    const volH = activeIndicators.has("VOL") ? 50 : 0
    const chartH = h - padding.top - padding.bottom - volH - (hasSubChart ? 0 : 0)
    const chartW = w - padding.left - padding.right

    let minPrice = Infinity, maxPrice = -Infinity, maxVol = 0
    for (const c of candles) {
      if (c.low < minPrice) minPrice = c.low
      if (c.high > maxPrice) maxPrice = c.high
      if (c.volume > maxVol) maxVol = c.volume
    }
    const pricePad = (maxPrice - minPrice) * 0.06
    minPrice -= pricePad
    maxPrice += pricePad
    const totalRange = maxPrice - minPrice

    const candleWidth = chartW / candles.length
    const bodyWidth = Math.max(candleWidth * 0.6, 1.5)
    const priceToY = (p: number) => padding.top + ((maxPrice - p) / totalRange) * chartH

    // Grid lines
    ctx.strokeStyle = "hsla(220, 14%, 18%, 0.4)"
    ctx.lineWidth = 0.5
    const gridLines = 6
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * chartH
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(w - padding.right, y)
      ctx.stroke()

      const price = maxPrice - (i / gridLines) * totalRange
      ctx.fillStyle = "hsl(215, 12%, 40%)"
      ctx.font = "10px monospace"
      ctx.textAlign = "left"
      ctx.fillText(price.toFixed(price >= 1000 ? 0 : 2), w - padding.right + 6, y + 3)
    }

    // Time axis labels
    ctx.fillStyle = "hsl(215, 12%, 35%)"
    ctx.font = "9px monospace"
    ctx.textAlign = "center"
    const labelInterval = Math.max(Math.floor(candles.length / 8), 1)
    for (let i = 0; i < candles.length; i += labelInterval) {
      const x = padding.left + i * candleWidth + candleWidth / 2
      const d = new Date(candles[i].time * 1000)
      const label = activeTimeframe.includes("D") || activeTimeframe.includes("W")
        ? `${d.getMonth() + 1}/${d.getDate()}`
        : `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
      ctx.fillText(label, x, h - (hasSubChart ? 70 : padding.bottom - 25))
    }

    const closes = candles.map((c) => c.close)

    // Draw Bollinger Bands
    if (activeIndicators.has("BOLL")) {
      const boll = calcBollinger(closes, 20, 2)
      // Fill between bands
      ctx.fillStyle = "hsla(210, 60%, 50%, 0.04)"
      ctx.beginPath()
      let started = false
      for (let i = 0; i < candles.length; i++) {
        if (boll.upper[i] === null) continue
        const x = padding.left + i * candleWidth + candleWidth / 2
        if (!started) { ctx.moveTo(x, priceToY(boll.upper[i]!)); started = true }
        else ctx.lineTo(x, priceToY(boll.upper[i]!))
      }
      for (let i = candles.length - 1; i >= 0; i--) {
        if (boll.lower[i] === null) continue
        ctx.lineTo(padding.left + i * candleWidth + candleWidth / 2, priceToY(boll.lower[i]!))
      }
      ctx.closePath()
      ctx.fill()

      // Draw band lines
      for (const [line, color] of [[boll.upper, "hsla(210, 60%, 60%, 0.5)"], [boll.middle, "hsla(210, 60%, 60%, 0.4)"], [boll.lower, "hsla(210, 60%, 60%, 0.5)"]] as const) {
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.beginPath()
        let s = false
        for (let i = 0; i < candles.length; i++) {
          if (line[i] === null) continue
          const x = padding.left + i * candleWidth + candleWidth / 2
          if (!s) { ctx.moveTo(x, priceToY(line[i]!)); s = true }
          else ctx.lineTo(x, priceToY(line[i]!))
        }
        ctx.stroke()
      }
    }

    // Draw MA lines
    if (activeIndicators.has("MA")) {
      const ma7 = calcSMA(closes, 7)
      const ma25 = calcSMA(closes, 25)
      const ma99 = calcSMA(closes, 99)
      for (const [line, color] of [[ma7, "hsl(45, 90%, 60%)"], [ma25, "hsl(280, 70%, 65%)"], [ma99, "hsl(190, 80%, 55%)"]] as const) {
        ctx.strokeStyle = color
        ctx.lineWidth = 1.2
        ctx.beginPath()
        let s = false
        for (let i = 0; i < candles.length; i++) {
          if (line[i] === null) continue
          const x = padding.left + i * candleWidth + candleWidth / 2
          if (!s) { ctx.moveTo(x, priceToY(line[i]!)); s = true }
          else ctx.lineTo(x, priceToY(line[i]!))
        }
        ctx.stroke()
      }
    }

    // Draw EMA lines
    if (activeIndicators.has("EMA")) {
      const ema9 = calcEMA(closes, 9)
      const ema21 = calcEMA(closes, 21)
      for (const [line, color] of [[ema9, "hsl(30, 90%, 60%)"], [ema21, "hsl(330, 70%, 60%)"]] as const) {
        ctx.strokeStyle = color
        ctx.lineWidth = 1.2
        ctx.setLineDash([4, 2])
        ctx.beginPath()
        let s = false
        for (let i = 0; i < candles.length; i++) {
          if (line[i] === null) continue
          const x = padding.left + i * candleWidth + candleWidth / 2
          if (!s) { ctx.moveTo(x, priceToY(line[i]!)); s = true }
          else ctx.lineTo(x, priceToY(line[i]!))
        }
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // Draw candles or line
    if (chartType === "Candles") {
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i]
        const x = padding.left + i * candleWidth + candleWidth / 2
        const isGreen = c.close >= c.open
        const color = isGreen ? "hsl(142, 72%, 50%)" : "hsl(0, 72%, 51%)"

        // Wick
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, priceToY(c.high))
        ctx.lineTo(x, priceToY(c.low))
        ctx.stroke()

        // Body
        ctx.fillStyle = color
        const oY = priceToY(c.open)
        const cY = priceToY(c.close)
        ctx.fillRect(x - bodyWidth / 2, Math.min(oY, cY), bodyWidth, Math.max(Math.abs(cY - oY), 1))
      }
    } else {
      // Line chart
      ctx.strokeStyle = "hsl(210, 80%, 60%)"
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let i = 0; i < candles.length; i++) {
        const x = padding.left + i * candleWidth + candleWidth / 2
        const y = priceToY(candles[i].close)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Area fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH)
      gradient.addColorStop(0, "hsla(210, 80%, 60%, 0.15)")
      gradient.addColorStop(1, "hsla(210, 80%, 60%, 0)")
      ctx.fillStyle = gradient
      ctx.beginPath()
      for (let i = 0; i < candles.length; i++) {
        const x = padding.left + i * candleWidth + candleWidth / 2
        if (i === 0) ctx.moveTo(x, priceToY(candles[i].close))
        else ctx.lineTo(x, priceToY(candles[i].close))
      }
      ctx.lineTo(padding.left + (candles.length - 1) * candleWidth + candleWidth / 2, padding.top + chartH)
      ctx.lineTo(padding.left + candleWidth / 2, padding.top + chartH)
      ctx.closePath()
      ctx.fill()
    }

    // Volume bars
    if (activeIndicators.has("VOL")) {
      const volTop = padding.top + chartH + 5
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i]
        const x = padding.left + i * candleWidth + candleWidth / 2
        const isGreen = c.close >= c.open
        const barH = (c.volume / maxVol) * (volH - 5)
        ctx.fillStyle = isGreen ? "hsla(142, 72%, 50%, 0.25)" : "hsla(0, 72%, 51%, 0.25)"
        ctx.fillRect(x - bodyWidth / 2, volTop + volH - 5 - barH, bodyWidth, barH)
      }
    }

    // RSI sub-chart
    if (activeIndicators.has("RSI")) {
      const rsi = calcRSI(closes, 14)
      const rsiTop = h - padding.bottom
      const rsiH = padding.bottom - 10

      // RSI grid
      ctx.strokeStyle = "hsla(220, 14%, 18%, 0.3)"
      ctx.lineWidth = 0.5
      for (const level of [30, 50, 70]) {
        const y = rsiTop + (1 - level / 100) * rsiH
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(w - padding.right, y)
        ctx.stroke()
        ctx.fillStyle = "hsl(215, 12%, 30%)"
        ctx.font = "8px monospace"
        ctx.textAlign = "left"
        ctx.fillText(String(level), w - padding.right + 6, y + 3)
      }

      // RSI line
      ctx.strokeStyle = "hsl(280, 70%, 65%)"
      ctx.lineWidth = 1.2
      ctx.beginPath()
      let s = false
      for (let i = 0; i < candles.length; i++) {
        if (rsi[i] === null) continue
        const x = padding.left + i * candleWidth + candleWidth / 2
        const y = rsiTop + (1 - rsi[i]! / 100) * rsiH
        if (!s) { ctx.moveTo(x, y); s = true }
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    // Crosshair
    if (mousePos) {
      ctx.strokeStyle = "hsla(215, 12%, 55%, 0.3)"
      ctx.lineWidth = 0.5
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(mousePos.x, padding.top)
      ctx.lineTo(mousePos.x, h - 10)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(padding.left, mousePos.y)
      ctx.lineTo(w - padding.right, mousePos.y)
      ctx.stroke()
      ctx.setLineDash([])

      if (mousePos.y >= padding.top && mousePos.y <= padding.top + chartH) {
        const price = maxPrice - ((mousePos.y - padding.top) / chartH) * totalRange
        ctx.fillStyle = "hsl(220, 14%, 14%)"
        ctx.fillRect(w - padding.right, mousePos.y - 10, padding.right, 20)
        ctx.strokeStyle = "hsl(215, 12%, 30%)"
        ctx.lineWidth = 1
        ctx.strokeRect(w - padding.right, mousePos.y - 10, padding.right, 20)
        ctx.fillStyle = "hsl(210, 20%, 90%)"
        ctx.font = "10px monospace"
        ctx.textAlign = "left"
        ctx.fillText(price.toFixed(2), w - padding.right + 5, mousePos.y + 4)
      }
    }

    // Current price line
    const last = candles[candles.length - 1]
    const lastY = priceToY(last.close)
    const isLastGreen = last.close >= last.open
    const priceColor = isLastGreen ? "hsl(142, 72%, 50%)" : "hsl(0, 72%, 51%)"
    ctx.strokeStyle = priceColor
    ctx.lineWidth = 0.5
    ctx.setLineDash([2, 3])
    ctx.beginPath()
    ctx.moveTo(padding.left, lastY)
    ctx.lineTo(w - padding.right, lastY)
    ctx.stroke()
    ctx.setLineDash([])

    // Price label
    ctx.fillStyle = priceColor
    const labelW = padding.right
    ctx.fillRect(w - labelW, lastY - 10, labelW, 20)
    ctx.fillStyle = isLastGreen ? "hsl(0, 0%, 5%)" : "hsl(0, 0%, 100%)"
    ctx.font = "bold 10px monospace"
    ctx.textAlign = "left"
    ctx.fillText(last.close.toFixed(2), w - labelW + 5, lastY + 4)
  }, [candles, mousePos, chartType, activeIndicators, activeTimeframe])

  useEffect(() => {
    drawChart()
    const onResize = () => drawChart()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [drawChart])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y })

    const cr = container.getBoundingClientRect()
    const padding = { left: 10, right: 65 }
    const chartW = cr.width - padding.left - padding.right
    const candleWidth = chartW / candles.length
    const idx = Math.floor((x - padding.left) / candleWidth)
    if (idx >= 0 && idx < candles.length) setHoveredCandle(candles[idx])
  }

  const lastCandle = candles[candles.length - 1]
  const displayCandle = hoveredCandle || lastCandle
  const isGreen = displayCandle ? displayCandle.close >= displayCandle.open : change24h >= 0

  return (
    <div className="flex h-full flex-col">
      {/* Top info bar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">BTC/USDT</span>
            <span className={`text-xs font-semibold ${isGreen ? "text-success" : "text-destructive"}`}>
              {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
            </span>
            {currentPrice > 0 && (
              <span className={`font-mono text-base font-bold ${isGreen ? "text-success" : "text-destructive"}`}>
                ${formatPrice(currentPrice)}
              </span>
            )}
          </div>
          <div className="hidden items-center gap-5 lg:flex">
            {[
              { label: "24h High", value: high24h ? formatPrice(high24h) : "-" },
              { label: "24h Low", value: low24h ? formatPrice(low24h) : "-" },
              { label: "24h Vol", value: btcData ? `${(btcData.volume / 1e9).toFixed(2)}B` : "-" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[9px] text-muted-foreground">{s.label}</div>
                <div className="font-mono text-[11px] text-foreground">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-1">
        <div className="flex items-center gap-1">
          {/* Timeframes */}
          {timeframes.map((tf) => (
            <button key={tf} onClick={() => setActiveTimeframe(tf)}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${activeTimeframe === tf ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {tf}
            </button>
          ))}
          <div className="mx-1 h-3 w-px bg-border" />
          {/* Chart type */}
          {chartTypes.map((ct) => (
            <button key={ct} onClick={() => setChartType(ct)}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${chartType === ct ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {ct}
            </button>
          ))}
          <div className="mx-1 h-3 w-px bg-border" />
          {/* Indicators */}
          <div className="relative">
            <button onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground">
              Indicators ({activeIndicators.size})
            </button>
            {showIndicatorMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowIndicatorMenu(false)} />
                <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-card p-1 shadow-xl">
                  {indicators.map((ind) => (
                    <button key={ind} onClick={() => toggleIndicator(ind)}
                      className="flex w-full items-center justify-between rounded px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">
                      <span>{ind === "MA" ? "MA (7,25,99)" : ind === "EMA" ? "EMA (9,21)" : ind === "BOLL" ? "Bollinger Bands" : ind === "VOL" ? "Volume" : ind === "RSI" ? "RSI (14)" : "MACD"}</span>
                      {activeIndicators.has(ind) && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* OHLCV display */}
        {displayCandle && (
          <div className="hidden items-center gap-3 md:flex">
            {[
              { l: "O", v: displayCandle.open.toFixed(2), c: "" },
              { l: "H", v: displayCandle.high.toFixed(2), c: "" },
              { l: "L", v: displayCandle.low.toFixed(2), c: "" },
              { l: "C", v: displayCandle.close.toFixed(2), c: isGreen ? "text-success" : "text-destructive" },
            ].map((d) => (
              <span key={d.l} className="text-[9px] text-muted-foreground">
                {d.l} <span className={`font-mono ${d.c || "text-foreground"}`}>{d.v}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative min-h-[400px] flex-1">
        {candles.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              {candleError ? (
                <>
                  <span className="text-xs text-destructive">Failed to load chart data</span>
                  <button onClick={() => window.location.reload()} className="text-xs text-primary hover:underline">Retry</button>
                </>
              ) : (
                <>
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-xs text-muted-foreground">Loading chart data...</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { setMousePos(null); setHoveredCandle(null) }} />
        )}
      </div>
    </div>
  )
}
