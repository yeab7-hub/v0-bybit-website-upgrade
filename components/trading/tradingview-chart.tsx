"use client"

import { memo, useMemo } from "react"

interface TradingViewChartProps {
  symbol?: string
  theme?: "dark" | "light"
  className?: string
  interval?: string
  hideTopToolbar?: boolean
}

function getTradingViewSymbol(pair: string): string {
  const clean = pair.replace("/", "").toUpperCase()

  // Crypto pairs
  const cryptoMap: Record<string, string> = {
    BTCUSDT: "BINANCE:BTCUSDT",
    ETHUSDT: "BINANCE:ETHUSDT",
    SOLUSDT: "BINANCE:SOLUSDT",
    XRPUSDT: "BINANCE:XRPUSDT",
    BNBUSDT: "BINANCE:BNBUSDT",
    ADAUSDT: "BINANCE:ADAUSDT",
    DOGEUSDT: "BINANCE:DOGEUSDT",
    AVAXUSDT: "BINANCE:AVAXUSDT",
    DOTUSDT: "BINANCE:DOTUSDT",
    LINKUSDT: "BINANCE:LINKUSDT",
    MATICUSDT: "BINANCE:MATICUSDT",
    LTCUSDT: "BINANCE:LTCUSDT",
    SHIBUSDT: "BINANCE:SHIBUSDT",
    ATOMUSDT: "BINANCE:ATOMUSDT",
    NEARUSDT: "BINANCE:NEARUSDT",
    UNIUSDT: "BINANCE:UNIUSDT",
    SUIUSDT: "BINANCE:SUIUSDT",
    APTUSDT: "BINANCE:APTUSDT",
    OPUSDT: "BINANCE:OPUSDT",
    ARBUSDT: "BINANCE:ARBUSDT",
  }
  if (cryptoMap[clean]) return cryptoMap[clean]
  if (clean.endsWith("USDT")) return `BINANCE:${clean}`

  // Forex
  const forexPairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCHF", "USDCAD", "NZDUSD", "EURGBP", "EURJPY"]
  const forexClean = clean.replace("/", "")
  if (forexPairs.includes(forexClean)) return `FX:${forexClean}`

  // Commodities
  const commodityMap: Record<string, string> = {
    "XAUUSD": "TVC:GOLD", "XAGUSD": "TVC:SILVER",
    "WTIUSD": "TVC:USOIL", "BRENTUSD": "TVC:UKOIL",
    "NGUSD": "NYMEX:NG1!",
  }
  if (commodityMap[forexClean]) return commodityMap[forexClean]

  // Stocks
  const stockMap: Record<string, string> = {
    AAPL: "NASDAQ:AAPL", MSFT: "NASDAQ:MSFT", GOOGL: "NASDAQ:GOOGL",
    AMZN: "NASDAQ:AMZN", TSLA: "NASDAQ:TSLA", NVDA: "NASDAQ:NVDA", META: "NASDAQ:META",
  }
  if (stockMap[clean]) return stockMap[clean]

  // CFD / Indices
  const cfdMap: Record<string, string> = {
    US30: "FOREXCOM:DJI", US500: "FOREXCOM:SPX500", US100: "FOREXCOM:NSXUSD",
    UK100: "FOREXCOM:UKXGBP", DE40: "PEPPERSTONE:GER40", JP225: "TVC:NI225",
  }
  if (cfdMap[clean]) return cfdMap[clean]

  return `BINANCE:${clean}`
}

function TradingViewChartInner({
  symbol = "BTCUSDT",
  theme = "dark",
  className,
  interval = "15",
  hideTopToolbar = false,
}: TradingViewChartProps) {
  const src = useMemo(() => {
    const tvSymbol = getTradingViewSymbol(symbol)
    const bgColor = theme === "dark" ? "rgba(11,14,17,1)" : "rgba(255,255,255,1)"
    const gridColor = theme === "dark" ? "rgba(42,46,57,0.3)" : "rgba(0,0,0,0.06)"

    const params = new URLSearchParams({
      autosize: "true",
      symbol: tvSymbol,
      interval,
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      allow_symbol_change: "true",
      calendar: "false",
      hide_top_toolbar: hideTopToolbar ? "true" : "false",
      hide_legend: "false",
      save_image: "false",
      hide_volume: "false",
      backgroundColor: bgColor,
      gridColor,
    })

    return `https://s.tradingview.com/widgetembed/?${params.toString()}`
  }, [symbol, theme, interval, hideTopToolbar])

  return (
    <div className={`relative overflow-hidden ${className || ""}`} style={{ width: "100%", height: "100%" }}>
      <iframe
        src={src}
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="fullscreen"
        loading="eager"
        title={`TradingView Chart - ${symbol}`}
      />
    </div>
  )
}

export const TradingViewChart = memo(TradingViewChartInner)
