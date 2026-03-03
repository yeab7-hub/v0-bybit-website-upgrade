"use client"

import { memo, useMemo, useState, useEffect } from "react"
import { Loader2, BarChart3 } from "lucide-react"

interface TradingViewChartProps {
  symbol?: string
  theme?: "dark" | "light"
  className?: string
  interval?: string
  hideTopToolbar?: boolean
}

/**
 * Maps any trading pair to a TradingView-compatible symbol.
 * Supports: Crypto, Forex, Commodities, Stocks, CFDs
 */
function getTradingViewSymbol(pair: string): string {
  const clean = pair.replace("/", "").toUpperCase()

  // Crypto pairs
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

  // Forex pairs
  const forexPairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCHF", "USDCAD", "NZDUSD", "EURGBP", "EURJPY", "GBPJPY"]
  if (forexPairs.includes(clean)) return `FX:${clean}`

  // Commodities -- multiple exchange options for reliability
  const commodityMap: Record<string, string> = {
    XAUUSD: "PEPPERSTONE:XAUUSD", GOLD: "PEPPERSTONE:XAUUSD",
    XAGUSD: "PEPPERSTONE:XAGUSD", SILVER: "PEPPERSTONE:XAGUSD",
    WTI: "PEPPERSTONE:USOUSD", WTIUSD: "PEPPERSTONE:USOUSD", USOIL: "PEPPERSTONE:USOUSD",
    BRENT: "PEPPERSTONE:UKOUSD", BRENTUSD: "PEPPERSTONE:UKOUSD", UKOIL: "PEPPERSTONE:UKOUSD",
    NG: "PEPPERSTONE:NATGAS", NGUSD: "PEPPERSTONE:NATGAS",
    HG: "COMEX:HG1!", HGUSD: "COMEX:HG1!",
  }
  if (commodityMap[clean]) return commodityMap[clean]

  // CFDs / Indices
  const cfdMap: Record<string, string> = {
    US30: "PEPPERSTONE:US30", US500: "PEPPERSTONE:US500", US100: "PEPPERSTONE:US100",
    UK100: "PEPPERSTONE:UK100", DE30: "PEPPERSTONE:GER40", DE40: "PEPPERSTONE:GER40",
    JP225: "TVC:NI225", HK50: "TVC:HSI", VIX: "TVC:VIX",
    SPX500: "PEPPERSTONE:US500", NAS100: "PEPPERSTONE:US100",
  }
  if (cfdMap[clean]) return cfdMap[clean]

  // Stocks
  const stockMap: Record<string, string> = {
    AAPL: "NASDAQ:AAPL", MSFT: "NASDAQ:MSFT", GOOGL: "NASDAQ:GOOGL",
    AMZN: "NASDAQ:AMZN", TSLA: "NASDAQ:TSLA", NVDA: "NASDAQ:NVDA",
    META: "NASDAQ:META", NFLX: "NASDAQ:NFLX", AMD: "NASDAQ:AMD",
    JPM: "NYSE:JPM", V: "NYSE:V", WMT: "NYSE:WMT",
  }
  if (stockMap[clean]) return stockMap[clean]

  // Default: try BINANCE for crypto
  return `BINANCE:${clean}`
}

function TradingViewChartInner({
  symbol = "BTCUSDT",
  theme = "dark",
  className,
  interval = "15",
  hideTopToolbar = false,
}: TradingViewChartProps) {
  const [loaded, setLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const tvSymbol = useMemo(() => getTradingViewSymbol(symbol), [symbol])

  // Guard: only render the iframe after the component mounts on the client
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Build TradingView embed URL -- this is the most reliable approach
  // that handles sizing correctly on all devices.
  const widgetUrl = useMemo(() => {
    const params = new URLSearchParams({
      symbol: tvSymbol,
      interval: interval,
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      enable_publishing: "false",
      allow_symbol_change: "false",
      hide_top_toolbar: hideTopToolbar ? "true" : "false",
      hide_side_toolbar: "true",
      hide_legend: "false",
      save_image: "false",
      withdateranges: "false",
      details: "false",
      hotlist: "false",
      calendar: "false",
      backgroundColor: theme === "dark" ? "rgba(11,14,17,1)" : "rgba(255,255,255,1)",
      gridColor: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)",
      studies: '["MASimple@tv-basicstudies"]',
    })
    return `https://s.tradingview.com/widgetembed/?${params.toString()}`
  }, [tvSymbol, theme, interval, hideTopToolbar])

  // Show spinner while waiting for client mount or if symbol is invalid
  if (!mounted || !tvSymbol) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-background ${className || ""}`}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-card ${className || ""}`}>
        <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">Chart temporarily unavailable</p>
        <button onClick={() => { setHasError(false); setLoaded(false) }} className="rounded bg-secondary px-4 py-1.5 text-xs text-foreground">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden ${className || ""}`}
      style={{ width: "100%", height: "100%" }}
    >
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <iframe
        src={widgetUrl}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        style={{ width: "100%", height: "100%", border: "none", display: "block", minHeight: 0 }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        loading="eager"
        title="TradingView Chart"
        allow="fullscreen"
      />
    </div>
  )
}

export const TradingViewChart = memo(TradingViewChartInner)
