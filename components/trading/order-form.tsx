"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import useSWR, { mutate as globalMutate } from "swr"

type OrderSide = "buy" | "sell"
type OrderType = "Limit" | "Market" | "Stop-Limit"

const percentages = [25, 50, 75, 100]
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function OrderForm({ pair = "BTC/USDT" }: { pair?: string }) {
  const [side, setSide] = useState<OrderSide>("buy")
  const [orderType, setOrderType] = useState<OrderType>("Market")
  const [price, setPrice] = useState("")
  const [amount, setAmount] = useState("")
  const [stopPrice, setStopPrice] = useState("")
  const [selectedPercent, setSelectedPercent] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [user, setUser] = useState<{ id: string } | null>(null)

  const baseAsset = pair.split("/")[0]
  const quoteAsset = pair.split("/")[1] || "USDT"

  const { crypto } = useLivePrices(5000)
  const livePrice = crypto.find((c) => c.symbol === baseAsset)?.price ?? 0

  const { data: balData } = useSWR(user ? "/api/trade?type=balances" : null, fetcher, { refreshInterval: 5000 })
  const balances = balData?.balances ?? []
  const quoteBalance = balances.find((b: { asset: string }) => b.asset === quoteAsset)?.available ?? 0
  const baseBalance = balances.find((b: { asset: string }) => b.asset === baseAsset)?.available ?? 0

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ? { id: u.id } : null))
    } catch { /* not logged in */ }
  }, [])

  useEffect(() => {
    if (livePrice > 0 && !price) setPrice(formatPrice(livePrice))
  }, [livePrice, price])

  const effectivePrice = orderType === "Market" ? livePrice : parseFloat(price.replace(/,/g, "")) || 0
  const parsedAmount = parseFloat(amount) || 0
  const total = effectivePrice * parsedAmount
  const fee = total * 0.001

  const handlePercentClick = useCallback((pct: number) => {
    setSelectedPercent(pct)
    if (side === "buy" && effectivePrice > 0) {
      setAmount(((quoteBalance * pct / 100) / effectivePrice).toFixed(6))
    } else if (side === "sell") {
      setAmount((baseBalance * pct / 100).toFixed(6))
    }
  }, [side, effectivePrice, quoteBalance, baseBalance])

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
          pair, side,
          order_type: orderType === "Market" ? "market" : orderType === "Limit" ? "limit" : "stop_limit",
          price: orderType !== "Market" ? parseFloat(price.replace(/,/g, "")) : undefined,
          stop_price: orderType === "Stop-Limit" ? parseFloat(stopPrice.replace(/,/g, "")) : undefined,
          amount: parsedAmount,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", msg: data.message })
        setAmount("")
        setSelectedPercent(null)
        globalMutate("/api/trade?type=balances")
        globalMutate("/api/trade?type=orders")
        globalMutate("/api/trade?type=trades")
      } else {
        const errorMsg = data.error || "Order failed"
        if (errorMsg.includes("market price")) {
          setFeedback({ type: "error", msg: "Price service temporarily unavailable. Please try again in a moment." })
        } else {
          setFeedback({ type: "error", msg: errorMsg })
        }
      }
    } catch {
      setFeedback({ type: "error", msg: "Network error. Please check your connection." })
    } finally {
      setSubmitting(false)
      setTimeout(() => setFeedback(null), 5000)
    }
  }

  const isBuy = side === "buy"

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-border">
        <button onClick={() => setSide("buy")} className={`flex-1 py-2.5 text-center text-sm font-semibold transition-colors ${isBuy ? "border-b-2 border-success bg-success/5 text-success" : "text-muted-foreground hover:text-foreground"}`}>Buy</button>
        <button onClick={() => setSide("sell")} className={`flex-1 py-2.5 text-center text-sm font-semibold transition-colors ${!isBuy ? "border-b-2 border-destructive bg-destructive/5 text-destructive" : "text-muted-foreground hover:text-foreground"}`}>Sell</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-4 flex items-center gap-1">
          {(["Limit", "Market", "Stop-Limit"] as const).map((type) => (
            <button key={type} onClick={() => setOrderType(type)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${orderType === type ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{type}</button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Available</span>
          <span className="font-mono text-xs text-foreground">
            {isBuy ? `${Number(quoteBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${quoteAsset}` : `${Number(baseBalance).toFixed(6)} ${baseAsset}`}
          </span>
        </div>

        {orderType === "Stop-Limit" && (
          <div className="mb-3">
            <label className="mb-1 block text-[10px] text-muted-foreground">Stop Price</label>
            <div className="flex items-center rounded-md border border-border bg-secondary/30 px-3 py-2">
              <input type="text" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} placeholder="0.00" className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{quoteAsset}</span>
            </div>
          </div>
        )}

        {orderType !== "Market" ? (
          <div className="mb-3">
            <label className="mb-1 block text-[10px] text-muted-foreground">Price</label>
            <div className="flex items-center rounded-md border border-border bg-secondary/30 px-3 py-2">
              <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none" />
              <span className="text-xs text-muted-foreground">{quoteAsset}</span>
            </div>
          </div>
        ) : (
          <div className="mb-3 flex items-center justify-between rounded-md border border-border bg-secondary/20 px-3 py-2.5">
            <span className="text-xs text-muted-foreground">Market Price</span>
            <span className="font-mono text-xs text-foreground">${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        <div className="mb-3">
          <label className="mb-1 block text-[10px] text-muted-foreground">Amount</label>
          <div className="flex items-center rounded-md border border-border bg-secondary/30 px-3 py-2">
            <input type="text" value={amount} onChange={(e) => { setAmount(e.target.value); setSelectedPercent(null) }} placeholder="0.00" className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{baseAsset}</span>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          {percentages.map((pct) => (
            <button key={pct} onClick={() => handlePercentClick(pct)} className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-colors ${selectedPercent === pct ? (isBuy ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive") : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{pct}%</button>
          ))}
        </div>

        <div className="mb-2">
          <label className="mb-1 block text-[10px] text-muted-foreground">Total</label>
          <div className="flex items-center rounded-md border border-border bg-secondary/30 px-3 py-2">
            <span className="flex-1 font-mono text-sm text-foreground">{total > 0 ? total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</span>
            <span className="text-xs text-muted-foreground">{quoteAsset}</span>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Est. Fee (0.1%)</span>
          <span className="font-mono text-[10px] text-muted-foreground">{fee > 0 ? `${fee.toFixed(4)} ${quoteAsset}` : "--"}</span>
        </div>

        {feedback && (
          <div className={`mb-3 rounded-md px-3 py-2 text-xs font-medium ${feedback.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{feedback.msg}</div>
        )}

        <Button onClick={handleSubmit} disabled={submitting || !parsedAmount} className={`w-full py-3 text-sm font-semibold ${isBuy ? "bg-success text-success-foreground hover:bg-success/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`}>
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {submitting ? "Processing..." : `${isBuy ? "Buy" : "Sell"} ${baseAsset}`}
        </Button>
      </div>
    </div>
  )
}
