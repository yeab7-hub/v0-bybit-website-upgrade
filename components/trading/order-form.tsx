"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"

type OrderSide = "buy" | "sell"
type OrderType = "Limit" | "Market" | "Stop-Limit"

const percentages = [25, 50, 75, 100]

export function OrderForm() {
  const [side, setSide] = useState<OrderSide>("buy")
  const [orderType, setOrderType] = useState<OrderType>("Limit")
  const [price, setPrice] = useState("")
  const [amount, setAmount] = useState("")
  const [stopPrice, setStopPrice] = useState("")
  const [selectedPercent, setSelectedPercent] = useState<number | null>(null)
  const { crypto } = useLivePrices(5000)
  const btcPrice = crypto.find((c) => c.symbol === "BTC")?.price ?? 0

  // Set initial price from live data
  useEffect(() => {
    if (btcPrice > 0 && !price) {
      setPrice(formatPrice(btcPrice))
    }
  }, [btcPrice, price])

  const isBuy = side === "buy"

  return (
    <div className="flex h-full flex-col">
      {/* Buy/Sell toggle */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-2.5 text-center text-sm font-semibold ${
            isBuy
              ? "border-b-2 border-success bg-success/5 text-success"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-2.5 text-center text-sm font-semibold ${
            !isBuy
              ? "border-b-2 border-destructive bg-destructive/5 text-destructive"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Order Type Tabs */}
        <div className="mb-4 flex items-center gap-1">
          {(["Limit", "Market", "Stop-Limit"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                orderType === type
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Balance */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Available</span>
          <span className="font-mono text-xs text-foreground">
            {isBuy ? "10,000.00 USDT" : "0.2458 BTC"}
          </span>
        </div>

        {/* Stop Price (Stop-Limit only) */}
        {orderType === "Stop-Limit" && (
          <div className="mb-3">
            <label className="mb-1 block text-[10px] text-muted-foreground">
              Stop Price
            </label>
            <div className="flex items-center rounded-md border border-border bg-secondary/30 px-3 py-2">
              <input
                type="text"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                placeholder="Stop Price"
                className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <span className="text-xs text-muted-foreground">USDT</span>
            </div>
          </div>
        )}

        {/* Price */}
        {orderType !== "Market" && (
          <div className="mb-3">
            <label className="mb-1 block text-[10px] text-muted-foreground">
              Price
            </label>
            <div className="flex items-center rounded-md border border-border bg-secondary/30 px-3 py-2">
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none"
              />
              <span className="text-xs text-muted-foreground">USDT</span>
            </div>
          </div>
        )}

        {orderType === "Market" && (
          <div className="mb-3 rounded-md border border-border bg-secondary/20 px-3 py-2.5">
            <span className="text-xs text-muted-foreground">
              Market Price - Best Available
            </span>
          </div>
        )}

        {/* Amount */}
        <div className="mb-3">
          <label className="mb-1 block text-[10px] text-muted-foreground">
            Amount
          </label>
          <div className="flex items-center rounded-md border border-border bg-secondary/30 px-3 py-2">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <span className="text-xs text-muted-foreground">BTC</span>
          </div>
        </div>

        {/* Percentage slider */}
        <div className="mb-4 flex items-center gap-2">
          {percentages.map((pct) => (
            <button
              key={pct}
              onClick={() => setSelectedPercent(pct)}
              className={`flex-1 rounded-md py-1 text-[10px] font-medium ${
                selectedPercent === pct
                  ? isBuy
                    ? "bg-success/20 text-success"
                    : "bg-destructive/20 text-destructive"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="mb-4">
          <label className="mb-1 block text-[10px] text-muted-foreground">
            Total
          </label>
          <div className="flex items-center rounded-md border border-border bg-secondary/30 px-3 py-2">
            <input
              type="text"
              readOnly
              value=""
              placeholder="0.00"
              className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <span className="text-xs text-muted-foreground">USDT</span>
          </div>
        </div>

        {/* TP/SL */}
        <div className="mb-4 flex items-center justify-between rounded-md border border-border bg-secondary/20 px-3 py-2">
          <span className="text-xs text-muted-foreground">TP/SL</span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" />
            <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-foreground after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
          </label>
        </div>

        {/* Submit */}
        <Button
          className={`w-full py-3 text-sm font-semibold ${
            isBuy
              ? "bg-success text-success-foreground hover:bg-success/90"
              : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          }`}
        >
          {isBuy ? "Buy BTC" : "Sell BTC"}
        </Button>

        {/* Fee info */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            Est. Fee (Maker)
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            0.10%
          </span>
        </div>
      </div>
    </div>
  )
}
