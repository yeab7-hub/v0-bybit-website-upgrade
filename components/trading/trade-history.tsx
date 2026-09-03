"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MarketTrade {
  id: string
  price: number
  amount: number
  side: "buy" | "sell"
  time: string
}

interface ClosedTrade {
  id: string
  pair: string
  side: "buy" | "sell"
  price: number
  amount: number
  close_price: number | null
  pnl: number
  fee: number
  created_at: string
  closed_at: string | null
}

type Tab = "trades" | "my-trades"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * Direction-aware realized PnL.
 * BUY / LONG  => (exit - entry) * qty
 * SELL / SHORT => (entry - exit) * qty
 * Falls back to the stored pnl when no exit price is recorded.
 */
function computePnl(t: ClosedTrade): number {
  const entry = Number(t.price)
  const exit = t.close_price != null ? Number(t.close_price) : null
  const qty = Number(t.amount)
  if (exit == null || !Number.isFinite(exit)) return Number(t.pnl) || 0
  const gross = t.side === "sell" ? (entry - exit) * qty : (exit - entry) * qty
  // Preserve fees already baked into the stored value when available.
  const fee = Number(t.fee) || 0
  return gross - fee
}

function toBinanceSymbol(pair: string): string | null {
  const cleaned = pair.replace("/", "").toUpperCase()
  // Only crypto/USDT style pairs are on Binance's public trades endpoint.
  if (!cleaned.endsWith("USDT")) return null
  return cleaned
}

export function TradeHistory({ pair = "BTC/USDT" }: { pair?: string }) {
  const [tab, setTab] = useState<Tab>("trades")
  const [marketTrades, setMarketTrades] = useState<MarketTrade[]>([])

  const symbol = toBinanceSymbol(pair)
  const baseAsset = pair.split("/")[0] || "BTC"
  const quoteAsset = pair.split("/")[1] || "USDT"

  // Real user closed trades from Supabase
  const { data: historyData } = useSWR("/api/trade?type=history", fetcher, { refreshInterval: 5000 })
  const myTrades: ClosedTrade[] = historyData?.history ?? []
  const isUnauthorized = historyData?.error === "Unauthorized"

  // Real market trade tape from Binance public REST (no simulation)
  useEffect(() => {
    if (!symbol) {
      setMarketTrades([])
      return
    }
    let active = true
    const load = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=30`, {
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        })
        if (!res.ok) return
        const data: { id: number; price: string; qty: string; time: number; isBuyerMaker: boolean }[] = await res.json()
        if (!active) return
        const mapped: MarketTrade[] = data
          .map((d) => ({
            id: String(d.id),
            price: Number.parseFloat(d.price),
            amount: Number.parseFloat(d.qty),
            // isBuyerMaker true => the aggressor was a seller => taker sell
            side: (d.isBuyerMaker ? "sell" : "buy") as "buy" | "sell",
            time: new Date(d.time).toLocaleTimeString([], { hour12: false }),
          }))
          .reverse()
        setMarketTrades(mapped)
      } catch {
        /* keep last snapshot on transient failure */
      }
    }
    load()
    const iv = setInterval(load, 4000)
    return () => {
      active = false
      clearInterval(iv)
    }
  }, [symbol])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-border">
        <button
          onClick={() => setTab("trades")}
          className={`px-4 py-2 text-xs font-medium ${
            tab === "trades" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Recent Trades
        </button>
        <button
          onClick={() => setTab("my-trades")}
          className={`px-4 py-2 text-xs font-medium ${
            tab === "my-trades" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My Trades
        </button>
      </div>

      {tab === "trades" ? (
        <>
          <div className="grid grid-cols-3 px-3 py-1.5">
            <span className="text-[10px] text-muted-foreground">{`Price(${quoteAsset})`}</span>
            <span className="text-right text-[10px] text-muted-foreground">{`Amount(${baseAsset})`}</span>
            <span className="text-right text-[10px] text-muted-foreground">Time</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {marketTrades.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground">No live trades for this market</p>
              </div>
            ) : (
              marketTrades.map((trade) => (
                <div key={trade.id} className="grid grid-cols-3 px-3 py-0.5 hover:bg-secondary/20">
                  <span className={`font-mono text-xs ${trade.side === "buy" ? "text-success" : "text-destructive"}`}>
                    {trade.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </span>
                  <span className="text-right font-mono text-xs text-foreground">{trade.amount.toFixed(4)}</span>
                  <span className="text-right font-mono text-xs text-muted-foreground">{trade.time}</span>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-4 px-3 py-1.5">
            <span className="text-[10px] text-muted-foreground">Pair</span>
            <span className="text-[10px] text-muted-foreground">Side</span>
            <span className="text-right text-[10px] text-muted-foreground">Entry {"=>"} Exit</span>
            <span className="text-right text-[10px] text-muted-foreground">Realized PnL</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isUnauthorized ? (
              <div className="flex h-32 flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground">Log in to view your trades</p>
              </div>
            ) : myTrades.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground">No closed trades yet</p>
              </div>
            ) : (
              myTrades.map((t) => {
                const pnl = computePnl(t)
                const isWin = pnl >= 0
                const isShort = t.side === "sell"
                return (
                  <div key={t.id} className="grid grid-cols-4 items-center px-3 py-1.5 hover:bg-secondary/20">
                    <span className="font-mono text-xs text-foreground">{t.pair}</span>
                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${isShort ? "text-destructive" : "text-success"}`}
                    >
                      {isShort ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                      {isShort ? "SHORT" : "LONG"}
                    </span>
                    <span className="text-right font-mono text-[11px] text-muted-foreground">
                      {Number(t.price).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      {t.close_price != null && (
                        <>
                          {" "}
                          {"=>"} {Number(t.close_price).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </>
                      )}
                    </span>
                    <span className={`text-right font-mono text-xs font-semibold ${isWin ? "text-success" : "text-destructive"}`}>
                      {isWin ? "+" : ""}
                      {pnl.toFixed(2)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}
