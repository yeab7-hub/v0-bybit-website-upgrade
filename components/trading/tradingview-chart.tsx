"use client"

import { memo, useMemo, useState } from "react"
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

  // Commodities
  const commodityMap: Record<string, string> = {
    XAUUSD: "TVC:GOLD", GOLD: "TVC:GOLD",
    XAGUSD: "TVC:SILVER", SILVER: "TVC:SILVER",
    WTIUSD: "TVC:USOIL", USOIL: "TVC:USOIL",
    BRENTUSD: "TVC:UKOIL", UKOIL: "TVC:UKOIL",
    NGUSD: "NYMEX:NG1!",
  }
  if (commodityMap[clean]) return commodityMap[clean]

  // CFDs / Indices
  const cfdMap: Record<string, string> = {
    US30: "DJ:DJI", US500: "SP:SPX", US100: "NASDAQ:NDX",
    UK100: "SPREADEX:FTSE", DE30: "XETR:DAX", JP225: "TVC:NI225",
    SPX500: "SP:SPX", NAS100: "NASDAQ:NDX",
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
  const tvSymbol = useMemo(() => getTradingViewSymbol(symbol), [symbol])

  // Use TradingView's tv.js constructor inside srcdoc for maximum control
  // and isolation. This runs entirely in the iframe sandbox.
  const srcdoc = useMemo(() => {
    const bgColor = theme === "dark" ? "#0b0e11" : "#ffffff"
    const textColor = theme === "dark" ? "#d1d5db" : "#333333"
    const gridColor = theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box;}html,body,#tv_chart{width:100%;height:100%;overflow:hidden;background:${bgColor};}</style>
</head><body>
<div id="tv_chart"></div>
<script src="https://s3.tradingview.com/tv.js"></script>
<script>
try {
  new TradingView.widget({
    container_id: "tv_chart",
    autosize: true,
    symbol: "${tvSymbol}",
    interval: "${interval}",
    timezone: "Etc/UTC",
    theme: "${theme}",
    style: "1",
    locale: "en",
    toolbar_bg: "${bgColor}",
    enable_publishing: false,
    allow_symbol_change: false,
    hide_top_toolbar: ${hideTopToolbar},
    hide_side_toolbar: true,
    hide_legend: true,
    save_image: false,
    withdateranges: false,
    details: false,
    hotlist: false,
    calendar: false,
    backgroundColor: "${bgColor}",
    gridColor: "${gridColor}",
    studies: ["MASimple@tv-basicstudies"],
    overrides: {
      "paneProperties.background": "${bgColor}",
      "paneProperties.backgroundType": "solid",
      "mainSeriesProperties.candleStyle.upColor": "#0ecb81",
      "mainSeriesProperties.candleStyle.downColor": "#f6465d",
      "mainSeriesProperties.candleStyle.borderUpColor": "#0ecb81",
      "mainSeriesProperties.candleStyle.borderDownColor": "#f6465d",
      "mainSeriesProperties.candleStyle.wickUpColor": "#0ecb81",
      "mainSeriesProperties.candleStyle.wickDownColor": "#f6465d",
      "scalesProperties.textColor": "${textColor}",
    },
    loading_screen: { backgroundColor: "${bgColor}", foregroundColor: "#f7a600" },
  });
} catch(e) {
  document.getElementById("tv_chart").innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;font-size:13px;">Chart loading...</div>';
}
</script>
</body></html>`
  }, [tvSymbol, theme, interval, hideTopToolbar])

  if (hasError) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-card ${className || ""}`} style={{ minHeight: "300px" }}>
        <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">Chart temporarily unavailable</p>
        <button onClick={() => setHasError(false)} className="rounded bg-secondary px-4 py-1.5 text-xs text-foreground">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden ${className || ""}`}
      style={{ width: "100%", height: "100%", minHeight: "300px" }}
    >
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <iframe
        srcDoc={srcdoc}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        sandbox="allow-scripts allow-same-origin allow-popups"
        loading="eager"
        title="TradingView Chart"
      />
    </div>
  )
}

export const TradingViewChart = memo(TradingViewChartInner)
