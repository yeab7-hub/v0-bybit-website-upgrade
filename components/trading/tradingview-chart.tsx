"use client"

import { memo, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

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
  const [loaded, setLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const tvSymbol = useMemo(() => getTradingViewSymbol(symbol), [symbol])

  // Build a self-contained HTML page that loads TradingView widget.
  // This approach uses srcdoc so no external URL is needed -- the iframe
  // renders a full TradingView advanced chart inside a sandboxed context.
  // It can NEVER crash the parent React app.
  const srcdoc = useMemo(() => {
    const bgColor = theme === "dark" ? "#0b0e11" : "#ffffff"
    const config = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: interval,
      timezone: "Etc/UTC",
      theme: theme === "dark" ? "dark" : "light",
      style: "1",
      locale: "en",
      backgroundColor: bgColor,
      gridColor: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)",
      hide_top_toolbar: hideTopToolbar,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    })

    return `<!DOCTYPE html>
<html><head>
<style>html,body{margin:0;padding:0;height:100%;overflow:hidden;background:${bgColor};}
.tv-container{width:100%;height:100%;}</style>
</head><body>
<div class="tradingview-widget-container" style="width:100%;height:100%;">
<div class="tradingview-widget-container__widget" style="width:100%;height:100%;"></div>
<script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" async>
${config}
</script>
</div>
</body></html>`
  }, [tvSymbol, theme, interval, hideTopToolbar])

  if (hasError) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-card ${className || ""}`} style={{ minHeight: "300px" }}>
        <p className="text-xs text-muted-foreground">Chart temporarily unavailable</p>
        <button onClick={() => setHasError(false)} className="rounded bg-secondary px-3 py-1.5 text-xs text-foreground">
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
      {/* Loading spinner while iframe loads */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <iframe
        srcDoc={srcdoc}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        sandbox="allow-scripts allow-same-origin allow-popups"
        loading="eager"
        title="TradingView Chart"
      />
    </div>
  )
}

export const TradingViewChart = memo(TradingViewChartInner)
