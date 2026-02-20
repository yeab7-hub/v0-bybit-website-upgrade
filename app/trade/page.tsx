"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, ChevronDown, X, Settings2, BarChart3,
  Loader2, Eye, EyeOff, ArrowUpDown, SlidersHorizontal,
  TrendingUp, TrendingDown, Clock, CheckCircle2, Info,
  Home, LineChart, Coins, Wallet, Menu, Share2, Copy,
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
type BottomTab = "orders" | "positions" | "history" | "assets" | "pnl"
type TradeMode = "Convert" | "Spot" | "Futures" | "Options" | "TradFi"

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
  const [tpsl, setTpsl] = useState("")

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

  const { crypto, forex, commodities, stocks } = useLivePrices(3000)
  const allPrices = useMemo(() => [...crypto, ...forex, ...commodities, ...stocks], [crypto, forex, commodities, stocks])

  const isCryptoPair = selectedPair.endsWith("USDT") && !selectedPair.includes("/")
  const pairDisplay = isCryptoPair ? selectedPair.replace("USDT", "/USDT") : selectedPair
  const baseAsset = isCryptoPair ? selectedPair.replace("USDT", "") : selectedPair.split("/")[0] || selectedPair
  const quoteAsset = isCryptoPair ? "USDT" : (selectedPair.split("/")[1] || "USD")

  const livePrice = allPrices.find((a) => a.symbol === baseAsset || a.symbol === selectedPair)?.price ?? 0
  const change24h = allPrices.find((a) => a.symbol === baseAsset || a.symbol === selectedPair)?.change24h ?? 0

  const { data: balData } = useSWR(user ? "/api/trade?type=balances" : null, fetcher, { refreshInterval: 5000 })
  const { data: ordersData } = useSWR(user ? "/api/trade?type=orders" : null, fetcher, { refreshInterval: 3000 })
  const { data: tradesData } = useSWR(user ? "/api/trade?type=trades" : null, fetcher, { refreshInterval: 3000 })

  const balances = balData?.balances ?? []
  const orders = ordersData?.orders ?? []
  const trades = tradesData?.trades ?? []
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
          globalMutate("/api/trade?type=trades")
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
        globalMutate("/api/trade?type=trades")
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

  const isBuy = side === "buy"

  const handleShare = async (detail: any) => {
    const pnl = Number(detail.pnl) || 0
    const text = `${detail.pair} | ${detail.side?.toUpperCase()} | ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} USDT\nPrice: $${Number(detail.price).toLocaleString()} | Qty: ${Number(detail.amount).toFixed(4)}\nTraded on Bybit`
    if (navigator.share) {
      try { await navigator.share({ title: "My Trade", text }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); setFeedback({ type: "success", msg: "Trade details copied!" }); setTimeout(() => setFeedback(null), 2000) } catch {}
    }
  }

  // Order book data
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
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-[10px] text-muted-foreground">Price ({quoteAsset})</span>
        <span className="text-[10px] text-muted-foreground">Qty ({baseAsset})</span>
      </div>
      <div className="flex flex-col-reverse">
        {asks.slice(0, 8).map((a, i) => (
          <div key={`a-${i}`} className="relative flex items-center justify-between px-2 py-[3px]">
            <div className="pointer-events-none absolute inset-y-0 right-0 bg-destructive/8" style={{ width: `${(a.qty / maxQty) * 100}%` }} />
            <span className="relative font-mono text-[12px] text-destructive">{fmtP(a.price)}</span>
            <span className="relative font-mono text-[12px] text-foreground">{fmtQ(a.qty)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-y border-border bg-secondary/20 px-2 py-2">
        <span className={`font-mono text-base font-bold ${change24h >= 0 ? "text-success" : "text-destructive"}`}>{fmtP(livePrice)}</span>
        <span className="text-[10px] text-muted-foreground">{"~"}{formatAssetPrice(livePrice, baseAsset)}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        {bids.slice(0, 8).map((b, i) => (
          <div key={`b-${i}`} className="relative flex items-center justify-between px-2 py-[3px]">
            <div className="pointer-events-none absolute inset-y-0 right-0 bg-success/8" style={{ width: `${(b.qty / maxQty) * 100}%` }} />
            <span className="relative font-mono text-[12px] text-success">{fmtP(b.price)}</span>
            <span className="relative font-mono text-[12px] text-foreground">{fmtQ(b.qty)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center overflow-hidden rounded-sm">
        <div className="flex items-center justify-start bg-success/15 px-1.5 py-1 text-[10px] font-semibold text-success" style={{ width: `${buyPct}%` }}>B {buyPct}%</div>
        <div className="flex items-center justify-end bg-destructive/15 px-1.5 py-1 text-[10px] font-semibold text-destructive" style={{ width: `${sellPct}%` }}>{sellPct}% S</div>
      </div>
    </div>
  )

  /* ====== ORDER FORM ====== */
  const OrderFormPanel = (
    <div className="flex flex-col p-3">
      {/* Leverage + Borrow row */}
      {marginEnabled && (
        <div className="mb-3 flex gap-2">
          <select className="flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground outline-none">
            <option>USDT 10x</option>
            <option>USDT 5x</option>
            <option>USDT 3x</option>
          </select>
          <select className="flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground outline-none">
            <option>Borrow</option>
            <option>Normal</option>
          </select>
        </div>
      )}

      {/* Available */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Available</span>
        <span className="font-mono text-xs text-foreground">
          {isBuy ? `${Number(quoteBalance).toFixed(2)} ${quoteAsset}` : `${Number(baseBalance).toFixed(6)} ${baseAsset}`}
          <Link href="/wallet" className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground">+</Link>
        </span>
      </div>

      {/* TP/SL */}
      <div className="mb-3 flex items-center rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
        <span className="text-xs text-muted-foreground">TP/SL</span>
        <input type="text" value={tpsl} onChange={(e) => setTpsl(e.target.value)} placeholder="" className="flex-1 bg-transparent text-right font-mono text-sm text-foreground outline-none" />
        <ChevronDown className="ml-1 h-3 w-3 text-muted-foreground" />
      </div>

      {/* Trigger Price (only for Stop-Limit) */}
      {orderType === "Stop-Limit" && (
        <div className="mb-3 flex items-center rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
          <span className="text-xs text-muted-foreground">Trigger Price</span>
          <span className="ml-auto text-xs text-muted-foreground">USDT</span>
        </div>
      )}

      {/* Price */}
      <div className="mb-3 flex items-center rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground">Price</span>
          <input
            type="text"
            value={orderType === "Market" ? "Market" : price}
            onChange={(e) => setPrice(e.target.value)}
            readOnly={orderType === "Market"}
            className="w-full bg-transparent font-mono text-sm text-foreground outline-none"
          />
        </div>
        <select value={orderType} onChange={(e) => setOrderType(e.target.value as OrderType)}
          className="ml-auto rounded bg-transparent text-xs font-medium text-foreground outline-none">
          <option value="Limit">Limit</option>
          <option value="Market">Market</option>
          <option value="Stop-Limit">Stop-Limit</option>
        </select>
      </div>

      {/* Quantity */}
      <div className="mb-3 flex items-center rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
        <span className="text-xs text-muted-foreground">Quantity</span>
        <input
          type="text" value={amount}
          onChange={(e) => { setAmount(e.target.value); setSliderPct(0) }}
          placeholder=""
          className="flex-1 bg-transparent text-right font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Slider */}
      <div className="mb-3 flex items-center gap-0">
        {percentages.map((pct, i) => (
          <div key={pct} className="flex flex-1 items-center">
            <button
              onClick={() => handleSlider(pct)}
              className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${sliderPct >= pct ? "border-foreground bg-foreground" : "border-muted-foreground/40 bg-background"}`}
            />
            {i < percentages.length - 1 && (
              <div className={`h-0.5 flex-1 ${sliderPct > pct ? "bg-foreground" : "bg-muted-foreground/30"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Order Value */}
      <div className="mb-3 flex items-center rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
        <span className="text-xs text-muted-foreground">Order Value</span>
        <span className="ml-auto font-mono text-xs text-foreground">{total > 0 ? total.toFixed(2) : ""}</span>
        <span className="ml-1 text-xs text-muted-foreground">USDT</span>
      </div>

      {/* Max Buy / Borrowed / To Borrow info */}
      <div className="mb-3 rounded-lg border border-border bg-secondary/20 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Max. {isBuy ? "Buy" : "Sell"}</span>
          <span className="font-mono text-[10px] text-foreground">{maxSell.toFixed(6)} {baseAsset}</span>
        </div>
        {marginEnabled && (
          <>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Borrowed Amount</span>
              <span className="font-mono text-[10px] text-foreground">0 USDT</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">To Borrow</span>
              <span className="font-mono text-[10px] text-foreground">0.0000000 USDT</span>
            </div>
          </>
        )}
      </div>

      {/* Post-Only + GTC */}
      <div className="mb-3 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input type="checkbox" checked={postOnly} onChange={(e) => setPostOnly(e.target.checked)} className="h-3.5 w-3.5 rounded border-border accent-foreground" />
          Post-Only
        </label>
        <select className="rounded bg-transparent text-xs text-foreground outline-none">
          <option>GTC</option>
          <option>IOC</option>
          <option>FOK</option>
        </select>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-3 rounded-lg px-3 py-2 text-xs font-medium ${feedback.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
          {feedback.msg}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !parsedAmount}
        className={`w-full rounded-lg py-3.5 text-sm font-semibold transition-colors disabled:opacity-40 ${isBuy ? "bg-success text-[#0a0e17]" : "bg-destructive text-white"}`}
      >
        {submitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : marginEnabled ? (isBuy ? "Margin Buy" : "Margin Sell") : (isBuy ? "Buy" : "Sell")}
      </button>
    </div>
  )

  /* ====== BOTTOM TABS ====== */
  const BottomTabsPanel = (
    <div className="border-t border-border">
      <div className="scrollbar-none flex items-center gap-0 overflow-x-auto border-b border-border px-2">
        {(["orders", "positions", "history", "assets", "pnl"] as BottomTab[]).map((t) => {
          const labels: Record<string, string> = {
            orders: `Open Orders(${orders.length})`,
            positions: `Positions(${trades.filter((tr: any) => tr.status === "open").length})`,
            history: "Trade History",
            assets: "Assets",
            pnl: "Realized PnL",
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
        {bottomTab === "orders" && (
          orders.length === 0 ? (
            <EmptyState icon={<BarChart3 className="h-7 w-7 text-muted-foreground/40" />} text="No Available Data" />
          ) : (
            <div className="flex flex-col">
              {orders.map((o: any) => {
                const curPrice = allPrices.find((c) => c.symbol === o.pair?.split("/")[0])?.price ?? 0
                const remaining = Number(o.amount) - Number(o.filled)
                return (
                  <button key={o.id} onClick={() => setSelectedDetail({ ...o, _type: "order", _curPrice: curPrice })} className="flex items-center justify-between border-b border-border/50 px-3 py-2.5 text-left active:bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <MarketAsset symbol={o.pair?.split("/")[0] || "BTC"} size={28} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">{o.pair}</span>
                          <span className={`rounded px-1 py-0.5 text-[9px] font-bold uppercase ${o.side === "buy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{o.side}</span>
                          <span className="rounded bg-muted px-1 py-0.5 text-[9px] capitalize text-muted-foreground">{o.order_type}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Qty: {remaining.toFixed(4)} @ ${Number(o.price).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className={`block font-mono text-xs font-semibold ${curPrice > Number(o.price) === (o.side === "buy") ? "text-success" : "text-destructive"}`}>
                          {curPrice > 0 ? `$${formatPrice(curPrice)}` : "--"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">Current</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); cancelOrder(o.id) }} className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:border-destructive hover:text-destructive">Cancel</button>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        )}

        {bottomTab === "positions" && (
          trades.length === 0 ? (
            <EmptyState icon={<TrendingUp className="h-7 w-7 text-muted-foreground/40" />} text="No Available Data" />
          ) : (
            <div className="flex flex-col">
              {trades.map((t: any) => {
                const curPrice = allPrices.find((c) => c.symbol === t.pair?.split("/")[0])?.price ?? 0
                const pnl = Number(t.pnl) || 0
                return (
                  <button key={t.id} onClick={() => setSelectedDetail({ ...t, _type: "trade", _curPrice: curPrice })} className="flex items-center justify-between border-b border-border/50 px-3 py-2.5 text-left active:bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <MarketAsset symbol={t.pair?.split("/")[0] || "BTC"} size={28} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">{t.pair}</span>
                          <span className={`rounded px-1 py-0.5 text-[9px] font-bold uppercase ${t.side === "buy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{t.side}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`block font-mono text-xs font-semibold ${pnl >= 0 ? "text-success" : "text-destructive"}`}>
                        {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} USDT
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">{Number(t.amount).toFixed(4)} @ ${Number(t.price).toLocaleString()}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        )}

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
                        <span className="block text-[10px] text-muted-foreground">{balanceVisible ? `${Number(b.available).toFixed(6)}` : "****"} avail</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-mono text-xs font-semibold text-foreground">{balanceVisible ? `$${totalVal.toFixed(2)}` : "****"}</span>
                      {Number(b.in_order) > 0 && <span className="text-[10px] text-muted-foreground">In order: {Number(b.in_order).toFixed(6)}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {bottomTab === "history" && (
          trades.length === 0 ? (
            <EmptyState icon={<Clock className="h-7 w-7 text-muted-foreground/40" />} text="No Trade History" />
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-5 gap-1 border-b border-border px-3 py-2">
                <span className="text-[10px] font-medium text-muted-foreground">Pair</span>
                <span className="text-[10px] font-medium text-muted-foreground">Side</span>
                <span className="text-[10px] font-medium text-muted-foreground">Price</span>
                <span className="text-[10px] font-medium text-muted-foreground">Amount</span>
                <span className="text-right text-[10px] font-medium text-muted-foreground">Time</span>
              </div>
              {trades.map((t: any) => (
                <div key={t.id} className="grid grid-cols-5 gap-1 border-b border-border/50 px-3 py-2">
                  <span className="text-[11px] font-medium text-foreground">{t.pair}</span>
                  <span className={`text-[11px] font-semibold ${t.side === "buy" ? "text-success" : "text-destructive"}`}>{t.side?.toUpperCase()}</span>
                  <span className="font-mono text-[11px] text-foreground">${Number(t.price).toLocaleString()}</span>
                  <span className="font-mono text-[11px] text-foreground">{Number(t.amount).toFixed(4)}</span>
                  <span className="text-right text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )
        )}

        {bottomTab === "pnl" && (
          trades.length === 0 ? (
            <EmptyState icon={<TrendingUp className="h-7 w-7 text-muted-foreground/40" />} text="No PnL Records" />
          ) : (
            <div className="flex flex-col">
              {/* PnL Summary */}
              <div className="grid grid-cols-3 gap-3 border-b border-border p-3">
                <div className="rounded-lg bg-secondary/30 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Total Realized PnL</p>
                  <p className={`font-mono text-sm font-bold ${trades.reduce((s: number, t: any) => s + (Number(t.pnl) || 0), 0) >= 0 ? "text-success" : "text-destructive"}`}>
                    {trades.reduce((s: number, t: any) => s + (Number(t.pnl) || 0), 0) >= 0 ? "+" : ""}
                    {trades.reduce((s: number, t: any) => s + (Number(t.pnl) || 0), 0).toFixed(2)} USDT
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Total Trades</p>
                  <p className="font-mono text-sm font-bold text-foreground">{trades.length}</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Win Rate</p>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {trades.length > 0 ? Math.round((trades.filter((t: any) => (Number(t.pnl) || 0) >= 0).length / trades.length) * 100) : 0}%
                  </p>
                </div>
              </div>
              {/* Individual PnL rows */}
              {trades.map((t: any) => {
                const pnl = Number(t.pnl) || 0
                const pnlPct = Number(t.price) > 0 ? (pnl / (Number(t.price) * Number(t.amount))) * 100 : 0
                return (
                  <div key={t.id} className="flex items-center justify-between border-b border-border/50 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <MarketAsset symbol={t.pair?.split("/")[0] || "BTC"} size={24} />
                      <div>
                        <span className="text-[11px] font-semibold text-foreground">{t.pair}</span>
                        <span className="ml-1.5 text-[10px] text-muted-foreground">{t.side?.toUpperCase()}</span>
                        <p className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono text-xs font-bold ${pnl >= 0 ? "text-success" : "text-destructive"}`}>
                        {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} USDT
                      </p>
                      <p className={`font-mono text-[10px] ${pnl >= 0 ? "text-success" : "text-destructive"}`}>
                        {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                      </p>
                    </div>
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
      {/* ===== TOP BAR - Trade Mode Tabs (Bybit style) ===== */}
      <div className="flex items-center border-b border-border px-2 py-1.5 lg:px-4">
        <button onClick={() => router.push("/dashboard")} className="mr-2 rounded-lg p-1.5 lg:hidden">
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="scrollbar-none flex items-center gap-1 overflow-x-auto">
          {tradeModes.map((m) => (
            <button key={m} onClick={() => setTradeMode(m)}
              className={`shrink-0 px-3 py-2 text-sm font-medium transition-colors ${tradeMode === m ? "text-foreground" : "text-muted-foreground"}`}
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
          <div className="hidden items-center gap-1.5 lg:flex">
            <button className="rounded border border-border p-1.5"><SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" /></button>
            <button className="rounded border border-border p-1.5"><BarChart3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
          </div>
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

      {/* ===== MOBILE / TABLET: Buy/Sell + Margin Toggle ===== */}
      <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
        {/* Buy/Sell Toggle + Margin */}
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

        {/* Daily Interest - only when margin is on */}
        {marginEnabled && (
          <div className="flex items-center justify-end border-b border-border px-3 py-1">
            <span className="text-[10px] text-muted-foreground">Daily Interest</span>
            <span className="ml-2 font-mono text-[10px] text-foreground">0.00101178% | 0.00948185%</span>
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

      {/* ===== DESKTOP: 3-column layout ===== */}
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
            <div className="flex overflow-hidden rounded-lg border border-border">
              <button onClick={() => setSide("buy")} className={`px-5 py-2 text-sm font-semibold transition-colors ${isBuy ? "bg-success text-[#0a0e17]" : "text-muted-foreground"}`}>Buy</button>
              <button onClick={() => setSide("sell")} className={`px-5 py-2 text-sm font-semibold transition-colors ${!isBuy ? "bg-destructive text-white" : "text-muted-foreground"}`}>Sell</button>
            </div>
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
                    {selectedDetail._type === "order" ? `${selectedDetail.order_type} ${selectedDetail.side} order` : `${selectedDetail.side} trade`}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="rounded-lg p-1.5 text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="mb-4 flex items-center gap-2">
              {selectedDetail._type === "order" ? (
                <span className="flex items-center gap-1 rounded-full bg-[#f7a600]/10 px-2.5 py-1 text-[10px] font-semibold text-[#f7a600]"><Clock className="h-3 w-3" />Open</span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-semibold text-success"><CheckCircle2 className="h-3 w-3" />Filled</span>
              )}
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${selectedDetail.side === "buy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {selectedDetail.side?.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <DetailCell label="Order Price" value={`$${Number(selectedDetail.price).toLocaleString()}`} />
              {selectedDetail._curPrice > 0 && <DetailCell label="Current Price" value={`$${formatPrice(selectedDetail._curPrice)}`} />}
              <DetailCell label="Amount" value={`${Number(selectedDetail.amount).toFixed(6)} ${selectedDetail.pair?.split("/")[0]}`} />
              <DetailCell label="Total" value={`$${Number(selectedDetail.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              {selectedDetail.fee !== undefined && <DetailCell label="Fee" value={`$${Number(selectedDetail.fee).toFixed(4)}`} />}
              {selectedDetail.pnl !== undefined && (
                <DetailCell label="P&L" value={`${Number(selectedDetail.pnl) >= 0 ? "+" : ""}${Number(selectedDetail.pnl).toFixed(2)} USDT`} valueClass={Number(selectedDetail.pnl) >= 0 ? "text-success" : "text-destructive"} />
              )}
              {selectedDetail._type === "order" && (
                <>
                  <DetailCell label="Filled" value={`${Number(selectedDetail.filled).toFixed(6)}`} />
                  <DetailCell label="Remaining" value={`${(Number(selectedDetail.amount) - Number(selectedDetail.filled)).toFixed(6)}`} />
                </>
              )}
              {selectedDetail.created_at && <DetailCell label="Time" value={new Date(selectedDetail.created_at).toLocaleString()} />}
            </div>
            <div className="mt-4 flex gap-2">
              {selectedDetail._type === "order" ? (
                <button onClick={() => { cancelOrder(selectedDetail.id); setSelectedDetail(null) }} className="flex-1 rounded-lg border border-destructive py-3 text-sm font-semibold text-destructive">Cancel Order</button>
              ) : (
                <button onClick={() => handleShare(selectedDetail)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground">
                  <Share2 className="h-4 w-4" /> Share Trade
                </button>
              )}
              <button onClick={() => handleShare(selectedDetail)} className="flex items-center justify-center rounded-lg border border-border px-4 py-3 text-muted-foreground hover:text-foreground">
                <Copy className="h-4 w-4" />
              </button>
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
