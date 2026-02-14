"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { PriceChart } from "@/components/trading/price-chart"
import { OrderBook } from "@/components/trading/order-book"
import { OrderForm } from "@/components/trading/order-form"
import { TradeHistory } from "@/components/trading/trade-history"
import { OpenOrders } from "@/components/trading/open-orders"
import { PairSelector } from "@/components/trading/pair-selector"
import { ChevronDown, X } from "lucide-react"

export default function TradePage() {
  const [selectedPair, setSelectedPair] = useState("BTCUSDT")
  const [showMobilePairs, setShowMobilePairs] = useState(false)
  const [mobileTab, setMobileTab] = useState<"chart" | "book" | "order">("chart")

  const pairDisplay = selectedPair.replace("USDT", "/USDT")
  const baseAsset = selectedPair.replace("USDT", "")

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <Header />

      {/* ─── MOBILE TOP BAR ─── */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2 lg:hidden">
        <button
          onClick={() => setShowMobilePairs(true)}
          className="flex items-center gap-1.5 rounded-md bg-secondary/50 px-3 py-1.5 text-sm font-semibold text-foreground"
        >
          {pairDisplay}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <div className="flex gap-1">
          {(["chart", "book", "order"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMobileTab(t)}
              className={`rounded px-3 py-1 text-xs font-medium capitalize transition-colors ${
                mobileTab === t ? "bg-[#f7a600]/10 text-[#f7a600]" : "text-muted-foreground"
              }`}
            >
              {t === "book" ? "Book" : t === "order" ? "Trade" : "Chart"}
            </button>
          ))}
        </div>
      </div>

      {/* ─── MOBILE PAIR OVERLAY ─── */}
      {showMobilePairs && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Select Pair</h2>
              <button onClick={() => setShowMobilePairs(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PairSelector
                activePair={selectedPair}
                onSelectPair={(pair) => { setSelectedPair(pair); setShowMobilePairs(false) }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── DESKTOP LAYOUT ─── */}
      <div className="hidden flex-1 overflow-hidden lg:flex">
        {/* Left: Pair List */}
        <div className="w-[240px] shrink-0 border-r border-border">
          <PairSelector onSelectPair={setSelectedPair} activePair={selectedPair} />
        </div>

        {/* Center column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top row: Chart + OrderBook + OrderForm */}
          <div className="flex flex-1 overflow-hidden">
            {/* Chart */}
            <div className="flex-1">
              <PriceChart symbol={selectedPair} />
            </div>

            {/* Order Book */}
            <div className="w-[240px] shrink-0 border-l border-border">
              <OrderBook />
            </div>

            {/* Order Form (Buy / Sell) */}
            <div className="w-[280px] shrink-0 border-l border-border">
              <OrderForm pair={pairDisplay} />
            </div>
          </div>

          {/* Bottom: Open Orders + Trade History */}
          <div className="h-[200px] shrink-0 border-t border-border">
            <OpenOrders />
          </div>
        </div>
      </div>

      {/* ─── MOBILE LAYOUT ─── */}
      <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
        {mobileTab === "chart" && (
          <div className="flex-1">
            <PriceChart symbol={selectedPair} />
          </div>
        )}
        {mobileTab === "book" && (
          <div className="flex-1 overflow-hidden">
            <OrderBook />
          </div>
        )}
        {mobileTab === "order" && (
          <div className="flex-1 overflow-auto">
            <OrderForm pair={pairDisplay} />
          </div>
        )}
      </div>

      {/* ─── MOBILE STICKY BUY / SELL ─── */}
      {mobileTab !== "order" && (
        <div className="flex gap-2 border-t border-border p-3 lg:hidden">
          <button
            onClick={() => setMobileTab("order")}
            className="flex-1 rounded-lg bg-[#0ecb81] py-3 text-sm font-semibold text-white"
          >
            Buy {baseAsset}
          </button>
          <button
            onClick={() => setMobileTab("order")}
            className="flex-1 rounded-lg bg-[#f6465d] py-3 text-sm font-semibold text-white"
          >
            Sell {baseAsset}
          </button>
        </div>
      )}
    </div>
  )
}
