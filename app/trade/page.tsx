"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronDown, X, BarChart3,
  Loader2, Eye, EyeOff, ArrowUpDown,
  TrendingUp, Clock, CheckCircle2,
  Menu, Share2, Copy, Info,
} from "lucide-react"
import { useLivePrices, formatPrice, formatVolume } from "@/hooks/use-live-prices"
import { MarketAsset, formatAssetPrice } from "@/components/market-asset"
import { PairSelector } from "@/components/trading/pair-selector"
import { TradingViewChart } from "@/components/trading/tradingview-chart"
import { BottomNav } from "@/components/bottom-nav"
import { createClient } from "@/lib/supabase/client"
import useSWR, { mutate as globalMutate } from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const percentages = [0, 25, 50, 75, 100]

type OrderSide = "buy" | "sell"
type OrderType = "Market" | "Limit" | "Stop-Limit"
type BottomTab = "orders" | "positions" | "history" | "assets"
type TradeMode = "Spot" | "Futures" | "Options"

export default function TradePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedPair, setSelectedPair] = useState("BTCUSDT")
  const [showPairSelector, setShowPairSelector] = useState(false)
  const [side, setSide] = useState<OrderSide>("buy")
  const [orderType, setOrderType] = useState<OrderType>("Limit")
  const [price, setPrice] = useState("")
  const [amount, setAmount] = useState("")
  const [sliderPct, setSliderPct] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [bottomTab, setBottomTab] = useState<BottomTab>("orders")
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<any>(null)
  const [tradeMode, setTradeMode] = useState<TradeMode>("Spot")
  const [marginEnabled, setMarginEnabled] = useState(false)
  const [postOnly, setPostOnly] = useState(false)
  const [reduceOnly, setReduceOnly] = useState(false)
  const [tpsl, setTpsl] = useState("")
  const [leverage, setLeverage] = useState("10x")
  const [marginType, setMarginType] = useState("Cross")

  useEffect(() => {
    const p = searchParams.get("pair")
    if (p) setSelectedPair(p)
  }, [searchParams])

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ? { id: u.id } : null))
    } catch { /* not logged in */ }
  }, [])

  const { crypto, forex, commodities, stocks, cfd } = useLivePrices(5000)
  // No memo -- always recompute so WebSocket price updates are reflected immediately in positions
  const allPrices = [...crypto, ...forex, ...commodities, ...stocks, ...cfd]

  const isCryptoPair = selectedPair.endsWith("USDT") && !selectedPair.includes("/")
  const pairDisplay = isCryptoPair ? selectedPair.replace("USDT", "/USDT") : selectedPair
  const baseAsset = isCryptoPair ? selectedPair.replace("USDT", "") : selectedPair.split("/")[0] || selectedPair
  const quoteAsset = isCryptoPair ? "USDT" : (selectedPair.split("/")[1] || "USD")

  const livePrice = allPrices.find((a) => a.symbol === baseAsset || a.symbol === selectedPair)?.price ?? 0
  const change24h = allPrices.find((a) => a.symbol === baseAsset || a.symbol === selectedPair)?.change24h ?? 0

  const { data: balData } = useSWR(user ? "/api/trade?type=balances" : null, fetcher, { refreshInterval: 5000 })
  const { data: ordersData } = useSWR(user ? "/api/trade?type=orders" : null, fetcher, { refreshInterval: 3000 })
  const { data: positionsData } = useSWR(user ? "/api/trade?type=positions" : null, fetcher, { refreshInterval: 3000 })
  const { data: historyData } = useSWR(user ? "/api/trade?type=history" : null, fetcher, { refreshInterval: 5000 })

  const balances = balData?.balances ?? []
  const orders = ordersData?.orders ?? []
  const positions = positionsData?.positions ?? []
  const history = historyData?.history ?? []
  const [closingId, setClosingId] = useState<string | null>(null)
  const quoteBalance = balances.find((b: any) => b.asset === quoteAsset)?.available ?? 0
  const baseBalance = balances.find((b: any) => b.asset === baseAsset)?.available ?? 0

  useEffect(() => {
    if (livePrice > 0 && !price) setPrice(formatPrice(livePrice))
  }, [livePrice, price])

  const effectivePrice = orderType === "Market" ? livePrice : parseFloat(price.replace(/,/g, "")) || 0
  const parsedAmount = parseFloat(amount) || 0
  const total = effectivePrice * parsedAmount
  const maxSell = side === "sell" ? baseBalance : (effectivePrice > 0 ? quoteBalance / effectivePrice : 0)

  const handleSlider = useCallback((pct: number) => {
    setSliderPct(pct)
    if (pct === 0) { setAmount(""); return }
    if (side === "buy" && effectivePrice > 0) {
      setAmount(((quoteBalance * pct / 100) / effectivePrice).toFixed(6))
    } else if (side === "sell") {
      setAmount((baseBalance * pct / 100).toFixed(6))
    }
  }, [side, effectivePrice, quoteBalance, baseBalance])

  useEffect(() => {
    if (orders.length === 0) return
    const checkFills = async () => {
      try {
        const res = await fetch("/api/trade/fill")
        const data = await res.json()
        if (data.filled > 0) {
          globalMutate("/api/trade?type=orders")
          globalMutate("/api/trade?type=positions")
          globalMutate("/api/trade?type=history")
          globalMutate("/api/trade?type=balances")
        }
      } catch { /* ignore */ }
    }
    checkFills()
    const iv = setInterval(checkFills, 8000)
    return () => clearInterval(iv)
  }, [orders.length])

  const handleSubmit = async () => {
    if (!user) { setFeedback({ type: "error", msg: "Please log in to trade" }); return }
    if (parsedAmount <= 0) { setFeedback({ type: "error", msg: "Enter a valid amount" }); return }
    setSubmitting(true)
    setFeedback(null)
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pair: pairDisplay, side,
          order_type: orderType === "Market" ? "market" : "limit",
          price: orderType !== "Market" ? parseFloat(price.replace(/,/g, "")) : undefined,
          amount: parsedAmount,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", msg: data.message })
        setAmount(""); setSliderPct(0)
        globalMutate("/api/trade?type=balances")
        globalMutate("/api/trade?type=orders")
        globalMutate("/api/trade?type=positions")
        globalMutate("/api/trade?type=history")
        // Auto-switch to the right tab: buy fills create positions, sell fills go to history
        if (data.executed) {
          setBottomTab(side === "buy" ? "positions" : "history")
        } else {
          setBottomTab("orders") // Limit order placed, show in open orders
        }
      } else {
        setFeedback({ type: "error", msg: data.error || "Order failed" })
      }
    } catch {
      setFeedback({ type: "error", msg: "Network error" })
    } finally {
      setSubmitting(false)
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  const cancelOrder = async (orderId: string) => {
    await fetch(`/api/trade?id=${orderId}`, { method: "DELETE" })
    globalMutate("/api/trade?type=orders")
    globalMutate("/api/trade?type=balances")
  }

  const closePosition = async (tradeId: string) => {
    setClosingId(tradeId)
    try {
      const res = await fetch("/api/trade/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", msg: data.message })
        globalMutate("/api/trade?type=positions")
        globalMutate("/api/trade?type=history")
        globalMutate("/api/trade?type=balances")
      } else {
        setFeedback({ type: "error", msg: data.error || "Failed to close position" })
      }
    } catch {
      setFeedback({ type: "error", msg: "Network error closing position" })
    } finally {
      setClosingId(null)
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  const isBuy = side === "buy"
  const isFutures = tradeMode === "Futures"

  const handleShare = async (detail: any) => {
    const pnl = Number(detail.pnl) || 0
    const text = `${detail.pair} | ${detail.side?.toUpperCase()} | ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} USDT\nPrice: $${Number(detail.price).toLocaleString()} | Qty: ${Number(detail.amount).toFixed(4)}\nTraded on Bybit`
    if (navigator.share) {
      try { await navigator.share({ title: "My Trade", text }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); setFeedback({ type: "success", msg: "Trade details copied!" }); setTimeout(() => setFeedback(null), 2000) } catch {}
    }
  }

  // Order book data via Binance WebSocket
  const [asks, setAsks] = useState<{ price: number; qty: number }[]>([])
  const [bids, setBids] = useState<{ price: number; qty: number }[]>([])

  useEffect(() => {
    if (!isCryptoPair) {
      if (livePrice > 0) {
        const a = Array.from({ length: 10 }, (_, i) => ({ price: livePrice + (i + 1) * livePrice * 0.0001, qty: Math.random() * 5 }))
        const b = Array.from({ length: 10 }, (_, i) => ({ price: livePrice - (i + 1) * livePrice * 0.0001, qty: Math.random() * 5 }))
        setAsks(a); setBids(b)
      }
      return
    }
    const pair = selectedPair.toLowerCase()
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@depth20@1000ms`)
    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data)
        if (d.asks && d.bids) {
          setAsks(d.asks.slice(0, 10).map((a: [string, string]) => ({ price: parseFloat(a[0]), qty: parseFloat(a[1]) })))
          setBids(d.bids.slice(0, 10).map((b: [string, string]) => ({ price: parseFloat(b[0]), qty: parseFloat(b[1]) })))
        }
      } catch { /* ignore */ }
    }
    return () => ws.close()
  }, [selectedPair, isCryptoPair, livePrice])

  const maxQty = Math.max(...asks.map((a) => a.qty), ...bids.map((b) => b.qty), 0.01)
  const buyRatio = bids.reduce((s, b) => s + b.qty, 0)
  const sellRatio = asks.reduce((s, a) => s + a.qty, 0)
  const buyPct = buyRatio + sellRatio > 0 ? Math.round((buyRatio / (buyRatio + sellRatio)) * 100) : 50
  const sellPct = 100 - buyPct

  const fmtP = (p: number) => p >= 1000 ? p.toFixed(1) : p >= 1 ? p.toFixed(4) : p.toFixed(6)
  const fmtQ = (q: number) => q >= 100 ? q.toFixed(2) : q.toFixed(4)

  const tradeModes: TradeMode[] = ["Spot", "Futures", "Options"]

  /* ====== ORDER BOOK ====== */
  const OrderBookPanel = (
    <div className="flex flex-col overflow-hidden">
      {/* Funding rate for futures */}
      {isFutures && (
        <div className="px-2 py-1.5 text-right">
          <div className="text-[9px] text-muted-foreground">Funding Rate / Countdown</div>
          <div className="font-mono text-[10px] text-foreground">-0.0013% / 02:35:40 (8h)</div>
        </div>
      )}
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-[10px] text-muted-foreground">Price ({quoteAsset})</span>
        <span className="text-[10px] text-muted-foreground">Quantity ({baseAsset})</span>
      </div>
      {/* Asks (sells) - reversed so lowest ask is at bottom */}
      <div className="flex flex-col-reverse">
        {asks.slice(0, 8).map((a, i) => (
          <div key={`a-${i}`} className="relative flex items-center justify-between px-2 py-[2px]">
            <div className="pointer-events-none absolute inset-y-0 right-0 bg-destructive/8" style={{ width: `${(a.qty / maxQty) * 100}%` }} />
            <span className="relative font-mono text-[11px] text-destructive">{fmtP(a.price)}</span>
            <span className="relative font-mono text-[11px] text-foreground/80">{fmtQ(a.qty)}</span>
          </div>
        ))}
      </div>
      {/* Spread / Current price */}
      <div className="flex items-center justify-between border-y border-border bg-secondary/20 px-2 py-1.5">
        <div className="flex items-center gap-1">
          <span className={`font-mono text-base font-bold ${change24h >= 0 ? "text-success" : "text-destructive"}`}>{fmtP(livePrice)}</span>
          <span className="text-[9px] text-muted-foreground">{">"}</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">{fmtP(livePrice * 0.99999)}</span>
      </div>
      {/* Bids (buys) */}
      <div className="flex-1 overflow-hidden">
        {bids.slice(0, 8).map((b, i) => (
          <div key={`b-${i}`} className="relative flex items-center justify-between px-2 py-[2px]">
            <div className="pointer-events-none absolute inset-y-0 right-0 bg-success/8" style={{ width: `${(b.qty / maxQty) * 100}%` }} />
            <span className="relative font-mono text-[11px] text-success">{fmtP(b.price)}</span>
            <span className="relative font-mono text-[11px] text-foreground/80">{fmtQ(b.qty)}</span>
          </div>
        ))}
      </div>
      {/* Buy/Sell ratio bar */}
      <div className="flex items-center overflow-hidden rounded-sm mx-1 mb-1">
        <div className="flex items-center justify-start bg-success/15 px-1.5 py-0.5 text-[9px] font-semibold text-success" style={{ width: `${buyPct}%` }}>B {buyPct}%</div>
        <div className="flex items-center justify-end bg-destructive/15 px-1.5 py-0.5 text-[9px] font-semibold text-destructive" style={{ width: `${sellPct}%` }}>{sellPct}% S</div>
      </div>
      {/* Depth grouping */}
      <div className="flex items-center justify-end gap-1 px-2 pb-1">
        <select className="rounded bg-secondary/40 px-1.5 py-0.5 text-[10px] text-foreground outline-none">
          <option>0.1</option>
          <option>1</option>
          <option>10</option>
        </select>
        <button className="rounded bg-secondary/40 p-0.5">
          <BarChart3 className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  )

  /* ====== ORDER FORM ====== */
  const OrderFormPanel = (
    <div className="flex flex-col p-3">
      {/* Futures: Cross + Leverage selectors */}
      {isFutures && (
        <div className="mb-3 flex gap-2">
          <select
            value={marginType} onChange={(e) => setMarginType(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground outline-none"
          >
            <option>Cross</option>
            <option>Isolated</option>
          </select>
          <select
            value={leverage} onChange={(e) => setLeverage(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground outline-none"
          >
            <option>10x</option>
            <option>5x</option>
            <option>3x</option>
            <option>20x</option>
            <option>50x</option>
            <option>100x</option>
          </select>
        </div>
      )}

      {/* Available balance */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Available</span>
        <span className="font-mono text-xs text-foreground">
          {isBuy ? `${Number(quoteBalance).toFixed(2)} ${quoteAsset}` : `${Number(baseBalance).toFixed(6)} ${baseAsset}`}
          <Link href="/wallet" className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground">+</Link>
        </span>
      </div>

      {/* Order Type selector */}
      <div className="mb-3 flex items-center rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
        <select value={orderType} onChange={(e) => setOrderType(e.target.value as OrderType)}
          className="w-full bg-transparent text-sm font-medium text-foreground outline-none">
          <option value="Limit">Limit</option>
          <option value="Market">Market</option>
          <option value="Stop-Limit">Stop-Limit</option>
        </select>
      </div>

      {/* Price input */}
      <div className="mb-3 flex items-center rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
        <span className="text-xs text-muted-foreground">Price</span>
        <input
          type="text"
          value={orderType === "Market" ? "Market" : price}
          onChange={(e) => setPrice(e.target.value)}
          readOnly={orderType === "Market"}
          className="flex-1 bg-transparent text-right font-mono text-sm text-foreground outline-none"
        />
        <span className="ml-2 text-xs text-muted-foreground">USDT</span>
      </div>

      {/* Quantity input */}
      <div className="mb-3 flex items-center rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
        <span className="text-xs text-muted-foreground">Quantity</span>
        <input
          type="text" value={amount}
          onChange={(e) => { setAmount(e.target.value); setSliderPct(0) }}
          placeholder="0.000"
          className="flex-1 bg-transparent text-right font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
        />
        <span className="ml-2 flex items-center gap-1 text-xs text-muted-foreground">
          {baseAsset}
          <ArrowUpDown className="h-3 w-3" />
        </span>
      </div>

      {/* Percentage slider */}
      <div className="mb-3 flex items-center gap-0">
        {percentages.map((pct, i) => (
          <div key={pct} className="flex flex-1 items-center">
            <button
              onClick={() => handleSlider(pct)}
              className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-colors ${sliderPct >= pct ? "border-foreground bg-foreground" : "border-muted-foreground/40 bg-background"}`}
            />
            {i < percentages.length - 1 && (
              <div className={`h-0.5 flex-1 ${sliderPct > pct ? "bg-foreground" : "bg-muted-foreground/20"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Value / Cost / Liq. Price info box */}
      <div className="mb-3 rounded-lg border border-border bg-secondary/20 px-3 py-2 text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Value</span>
          <span className="font-mono text-foreground">{total > 0 ? `${total.toFixed(2)}` : "0/0"} USDT</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-muted-foreground">Cost</span>
          <span className="font-mono text-foreground">{isFutures && total > 0 ? `${(total / parseInt(leverage)).toFixed(2)}` : "0/0"} USDT</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-muted-foreground">Liq. Price</span>
          <span className="font-mono text-primary cursor-pointer">Calculate</span>
        </div>
      </div>

      {/* TP/SL */}
      <label className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" className="h-3.5 w-3.5 rounded border-border accent-foreground" />
        TP/SL
      </label>

      {/* Post-Only + Reduce-Only + GTC */}
      <div className="mb-3 flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={postOnly} onChange={(e) => setPostOnly(e.target.checked)} className="h-3.5 w-3.5 rounded border-border accent-foreground" />
          Post-Only
        </label>
        {isFutures && (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={reduceOnly} onChange={(e) => setReduceOnly(e.target.checked)} className="h-3.5 w-3.5 rounded border-border accent-foreground" />
            Reduce-Only
          </label>
        )}
        <div className="flex items-center justify-end">
          <select className="rounded bg-transparent text-xs text-foreground outline-none">
            <option>GTC</option>
            <option>IOC</option>
            <option>FOK</option>
          </select>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-3 rounded-lg px-3 py-2 text-xs font-medium ${feedback.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
          {feedback.msg}
        </div>
      )}

      {/* Submit Buttons - Long/Short for Futures, Buy/Sell for Spot */}
      {isFutures ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setSide("buy"); handleSubmit() }}
            disabled={submitting || !parsedAmount}
            className="w-full rounded-lg bg-success py-3.5 text-sm font-bold text-[#0a0e17] transition-colors disabled:opacity-40"
          >
            {submitting && side === "buy" ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Long"}
          </button>
          <button
            onClick={() => { setSide("sell"); handleSubmit() }}
            disabled={submitting || !parsedAmount}
            className="w-full rounded-lg bg-destructive py-3.5 text-sm font-bold text-white transition-colors disabled:opacity-40"
          >
            {submitting && side === "sell" ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Short"}
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={submitting || !parsedAmount}
          className={`w-full rounded-lg py-3.5 text-sm font-semibold transition-colors disabled:opacity-40 ${isBuy ? "bg-success text-[#0a0e17]" : "bg-destructive text-white"}`}
        >
          {submitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : (isBuy ? `Buy ${baseAsset}` : `Sell ${baseAsset}`)}
        </button>
      )}
    </div>
  )

  /* ====== BOTTOM TABS ====== */
  const BottomTabsPanel = (
    <div className="border-t border-border">
      <div className="scrollbar-none flex items-center gap-0 overflow-x-auto border-b border-border px-2">
        {(["orders", "positions", "history", "assets"] as BottomTab[]).map((t) => {
          const labels: Record<string, string> = {
            orders: `Open Orders(${orders.length})`,
            positions: `Positions(${positions.length})`,
            history: "Trade History",
            assets: "Assets",
          }
          return (
            <button key={t} onClick={() => setBottomTab(t)}
              className={`shrink-0 whitespace-nowrap px-3 py-2.5 text-xs font-medium transition-colors ${bottomTab === t ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground"}`}
            >
              {labels[t]}
            </button>
          )
        })}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setBalanceVisible(!balanceVisible)} className="p-1.5">
            {balanceVisible ? <Eye className="h-3.5 w-3.5 text-muted-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input type="checkbox" checked className="h-3.5 w-3.5 rounded border-border accent-foreground" readOnly />
          All Markets
        </label>
        <button className="flex items-center gap-1 text-xs text-foreground">
          All Types <ChevronDown className="h-3 w-3" />
        </button>
        <button className="p-1"><ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" /></button>
      </div>

      <div className="h-[200px] overflow-y-auto lg:h-[280px]">
        {/* ===== OPEN ORDERS TAB ===== */}
        {bottomTab === "orders" && (
          orders.length === 0 ? (
            <EmptyState icon={<BarChart3 className="h-7 w-7 text-muted-foreground/40" />} text="No Open Orders" />
          ) : (
            <div className="flex flex-col">
              {orders.map((o: any) => {
                const remaining = Number(o.amount) - Number(o.filled)
                return (
                  <div key={o.id} className="flex items-center justify-between border-b border-border/50 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <MarketAsset symbol={o.pair?.split("/")[0] || "BTC"} size={28} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">{o.pair}</span>
                          <span className={`rounded px-1 py-0.5 text-[9px] font-bold uppercase ${o.side === "buy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{o.side}</span>
                          <span className="rounded bg-secondary px-1 py-0.5 text-[9px] text-muted-foreground">{o.order_type}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Qty: {remaining.toFixed(4)} @ ${Number(o.price).toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => cancelOrder(o.id)} className="rounded-md border border-border px-2.5 py-1 text-[10px] text-muted-foreground active:border-destructive active:text-destructive">Cancel</button>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* ===== OPEN POSITIONS TAB -- live unrealized P&L ===== */}
        {bottomTab === "positions" && (
          positions.length === 0 ? (
            <EmptyState icon={<TrendingUp className="h-7 w-7 text-muted-foreground/40" />} text="No Open Positions" />
          ) : (
            <div className="flex flex-col">
              {positions.map((pos: any) => {
                const entryPrice = Number(pos.price)
                const qty = Number(pos.amount)
                const base = pos.pair?.split("/")[0] || "BTC"
                const curPrice = allPrices.find((c) => c.symbol === base)?.price ?? entryPrice
                const unrealizedPnl = (curPrice - entryPrice) * qty
                const pnlPct = entryPrice > 0 ? ((curPrice - entryPrice) / entryPrice) * 100 : 0
                const isClosing = closingId === pos.id

                return (
                  <div
                    key={pos.id}
                    onClick={() => setSelectedDetail({ ...pos, _type: "trade", _curPrice: curPrice, _unrealizedPnl: unrealizedPnl, _pnlPct: pnlPct })}
                    className="border-b border-border/50 px-3 py-2.5 active:bg-secondary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MarketAsset symbol={base} size={28} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground">{pos.pair}</span>
                            <span className="rounded bg-success/10 px-1 py-0.5 text-[9px] font-bold text-success">LONG</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>Entry: ${entryPrice.toLocaleString()}</span>
                            <span>Qty: {qty.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className={`font-mono text-xs font-bold ${unrealizedPnl >= 0 ? "text-success" : "text-destructive"}`}>
                            {unrealizedPnl >= 0 ? "+" : ""}{unrealizedPnl.toFixed(2)} USDT
                          </div>
                          <div className={`font-mono text-[10px] ${pnlPct >= 0 ? "text-success" : "text-destructive"}`}>
                            {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); closePosition(pos.id) }}
                          disabled={isClosing}
                          className="rounded-md border border-destructive px-2 py-1 text-[10px] font-semibold text-destructive disabled:opacity-50"
                        >
                          {isClosing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Close"}
                        </button>
                      </div>
                    </div>
                    {/* Live price bar */}
                    <div className="mt-1.5 flex items-center gap-3 text-[9px] text-muted-foreground">
                      <span>Mark: ${curPrice.toLocaleString()}</span>
                      <span>Liq: --</span>
                      <span>{new Date(pos.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* ===== TRADE HISTORY TAB -- closed trades with realized P&L ===== */}
        {bottomTab === "history" && (
          history.length === 0 ? (
            <EmptyState icon={<Clock className="h-7 w-7 text-muted-foreground/40" />} text="No Trade History" />
          ) : (
            <div className="flex flex-col">
              {history.map((t: any) => {
                const pnl = Number(t.pnl) || 0
                return (
                  <div key={t.id} onClick={() => setSelectedDetail({ ...t, _type: "trade" })} className="flex items-center justify-between border-b border-border/50 px-3 py-2.5 active:bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <MarketAsset symbol={t.pair?.split("/")[0] || "BTC"} size={24} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-foreground">{t.pair}</span>
                          <span className={`text-[9px] font-bold ${t.side === "buy" ? "text-success" : "text-destructive"}`}>{t.side?.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                          <span>${Number(t.price).toLocaleString()}</span>
                          {t.close_price && <span>{"=>"} ${Number(t.close_price).toLocaleString()}</span>}
                          <span>{Number(t.amount).toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono text-xs font-semibold ${pnl >= 0 ? "text-success" : "text-destructive"}`}>
                        {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
                      </span>
                      <div className="text-[9px] text-muted-foreground">{new Date(t.closed_at || t.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* ===== ASSETS TAB ===== */}
        {bottomTab === "assets" && (
          balances.filter((b: any) => Number(b.available) > 0 || Number(b.in_order) > 0).length === 0 ? (
            <EmptyState icon={<BarChart3 className="h-7 w-7 text-muted-foreground/40" />} text="No Assets" />
          ) : (
            <div className="flex flex-col">
              {balances.filter((b: any) => Number(b.available) > 0 || Number(b.in_order) > 0).map((b: any) => {
                const pr = b.asset === "USDT" ? 1 : (allPrices.find((c) => c.symbol === b.asset)?.price ?? 0)
                const totalVal = (Number(b.available) + Number(b.in_order)) * pr
                return (
                  <div key={b.asset} className="flex items-center justify-between border-b border-border/50 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <MarketAsset symbol={b.asset} size={28} />
                      <div>
                        <span className="text-xs font-semibold text-foreground">{b.asset}</span>
                        <span className="block text-[10px] text-muted-foreground">{balanceVisible ? `${Number(b.available).toFixed(4)} avail` : "****"}</span>
                        {Number(b.in_order) > 0 && (
                          <span className="text-[9px] text-muted-foreground/60">{balanceVisible ? `${Number(b.in_order).toFixed(4)} in order` : ""}</span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-xs text-foreground">{balanceVisible ? `$${totalVal.toFixed(2)}` : "****"}</span>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* ===== TOP BAR - Trade Mode Tabs ===== */}
      <div className="flex items-center border-b border-border px-2 py-1.5 lg:px-4">
        <button onClick={() => router.push("/dashboard")} className="mr-2 rounded-lg p-1.5 lg:hidden">
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="scrollbar-none flex items-center gap-1 overflow-x-auto">
          {tradeModes.map((m) => (
            <button key={m} onClick={() => setTradeMode(m)}
              className={`shrink-0 px-3 py-2 text-sm font-medium transition-colors ${tradeMode === m ? "font-bold text-foreground" : "text-muted-foreground"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Pair Bar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2 lg:px-4">
        <button onClick={() => setShowPairSelector(true)} className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-foreground">{pairDisplay}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${change24h >= 0 ? "text-success" : "text-destructive"}`}>
            {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
          </span>
          <span className="rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">MM</span>
          <Link href={`/trade/chart?pair=${selectedPair}`} className="rounded border border-border p-1.5 lg:hidden">
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* Pair Selector Overlay */}
      {showPairSelector && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Select Pair</h2>
              <button onClick={() => setShowPairSelector(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PairSelector activePair={selectedPair} onSelectPair={(pair) => { setSelectedPair(pair); setShowPairSelector(false); setPrice("") }} />
            </div>
          </div>
        </div>
      )}

      {/* ===== MOBILE: Buy/Sell or Long/Short Toggle ===== */}
      <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
        {/* Buy/Sell Toggle + Margin (Spot) or nothing extra (Futures has Cross/leverage in form) */}
        {!isFutures && (
          <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
            <div className="flex overflow-hidden rounded-lg border border-border">
              <button onClick={() => setSide("buy")} className={`px-6 py-2 text-sm font-semibold transition-colors ${isBuy ? "bg-success text-[#0a0e17]" : "text-muted-foreground"}`}>Buy</button>
              <button onClick={() => setSide("sell")} className={`px-6 py-2 text-sm font-semibold transition-colors ${!isBuy ? "bg-destructive text-white" : "text-muted-foreground"}`}>Sell</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Margin</span>
              <button onClick={() => setMarginEnabled(!marginEnabled)}
                className={`relative h-5 w-9 rounded-full transition-colors ${marginEnabled ? "bg-[#f7a600]" : "bg-secondary"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform ${marginEnabled ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Order Form */}
          <div className="w-[52%] overflow-y-auto border-r border-border md:w-[45%]">
            {OrderFormPanel}
          </div>
          {/* Right: Order Book */}
          <div className="flex w-[48%] flex-col overflow-hidden md:w-[55%]">
            {OrderBookPanel}
          </div>
        </div>

        {BottomTabsPanel}
      </div>

      {/* ===== DESKTOP: 3-column layout with TradingView chart ===== */}
      <div className="hidden flex-1 overflow-hidden lg:flex">
        <div className="flex w-[260px] shrink-0 flex-col border-r border-border">
          {OrderBookPanel}
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 border-b border-border bg-card">
            <TradingViewChart symbol={selectedPair.replace("/", "")} theme="dark" />
          </div>
          {BottomTabsPanel}
        </div>
        <div className="flex w-[300px] shrink-0 flex-col overflow-y-auto border-l border-border">
          <div className="flex items-center justify-between border-b border-border p-4">
            {isFutures ? (
              <span className="text-sm font-bold text-foreground">Futures Order</span>
            ) : (
              <div className="flex overflow-hidden rounded-lg border border-border">
                <button onClick={() => setSide("buy")} className={`px-5 py-2 text-sm font-semibold transition-colors ${isBuy ? "bg-success text-[#0a0e17]" : "text-muted-foreground"}`}>Buy</button>
                <button onClick={() => setSide("sell")} className={`px-5 py-2 text-sm font-semibold transition-colors ${!isBuy ? "bg-destructive text-white" : "text-muted-foreground"}`}>Sell</button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Margin</span>
              <button onClick={() => setMarginEnabled(!marginEnabled)}
                className={`relative h-5 w-9 rounded-full transition-colors ${marginEnabled ? "bg-[#f7a600]" : "bg-secondary"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform ${marginEnabled ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>
          {OrderFormPanel}
        </div>
      </div>

      {/* ===== DETAIL MODAL ===== */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm lg:items-center" onClick={() => setSelectedDetail(null)}>
          <div className="w-full max-w-lg rounded-t-3xl border-t border-border bg-card p-5 pb-8 lg:rounded-2xl lg:border" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MarketAsset symbol={selectedDetail.pair?.split("/")[0] || "BTC"} size={36} />
                <div>
                  <h3 className="text-base font-bold text-foreground">{selectedDetail.pair}</h3>
                  <p className="text-xs capitalize text-muted-foreground">
                    {selectedDetail._type === "order"
                      ? `${selectedDetail.order_type} ${selectedDetail.side} Order`
                      : selectedDetail.status === "open"
                        ? `Open ${selectedDetail.side === "buy" ? "Long" : "Short"} Position`
                        : `${selectedDetail.side} Trade (Closed)`
                    }
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="rounded-lg p-1.5 text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="mb-4 flex items-center gap-2">
              {selectedDetail._type === "order" ? (
                <span className="flex items-center gap-1 rounded-full bg-[#f7a600]/10 px-2.5 py-1 text-[10px] font-semibold text-[#f7a600]"><Clock className="h-3 w-3" />Pending</span>
              ) : selectedDetail.status === "open" ? (
                <span className="flex items-center gap-1 rounded-full bg-[#f7a600]/10 px-2.5 py-1 text-[10px] font-semibold text-[#f7a600]"><TrendingUp className="h-3 w-3" />Open Position</span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-semibold text-success"><CheckCircle2 className="h-3 w-3" />Closed</span>
              )}
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${selectedDetail.side === "buy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {selectedDetail.side?.toUpperCase()}
              </span>
            </div>
            {(() => {
              const detailBase = selectedDetail.pair?.split("/")[0] || "BTC"
              const detailEntryPrice = Number(selectedDetail.price)
              const detailQty = Number(selectedDetail.amount)
              // Always get the LATEST live price for this asset
              const detailLivePrice = allPrices.find((c) => c.symbol === detailBase)?.price ?? detailEntryPrice
              const detailPnl = selectedDetail.status === "open"
                ? (detailLivePrice - detailEntryPrice) * detailQty
                : Number(selectedDetail.pnl) || 0
              const detailPnlPct = detailEntryPrice > 0
                ? ((detailLivePrice - detailEntryPrice) / detailEntryPrice) * 100
                : 0

              return (
                <div className="grid grid-cols-2 gap-2.5">
                  <DetailCell label={selectedDetail.status === "open" ? "Entry Price" : "Order Price"} value={`$${detailEntryPrice.toLocaleString()}`} />
                  <DetailCell label="Current Price" value={detailLivePrice > 0 ? `$${formatPrice(detailLivePrice)}` : "--"} />
                  <DetailCell label="Amount" value={`${detailQty.toFixed(6)} ${detailBase}`} />
                  <DetailCell label="Total" value={`$${(detailEntryPrice * detailQty).toFixed(2)}`} />
                  {selectedDetail.fee !== undefined && (
                    <DetailCell label="Fee" value={`$${Number(selectedDetail.fee).toFixed(4)}`} />
                  )}
                  {selectedDetail.status === "open" ? (
                    <DetailCell
                      label="Unrealized P&L"
                      value={`${detailPnl >= 0 ? "+" : ""}${detailPnl.toFixed(2)} USDT (${detailPnlPct >= 0 ? "+" : ""}${detailPnlPct.toFixed(2)}%)`}
                      valueClass={detailPnl >= 0 ? "text-success" : "text-destructive"}
                    />
                  ) : selectedDetail.pnl !== undefined ? (
                    <DetailCell label="P&L" value={`${detailPnl >= 0 ? "+" : ""}${detailPnl.toFixed(2)} USDT`} valueClass={detailPnl >= 0 ? "text-success" : "text-destructive"} />
                  ) : null}
                </div>
              )
            })()}
            <div className="mt-2">
              <DetailCell label="Time" value={new Date(selectedDetail.created_at).toLocaleString()} />
            </div>
            {/* Close price and date for closed trades */}
            {selectedDetail.close_price && (
              <div className="mt-2 grid grid-cols-2 gap-2.5">
                <DetailCell label="Close Price" value={`$${Number(selectedDetail.close_price).toLocaleString()}`} />
                <DetailCell label="Closed At" value={selectedDetail.closed_at ? new Date(selectedDetail.closed_at).toLocaleString() : "N/A"} />
              </div>
            )}
            <div className="mt-4 flex gap-2">
              {selectedDetail._type === "order" ? (
                <button onClick={() => { cancelOrder(selectedDetail.id); setSelectedDetail(null) }} className="flex-1 rounded-lg border border-destructive py-3 text-sm font-semibold text-destructive">Cancel Order</button>
              ) : selectedDetail.status === "open" ? (
                <button
                  onClick={() => { closePosition(selectedDetail.id); setSelectedDetail(null) }}
                  className="flex-1 rounded-lg bg-destructive py-3 text-sm font-semibold text-white"
                >
                  Close Position at Market
                </button>
              ) : (
                <button onClick={() => handleShare(selectedDetail)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 py-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/40">{icon}</div>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  )
}

function DetailCell({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-2.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`font-mono text-sm font-semibold ${valueClass || "text-foreground"}`}>{value}</p>
    </div>
  )
}
