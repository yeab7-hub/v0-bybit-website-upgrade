"use client"

import { useEffect, useRef, memo } from "react"

interface PriceChartProps {
  symbol?: string
}

// Map non-crypto symbols to TradingView format
function getTradingViewSymbol(symbol: string): string {
  // Forex pairs
  const forexMap: Record<string, string> = {
    "EUR/USD": "FX:EURUSD",
    "GBP/USD": "FX:GBPUSD",
    "USD/JPY": "FX:USDJPY",
    "AUD/USD": "FX:AUDUSD",
    "USD/CHF": "FX:USDCHF",
  }
  if (forexMap[symbol]) return forexMap[symbol]

  // Commodities
  const commodityMap: Record<string, string> = {
    "XAU/USD": "TVC:GOLD",
    "XAG/USD": "TVC:SILVER",
    "WTI": "TVC:USOIL",
    "BRENT": "TVC:UKOIL",
    "NG": "NYMEX:NG1!",
  }
  if (commodityMap[symbol]) return commodityMap[symbol]

  // Stocks
  const stockSymbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"]
  if (stockSymbols.includes(symbol)) return `NASDAQ:${symbol}`

  // Default: Binance crypto
  return `BINANCE:${symbol}`
}

function TradingViewChart({ symbol = "BTCUSDT" }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous widget
    const container = containerRef.current
    container.innerHTML = ""

    // Create widget container
    const widgetDiv = document.createElement("div")
    widgetDiv.className = "tradingview-widget-container__widget"
    widgetDiv.style.height = "100%"
    widgetDiv.style.width = "100%"
    container.appendChild(widgetDiv)

    const tvSymbol = getTradingViewSymbol(symbol)

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(10, 14, 23, 1)",
      gridColor: "rgba(42, 46, 57, 0.3)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: true,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      toolbar_bg: "#0a0e17",
      enable_publishing: false,
      withdateranges: true,
      details: true,
      hotlist: true,
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
      studies: [
        "STD;Bollinger_Bands",
        "STD;MA%Ribbon",
      ],
    })

    container.appendChild(script)
    scriptRef.current = script

    return () => {
      if (container) {
        container.innerHTML = ""
      }
    }
  }, [symbol])

  return (
    <div className="flex h-full w-full flex-col">
      <div
        ref={containerRef}
        className="tradingview-widget-container h-full w-full"
      />
    </div>
  )
}

export const PriceChart = memo(TradingViewChart)
