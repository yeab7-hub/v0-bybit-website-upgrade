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
  const tvSymbol = useMemo(() => getTradingViewSymbol(symbol), [symbol])

  // Use TradingView's widgetembed URL -- this is an iframe approach that
  // NEVER crashes the parent React app because it runs in a sandboxed context.
  // This is the most reliable method for production deployments.
  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      frameElementId: "tradingview_chart",
      symbol: tvSymbol,
      interval: interval,
      symboledit: "1",
      saveimage: "0",
      toolbarbg: theme === "dark" ? "0b0e11" : "ffffff",
      studies: "[]",
      theme: theme === "dark" ? "dark" : "light",
      style: "1",
      timezone: "Etc/UTC",
      withdateranges: "1",
      showpopupbutton: "0",
      studies_overrides: "{}",
      overrides: JSON.stringify({
        "paneProperties.background": theme === "dark" ? "#0b0e11" : "#ffffff",
        "paneProperties.backgroundType": "solid",
      }),
      enabled_features: "[]",
      disabled_features: JSON.stringify(
        hideTopToolbar
          ? ["header_widget"]
          : []
      ),
      locale: "en",
      utm_source: "",
      utm_medium: "widget_new",
      utm_campaign: "chart",
    })
    return `https://s.tradingview.com/widgetembed/?${params.toString()}`
  }, [tvSymbol, theme, interval, hideTopToolbar])

  return (
    <div
      className={`relative overflow-hidden ${className || ""}`}
      style={{ width: "100%", height: "100%", minHeight: "300px" }}
    >
      <iframe
        src={iframeSrc}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        loading="lazy"
        title="TradingView Chart"
        allow="clipboard-write"
      />
    </div>
  )
}

export const TradingViewChart = memo(TradingViewChartInner)
