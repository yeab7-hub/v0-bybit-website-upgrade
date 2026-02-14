"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import useSWR from "swr"
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type LineData,
  type Time,
  CrosshairMode,
  ColorType,
} from "lightweight-charts"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const timeframes = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1H", value: "1H" },
  { label: "4H", value: "4H" },
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
]

const indicatorList = ["MA", "EMA", "BOLL", "VOL"] as const
type Indicator = (typeof indicatorList)[number]

function calcMA(data: CandlestickData<Time>[], period: number): LineData<Time>[] {
  const result: LineData<Time>[] = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += (data[j] as CandlestickData<Time>).close
    result.push({ time: data[i].time, value: sum / period })
  }
  return result
}

function calcEMA(data: CandlestickData<Time>[], period: number): LineData<Time>[] {
  const result: LineData<Time>[] = []
  const k = 2 / (period + 1)
  let ema = (data[0] as CandlestickData<Time>).close
  result.push({ time: data[0].time, value: ema })
  for (let i = 1; i < data.length; i++) {
    ema = (data[i] as CandlestickData<Time>).close * k + ema * (1 - k)
    result.push({ time: data[i].time, value: ema })
  }
  return result
}

function calcBollinger(data: CandlestickData<Time>[], period = 20, mult = 2) {
  const upper: LineData<Time>[] = []
  const middle: LineData<Time>[] = []
  const lower: LineData<Time>[] = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += (data[j] as CandlestickData<Time>).close
    const avg = sum / period
    let sqSum = 0
    for (let j = i - period + 1; j <= i; j++) sqSum += Math.pow((data[j] as CandlestickData<Time>).close - avg, 2)
    const std = Math.sqrt(sqSum / period)
    middle.push({ time: data[i].time, value: avg })
    upper.push({ time: data[i].time, value: avg + mult * std })
    lower.push({ time: data[i].time, value: avg - mult * std })
  }
  return { upper, middle, lower }
}

