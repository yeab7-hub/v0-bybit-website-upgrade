"use client"

import { useEffect, useRef, memo } from "react"

interface TradingViewChartProps {
  symbol?: string
  theme?: "dark" | "light"
  className?: string
}

function TradingViewChartInner({ symbol = "BTCUSDT", theme = "dark", className }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clean up previous widget
    const container = containerRef.current
    container.innerHTML = ""

    // Map symbol to TradingView format
    const tvSymbol = `BYBIT:${symbol}`

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "15",
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      hide_volume: false,
      backgroundColor: theme === "dark" ? "rgba(11, 14, 17, 1)" : "rgba(255, 255, 255, 1)",
      gridColor: theme === "dark" ? "rgba(42, 46, 57, 0.3)" : "rgba(0, 0, 0, 0.06)",
      studies: ["STD;MA%Cross"],
    })

    scriptRef.current = script
    container.appendChild(script)

    return () => {
      if (container) container.innerHTML = ""
    }
  }, [symbol, theme])

  return (
    <div className={`tradingview-widget-container ${className || ""}`} style={{ width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  )
}

export const TradingViewChart = memo(TradingViewChartInner)
