"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"

const timeframes = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"]

interface Candle {
  open: number
  high: number
  low: number
  close: number
  volume: number
  time: number
}

function generateCandlesFromBase(basePrice: number, count: number): Candle[] {
  const candles: Candle[] = []
  let price = basePrice * (0.97 + Math.random() * 0.03)
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const volatility = basePrice * 0.003
    const change = (Math.random() - 0.48) * volatility
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    const volume = 50 + Math.random() * 200

    candles.push({ open, high, low, close, volume, time: now - (count - i) * 60000 })
    price = close
  }
  // Ensure last candle closes at current real price
  if (candles.length > 0) {
    candles[candles.length - 1].close = basePrice
    candles[candles.length - 1].high = Math.max(candles[candles.length - 1].high, basePrice)
    candles[candles.length - 1].low = Math.min(candles[candles.length - 1].low, basePrice)
  }
  return candles
}

export function PriceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTimeframe, setActiveTimeframe] = useState("15m")
  const [candles, setCandles] = useState<Candle[]>([])
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const { crypto } = useLivePrices(5000)
  const btcData = crypto.find((c) => c.symbol === "BTC")
  const currentPrice = btcData?.price ?? 0
  const change24h = btcData?.change24h ?? 0
  const high24h = btcData?.high24h ?? 0
  const low24h = btcData?.low24h ?? 0

  // Generate initial candles or update last candle
  useEffect(() => {
    if (currentPrice <= 0) return
    setCandles((prev) => {
      if (prev.length === 0) return generateCandlesFromBase(currentPrice, 80)
      // Update last candle with live price
      const updated = [...prev]
      const last = { ...updated[updated.length - 1] }
      last.close = currentPrice
      last.high = Math.max(last.high, currentPrice)
      last.low = Math.min(last.low, currentPrice)
      updated[updated.length - 1] = last
      return updated
    })
  }, [currentPrice])

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

    ctx.fillStyle = "hsl(220, 18%, 7%)"
    ctx.fillRect(0, 0, w, h)

    const padding = { top: 20, right: 60, bottom: 40, left: 10 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    let minPrice = Infinity
    let maxPrice = -Infinity
    let maxVol = 0
    for (const c of candles) {
      if (c.low < minPrice) minPrice = c.low
      if (c.high > maxPrice) maxPrice = c.high
      if (c.volume > maxVol) maxVol = c.volume
    }
    const priceRange = maxPrice - minPrice
    const pricePadding = priceRange * 0.05
    minPrice -= pricePadding
    maxPrice += pricePadding
    const totalRange = maxPrice - minPrice

    // Grid
    ctx.strokeStyle = "hsl(220, 14%, 12%)"
    ctx.lineWidth = 0.5
    const gridLines = 6
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * chartH
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(w - padding.right, y)
      ctx.stroke()
      const price = maxPrice - (i / gridLines) * totalRange
      ctx.fillStyle = "hsl(215, 12%, 45%)"
      ctx.font = "11px monospace"
      ctx.textAlign = "left"
      ctx.fillText(price.toFixed(0), w - padding.right + 8, y + 4)
    }

    // Candles
    const candleWidth = chartW / candles.length
    const bodyWidth = Math.max(candleWidth * 0.6, 2)

    for (let i = 0; i < candles.length; i++) {
      const c = candles[i]
      const x = padding.left + i * candleWidth + candleWidth / 2
      const isGreen = c.close >= c.open

      const highY = padding.top + ((maxPrice - c.high) / totalRange) * chartH
      const lowY = padding.top + ((maxPrice - c.low) / totalRange) * chartH
      const openY = padding.top + ((maxPrice - c.open) / totalRange) * chartH
      const closeY = padding.top + ((maxPrice - c.close) / totalRange) * chartH

      ctx.strokeStyle = isGreen ? "hsl(142, 72%, 50%)" : "hsl(0, 72%, 51%)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      ctx.fillStyle = isGreen ? "hsl(142, 72%, 50%)" : "hsl(0, 72%, 51%)"
      const bodyTop = Math.min(openY, closeY)
      const bodyH = Math.max(Math.abs(closeY - openY), 1)
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyH)

      const volH = (c.volume / maxVol) * (chartH * 0.15)
      ctx.fillStyle = isGreen ? "hsla(142, 72%, 50%, 0.15)" : "hsla(0, 72%, 51%, 0.15)"
      ctx.fillRect(x - bodyWidth / 2, padding.top + chartH - volH, bodyWidth, volH)
    }

    // Crosshair
    if (mousePos) {
      ctx.strokeStyle = "hsla(215, 12%, 55%, 0.4)"
      ctx.lineWidth = 0.5
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(mousePos.x, padding.top)
      ctx.lineTo(mousePos.x, padding.top + chartH)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(padding.left, mousePos.y)
      ctx.lineTo(w - padding.right, mousePos.y)
      ctx.stroke()
      ctx.setLineDash([])
      if (mousePos.y >= padding.top && mousePos.y <= padding.top + chartH) {
        const price = maxPrice - ((mousePos.y - padding.top) / chartH) * totalRange
        ctx.fillStyle = "hsl(220, 14%, 16%)"
        ctx.fillRect(w - padding.right, mousePos.y - 10, padding.right, 20)
        ctx.fillStyle = "hsl(210, 20%, 95%)"
        ctx.font = "11px monospace"
        ctx.textAlign = "left"
        ctx.fillText(price.toFixed(2), w - padding.right + 8, mousePos.y + 4)
      }
    }

    // Current price line
    const lastCandle = candles[candles.length - 1]
    const lastY = padding.top + ((maxPrice - lastCandle.close) / totalRange) * chartH
    const isLastGreen = lastCandle.close >= lastCandle.open
    ctx.strokeStyle = isLastGreen ? "hsl(142, 72%, 50%)" : "hsl(0, 72%, 51%)"
    ctx.lineWidth = 0.5
    ctx.setLineDash([2, 3])
    ctx.beginPath()
    ctx.moveTo(padding.left, lastY)
    ctx.lineTo(w - padding.right, lastY)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = isLastGreen ? "hsl(142, 72%, 50%)" : "hsl(0, 72%, 51%)"
    ctx.fillRect(w - padding.right, lastY - 10, padding.right, 20)
    ctx.fillStyle = isLastGreen ? "hsl(220, 20%, 4%)" : "hsl(0, 0%, 100%)"
    ctx.font = "bold 11px monospace"
    ctx.textAlign = "left"
    ctx.fillText(lastCandle.close.toFixed(2), w - padding.right + 6, lastY + 4)
  }, [candles, mousePos])

  useEffect(() => {
    drawChart()
    const handleResize = () => drawChart()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [drawChart])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y })
    const container = containerRef.current
    if (!container) return
    const cr = container.getBoundingClientRect()
    const padding = { left: 10, right: 60 }
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
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">BTC/USDT</span>
            <span className={`text-sm font-medium ${isGreen ? "text-success" : "text-destructive"}`}>
              {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
            </span>
            {currentPrice > 0 && (
              <span className="ml-2 font-mono text-sm font-bold text-foreground">
                ${formatPrice(currentPrice)}
              </span>
            )}
          </div>

          <div className="hidden items-center gap-6 lg:flex">
            <div>
              <div className="text-[10px] text-muted-foreground">24h High</div>
              <div className="font-mono text-xs text-foreground">
                {high24h ? formatPrice(high24h) : "-"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">24h Low</div>
              <div className="font-mono text-xs text-foreground">
                {low24h ? formatPrice(low24h) : "-"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">24h Vol(BTC)</div>
              <div className="font-mono text-xs text-foreground">
                {btcData ? Math.round(btcData.volume / currentPrice).toLocaleString() : "-"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">24h Vol(USDT)</div>
              <div className="font-mono text-xs text-foreground">
                {btcData ? `${(btcData.volume / 1e9).toFixed(2)}B` : "-"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-secondary p-0.5">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`rounded px-2 py-1 text-xs font-medium ${
                activeTimeframe === tf ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* OHLC display */}
      {displayCandle && (
        <div className="flex items-center gap-4 border-b border-border px-4 py-1.5">
          <span className="text-[10px] text-muted-foreground">
            O <span className="font-mono text-foreground">{displayCandle.open.toFixed(2)}</span>
          </span>
          <span className="text-[10px] text-muted-foreground">
            H <span className="font-mono text-foreground">{displayCandle.high.toFixed(2)}</span>
          </span>
          <span className="text-[10px] text-muted-foreground">
            L <span className="font-mono text-foreground">{displayCandle.low.toFixed(2)}</span>
          </span>
          <span className="text-[10px] text-muted-foreground">
            C <span className={`font-mono ${isGreen ? "text-success" : "text-destructive"}`}>{displayCandle.close.toFixed(2)}</span>
          </span>
        </div>
      )}

      <div ref={containerRef} className="relative flex-1">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setMousePos(null); setHoveredCandle(null) }}
        />
      </div>
    </div>
  )
}
