"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useLivePrices, formatPrice, safeFindPrice } from "@/hooks/use-live-prices"

interface OrderLevel {
  price: number
  amount: number
  total: number
}

type ViewMode = "both" | "bids" | "asks"

interface OrderBookProps {
  symbol?: string
}

export function OrderBook({ symbol = "BTCUSDT" }: OrderBookProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("both")
  const { crypto, forex, commodities, stocks, cfd } = useLivePrices(5000)
  const allAssets = [...crypto, ...forex, ...commodities, ...stocks, ...cfd]
  const livePrice = safeFindPrice(allAssets, symbol)?.price ?? 0

  const [asks, setAsks] = useState<OrderLevel[]>([])
  const [bids, setBids] = useState<OrderLevel[]>([])
  const [lastPrice, setLastPrice] = useState(0)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  // Connect to Binance WebSocket for real depth data
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setAsks([])
    setBids([])
    setConnected(false)

    const pair = symbol.toLowerCase()
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@depth20@1000ms`)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.asks && data.bids) {
          // Parse asks (sellers) - lowest price first
          let cumAsk = 0
          const newAsks: OrderLevel[] = data.asks.slice(0, 20).map((a: [string, string]) => {
            const amount = parseFloat(a[1])
            cumAsk += amount
            return {
              price: parseFloat(a[0]),
              amount,
              total: cumAsk,
            }
          })

          // Parse bids (buyers) - highest price first
          let cumBid = 0
          const newBids: OrderLevel[] = data.bids.slice(0, 20).map((b: [string, string]) => {
            const amount = parseFloat(b[1])
            cumBid += amount
            return {
              price: parseFloat(b[0]),
              amount,
              total: cumBid,
            }
          })

          setAsks(newAsks)
          setBids(newBids)
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)

    return () => {
      ws.close()
    }
  }, [symbol])

  // Update last price whenever live price changes
  useEffect(() => {
    if (livePrice > 0) setLastPrice(livePrice)
  }, [livePrice])

  const maxTotal = useMemo(
    () => Math.max(...asks.map((a) => a.total), ...bids.map((b) => b.total), 1),
    [asks, bids]
  )

  const displayAsks = viewMode === "bids" ? [] : asks.slice(0, viewMode === "both" ? 12 : 24)
  const displayBids = viewMode === "asks" ? [] : bids.slice(0, viewMode === "both" ? 12 : 24)

  // Format price based on magnitude
  const fmtPrice = (p: number) => {
    if (p >= 1000) return p.toFixed(2)
    if (p >= 1) return p.toFixed(4)
    return p.toFixed(6)
  }

  const fmtAmount = (a: number) => {
    if (a >= 100) return a.toFixed(2)
    if (a >= 1) return a.toFixed(4)
    return a.toFixed(6)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">Order Book</span>
          {connected && (
            <span className="flex h-1.5 w-1.5 rounded-full bg-success" title="Live" />
          )}
        </div>
        <div className="flex items-center gap-1">
          {(["both", "bids", "asks"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded p-1 ${viewMode === mode ? "bg-secondary" : ""}`}
              title={mode}
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                {mode === "both" ? (
                  <>
                    <rect x="1" y="1" width="12" height="5" rx="1" fill="hsl(0, 72%, 51%)" opacity="0.6" />
                    <rect x="1" y="8" width="12" height="5" rx="1" fill="hsl(142, 72%, 50%)" opacity="0.6" />
                  </>
                ) : mode === "bids" ? (
                  <rect x="1" y="1" width="12" height="12" rx="1" fill="hsl(142, 72%, 50%)" opacity="0.6" />
                ) : (
                  <rect x="1" y="1" width="12" height="12" rx="1" fill="hsl(0, 72%, 51%)" opacity="0.6" />
                )}
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-border px-3 py-1.5">
        <span className="text-[10px] text-muted-foreground">{"Price(USDT)"}</span>
        <span className="text-right text-[10px] text-muted-foreground">{`Amount(${baseAsset})`}</span>
        <span className="text-right text-[10px] text-muted-foreground">Total</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {displayAsks.length > 0 && (
          <div className="flex flex-col-reverse">
            {displayAsks.map((level, i) => (
              <div key={`ask-${i}`} className="group relative grid cursor-pointer grid-cols-3 px-3 py-0.5 hover:bg-secondary/30">
                <div className="pointer-events-none absolute inset-y-0 right-0 bg-destructive/10" style={{ width: `${(level.total / maxTotal) * 100}%` }} />
                <span className="relative font-mono text-xs text-destructive">{fmtPrice(level.price)}</span>
                <span className="relative text-right font-mono text-xs text-foreground">{fmtAmount(level.amount)}</span>
                <span className="relative text-right font-mono text-xs text-muted-foreground">{fmtAmount(level.total)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Spread / Last price */}
        <div className="flex items-center justify-between border-y border-border bg-secondary/20 px-3 py-2">
          <span className="font-mono text-sm font-bold text-success">
            {lastPrice > 0 ? formatPrice(lastPrice) : "--"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {"Spread: "}
            {asks.length > 0 && bids.length > 0
              ? ((asks[0].price - bids[0].price) / (lastPrice || 1) * 100).toFixed(3)
              : "0.000"}%
          </span>
        </div>

        {displayBids.map((level, i) => (
          <div key={`bid-${i}`} className="group relative grid cursor-pointer grid-cols-3 px-3 py-0.5 hover:bg-secondary/30">
            <div className="pointer-events-none absolute inset-y-0 right-0 bg-success/10" style={{ width: `${(level.total / maxTotal) * 100}%` }} />
            <span className="relative font-mono text-xs text-success">{fmtPrice(level.price)}</span>
            <span className="relative text-right font-mono text-xs text-foreground">{fmtAmount(level.amount)}</span>
            <span className="relative text-right font-mono text-xs text-muted-foreground">{fmtAmount(level.total)}</span>
          </div>
        ))}

        {/* Loading state when no data yet */}
        {asks.length === 0 && bids.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-[#f7a600]" />
            <p className="mt-2 text-[10px] text-muted-foreground">Connecting to Binance...</p>
          </div>
        )}
      </div>
    </div>
  )
}