export function PriceChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const indicatorSeriesRef = useRef<ISeriesApi<"Line">[]>([])

  const [activeTimeframe, setActiveTimeframe] = useState("15m")
  const [activeIndicators, setActiveIndicators] = useState<Set<Indicator>>(new Set(["VOL", "MA"]))
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false)
  const [chartType, setChartType] = useState<"Candles" | "Line">("Candles")
  const [ohlc, setOhlc] = useState<{ o: number; h: number; l: number; c: number; v: number; t: number } | null>(null)

  const { data: candleData, error: candleError } = useSWR(
    `/api/candles?symbol=BTCUSDT&interval=${activeTimeframe}&limit=500`,
    fetcher,
    { refreshInterval: activeTimeframe === "1m" ? 3000 : 10000, revalidateOnFocus: true }
  )

  const candles: CandlestickData<Time>[] = (candleData?.candles ?? []).map(
    (c: { time: number; open: number; high: number; low: number; close: number; volume: number }) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    })
  )

  const toggleIndicator = (ind: Indicator) => {
    setActiveIndicators((prev) => {
      const next = new Set(prev)
      if (next.has(ind)) next.delete(ind)
      else next.add(ind)
      return next
    })
  }

  // Create chart once
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#848e9c",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(42, 46, 57, 0.5)" },
        horzLines: { color: "rgba(42, 46, 57, 0.5)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(255, 255, 255, 0.2)", width: 1, style: 3, labelBackgroundColor: "#2a2e39" },
        horzLine: { color: "rgba(255, 255, 255, 0.2)", width: 1, style: 3, labelBackgroundColor: "#2a2e39" },
      },
      timeScale: {
        borderColor: "rgba(42, 46, 57, 0.8)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 8,
      },
      rightPriceScale: {
        borderColor: "rgba(42, 46, 57, 0.8)",
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      handleScroll: { vertTouchDrag: false },
    })

    chartRef.current = chart

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      chart.applyOptions({ width, height })
    })
    ro.observe(chartContainerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
      indicatorSeriesRef.current = []
    }
  }, [])

  // Update data and indicators
  const updateChart = useCallback(() => {
    const chart = chartRef.current
    if (!chart || candles.length === 0) return

    // Remove old series
    if (candleSeriesRef.current) {
      try { chart.removeSeries(candleSeriesRef.current) } catch { /* ignore */ }
      candleSeriesRef.current = null
    }
    if (volumeSeriesRef.current) {
      try { chart.removeSeries(volumeSeriesRef.current) } catch { /* ignore */ }
      volumeSeriesRef.current = null
    }
    indicatorSeriesRef.current.forEach((s) => {
      try { chart.removeSeries(s) } catch { /* ignore */ }
    })
    indicatorSeriesRef.current = []

    // Candlestick series
    if (chartType === "Candles") {
      const cs = chart.addCandlestickSeries({
        upColor: "#0ecb81",
        downColor: "#f6465d",
        borderUpColor: "#0ecb81",
        borderDownColor: "#f6465d",
        wickUpColor: "#0ecb81",
        wickDownColor: "#f6465d",
      })
      cs.setData(candles)
      candleSeriesRef.current = cs
    } else {
      const ls = chart.addCandlestickSeries({
        upColor: "#f7a600",
        downColor: "#f7a600",
        borderUpColor: "#f7a600",
        borderDownColor: "#f7a600",
        wickUpColor: "#f7a600",
        wickDownColor: "#f7a600",
      })
      ls.setData(candles)
      candleSeriesRef.current = ls
    }

    // Volume
    if (activeIndicators.has("VOL")) {
      const vs = chart.addHistogramSeries({
        priceFormat: { type: "volume" },
        priceScaleId: "vol",
      })
      chart.priceScale("vol").applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      })
      const volData: HistogramData<Time>[] = candles.map((c) => ({
        time: c.time,
        value: (c as unknown as { volume: number }).volume ?? 0,
        color: c.close >= c.open ? "rgba(14, 203, 129, 0.25)" : "rgba(246, 70, 93, 0.25)",
      }))
      vs.setData(volData)
      volumeSeriesRef.current = vs
    }

    // MA indicators
    if (activeIndicators.has("MA")) {
      const colors = ["#f7a600", "#e84393", "#00cec9"]
      const periods = [7, 25, 99]
      periods.forEach((p, i) => {
        const data = calcMA(candles, p)
        if (data.length > 0) {
          const s = chart.addLineSeries({ color: colors[i], lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
          s.setData(data)
          indicatorSeriesRef.current.push(s)
        }
      })
    }

    // EMA indicators
    if (activeIndicators.has("EMA")) {
      const colors = ["#74b9ff", "#fd79a8"]
      const periods = [9, 21]
      periods.forEach((p, i) => {
        const data = calcEMA(candles, p)
        if (data.length > 0) {
          const s = chart.addLineSeries({ color: colors[i], lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
          s.setData(data)
          indicatorSeriesRef.current.push(s)
        }
      })
    }

    // Bollinger Bands
    if (activeIndicators.has("BOLL")) {
      const { upper, middle, lower } = calcBollinger(candles)
      if (middle.length > 0) {
        const su = chart.addLineSeries({ color: "rgba(99, 110, 114, 0.6)", lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
        su.setData(upper)
        const sm = chart.addLineSeries({ color: "#636e72", lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
        sm.setData(middle)
        const sl = chart.addLineSeries({ color: "rgba(99, 110, 114, 0.6)", lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
        sl.setData(lower)
        indicatorSeriesRef.current.push(su, sm, sl)
      }
    }

    // Crosshair move for OHLC display
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !candleSeriesRef.current) {
        setOhlc(null)
        return
      }
      const d = param.seriesData.get(candleSeriesRef.current) as CandlestickData<Time> | undefined
      const v = volumeSeriesRef.current ? (param.seriesData.get(volumeSeriesRef.current) as HistogramData<Time> | undefined) : undefined
      if (d) {
        setOhlc({ o: d.open, h: d.high, l: d.low, c: d.close, v: v?.value ?? 0, t: d.time as number })
      }
    })

    chart.timeScale().fitContent()
  }, [candles, activeIndicators, chartType])

  useEffect(() => {
    updateChart()
  }, [updateChart])

  const lastCandle = candles[candles.length - 1]
  const prevCandle = candles.length > 1 ? candles[candles.length - 2] : lastCandle
  const isUp = lastCandle && prevCandle ? lastCandle.close >= prevCandle.close : true
  const display = ohlc || (lastCandle ? { o: lastCandle.open, h: lastCandle.high, l: lastCandle.low, c: lastCandle.close, v: 0, t: 0 } : null)

  return (
    <div className="flex h-full flex-col">
      {/* Top bar: Timeframes, Chart type, Indicators */}
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-1">
          {/* Timeframes */}
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setActiveTimeframe(tf.value)}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                activeTimeframe === tf.value
                  ? "bg-[#f7a600]/10 text-[#f7a600]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf.label}
            </button>
          ))}

          <div className="mx-1 h-4 w-px bg-border" />

          {/* Chart type */}
          {(["Candles", "Line"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`rounded px-2 py-1 text-[11px] font-medium ${
                chartType === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}

          <div className="mx-1 h-4 w-px bg-border" />

          {/* Indicators */}
          <div className="relative">
            <button
              onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
              className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Indicators
              {activeIndicators.size > 0 && (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#f7a600] text-[8px] font-bold text-[#0a0e17]">
                  {activeIndicators.size}
                </span>
              )}
            </button>
            {showIndicatorMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowIndicatorMenu(false)} />
                <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card p-1 shadow-xl">
                  {indicatorList.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => toggleIndicator(ind)}
                      className="flex w-full items-center justify-between rounded px-3 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <span>
                        {ind === "MA" ? "MA (7, 25, 99)" : ind === "EMA" ? "EMA (9, 21)" : ind === "BOLL" ? "Bollinger Bands" : "Volume"}
                      </span>
                      {activeIndicators.has(ind) && <span className="h-2 w-2 rounded-full bg-[#f7a600]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* OHLCV display */}
        {display && (
          <div className="hidden items-center gap-3 lg:flex">
            <span className="text-[10px] text-muted-foreground">
              O <span className="font-mono text-foreground">{display.o.toFixed(2)}</span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              H <span className="font-mono text-foreground">{display.h.toFixed(2)}</span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              L <span className="font-mono text-foreground">{display.l.toFixed(2)}</span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              C <span className={`font-mono ${isUp ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{display.c.toFixed(2)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Chart canvas */}
      <div className="relative flex-1">
        {candles.length === 0 && !candleError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#f7a600] border-t-transparent" />
              <span className="text-xs text-muted-foreground">Loading chart...</span>
            </div>
          </div>
        )}
        {candleError && candles.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-destructive">Failed to load chart data</span>
              <button onClick={() => window.location.reload()} className="rounded bg-secondary px-3 py-1 text-xs text-foreground hover:bg-secondary/80">
                Retry
              </button>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="h-full w-full" />
      </div>
    </div>
  )
}
