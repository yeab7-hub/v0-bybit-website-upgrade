"use client"

import { memo, useEffect, useRef, useMemo } from "react"

interface TradingViewChartProps {
  symbol?: string
  theme?: "dark" | "light"
  className?: string
  interval?: string
  hideTopToolbar?: boolean
}

function getTradingViewSymbol(pair: string): string {
  const clean = pair.replace("/", "").toUpperCase()

  const cryptoMap: Record<string, string> = {
    BTCUSDT: "BINANCE:BTCUSDT", ETHUSDT: "BINANCE:ETHUSDT",
    SOLUSDT: "BINANCE:SOLUSDT", XRPUSDT: "BINANCE:XRPUSDT",
    BNBUSDT: "BINANCE:BNBUSDT", ADAUSDT: "BINANCE:ADAUSDT",
    DOGEUSDT: "BINANCE:DOGEUSDT", AVAXUSDT: "BINANCE:AVAXUSDT",
    DOTUSDT: "BINANCE:DOTUSDT", LINKUSDT: "BINANCE:LINKUSDT",
    MATICUSDT: "BINANCE:MATICUSDT", LTCUSDT: "BINANCE:LTCUSDT",
    SHIBUSDT: "BINANCE:SHIBUSDT", ATOMUSDT: "BINANCE:ATOMUSDT",
    NEARUSDT: "BINANCE:NEARUSDT", UNIUSDT: "BINANCE:UNIUSDT",
    SUIUSDT: "BINANCE:SUIUSDT", APTUSDT: "BINANCE:APTUSDT",
    OPUSDT: "BINANCE:OPUSDT", ARBUSDT: "BINANCE:ARBUSDT",
    TRXUSDT: "BINANCE:TRXUSDT", TONUSDT: "OKX:TONUSDT",
  }
  if (cryptoMap[clean]) return cryptoMap[clean]
  if (clean.endsWith("USDT")) return `BINANCE:${clean}`

  const forexPairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCHF", "USDCAD", "NZDUSD"]
  const forexClean = clean.replace("/", "")
  if (forexPairs.includes(forexClean)) return `FX:${forexClean}`

  const commodityMap: Record<string, string> = {
    XAUUSD: "TVC:GOLD", XAGUSD: "TVC:SILVER",
    WTIUSD: "TVC:USOIL", BRENTUSD: "TVC:UKOIL",
    NGUSD: "NYMEX:NG1!",
  }
  if (commodityMap[forexClean]) return commodityMap[forexClean]

  const stockMap: Record<string, string> = {
    AAPL: "NASDAQ:AAPL", MSFT: "NASDAQ:MSFT", GOOGL: "NASDAQ:GOOGL",
    AMZN: "NASDAQ:AMZN", TSLA: "NASDAQ:TSLA", NVDA: "NASDAQ:NVDA", META: "NASDAQ:META",
  }
  if (stockMap[clean]) return stockMap[clean]

  return `BINANCE:${clean}`
}

function TradingViewChartInner({
  symbol = "BTCUSDT",
  theme = "dark",
  className,
  interval = "15",
  hideTopToolbar = false,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string>(`tv_${Math.random().toString(36).slice(2)}`)

  const tvSymbol = useMemo(() => getTradingViewSymbol(symbol), [symbol])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear previous widget
    container.innerHTML = ""

    // Create script for TradingView widget
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: interval,
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: hideTopToolbar,
      hide_legend: false,
      save_image: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      backgroundColor: theme === "dark" ? "rgba(11,14,17,1)" : "rgba(255,255,255,1)",
      gridColor: theme === "dark" ? "rgba(42,46,57,0.3)" : "rgba(0,0,0,0.06)",
      withdateranges: true,
      hide_side_toolbar: false,
      details: false,
      hotlist: false,
      studies: ["MASimple@tv-basicstudies", "Volume@tv-basicstudies"],
    })

    // Wrap in the TradingView widget container div
    const widgetDiv = document.createElement("div")
    widgetDiv.className = "tradingview-widget-container"
    widgetDiv.style.height = "100%"
    widgetDiv.style.width = "100%"

    const innerDiv = document.createElement("div")
    innerDiv.className = "tradingview-widget-container__widget"
    innerDiv.style.height = "calc(100% - 32px)"
    innerDiv.style.width = "100%"

    widgetDiv.appendChild(innerDiv)
    widgetDiv.appendChild(script)
    container.appendChild(widgetDiv)

    return () => {
      if (container) container.innerHTML = ""
    }
  }, [tvSymbol, theme, interval, hideTopToolbar])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className || ""}`}
      style={{ width: "100%", height: "100%", minHeight: "300px" }}
      id={widgetIdRef.current}
    />
  )
}

export const TradingViewChart = memo(TradingViewChartInner)
