"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { PriceChart } from "@/components/trading/price-chart"
import { OrderBook } from "@/components/trading/order-book"
import { OrderForm } from "@/components/trading/order-form"
import { TradeHistory } from "@/components/trading/trade-history"
import { OpenOrders } from "@/components/trading/open-orders"
import { PairSelector } from "@/components/trading/pair-selector"
import { ChevronDown, X, List } from "lucide-react"

export default function TradePage() {
  const [selectedPair, setSelectedPair] = useState("BTCUSDT")
  const [showMobilePairs, setShowMobilePairs] = useState(false)
  const [mobileTab, setMobileTab] = useState<"chart" | "book" | "trades" | "order">("chart")

  const pairDisplay = selectedPair.replace("USDT", "/USDT")

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <Header />

      {/* Mobile pair header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2 lg:hidden">
        <button
          onClick={() => setShowMobilePairs(true)}
          className="flex items-center gap-1.5 rounded-md bg-secondary/50 px-3 py-1.5 text-sm font-semibold text-foreground"
        >
          {pairDisplay}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <div className="flex gap-1">
          {(["chart", "book", "trades", "order"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`rounded px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                mobileTab === tab ? "bg-[#f7a600]/10 text-[#f7a600]" : "text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile pair selector overlay */}
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
                onSelectPair={(pair) => {
                  setSelectedPair(pair)
                  setShowMobilePairs(false)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="hidden flex-1 overflow-hidden lg:flex">
        {/* Left: Pair Selector */}
        <div className="w-[240px] shrink-0 border-r border-border xl:w-[260px]">
          <PairSelector onSelectPair={setSelectedPair} activePair={selectedPair} />
        </div>

        {/* Center: Chart */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 border-r border-border">
              <PriceChart symbol={selectedPair} />
            </div>

            {/* Right sidebar: Order Book + Trade History */}
            <div className="hidden w-[260px] shrink-0 flex-col xl:flex 2xl:w-[300px]">
              <div className="h-1/2 border-b border-border">
                <OrderBook />
              </div>
              <div className="h-1/2">
                <TradeHistory />
              </div>
            </div>

            {/* Order Form */}
            <div className="hidden w-[280px] shrink-0 border-l border-border 2xl:block">
              <OrderForm />
            </div>
          </div>

          {/* Bottom: Open Orders */}
          <div className="h-[180px] shrink-0 border-t border-border">
            <OpenOrders />
          </div>
        </div>
      </div>

      {/* Mobile layout */}
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
        {mobileTab === "trades" && (
          <div className="flex-1 overflow-hidden">
            <TradeHistory />
          </div>
        )}
        {mobileTab === "order" && (
          <div className="flex-1 overflow-auto p-3">
            <OrderForm />
          </div>
        )}
      </div>

      {/* Mobile Buy/Sell buttons */}
      <div className="flex gap-2 border-t border-border p-3 lg:hidden">
        <button className="flex-1 rounded-lg bg-[#0ecb81] py-3 text-sm font-semibold text-white">
          Buy {selectedPair.replace("USDT", "")}
        </button>
        <button className="flex-1 rounded-lg bg-[#f6465d] py-3 text-sm font-semibold text-white">
          Sell {selectedPair.replace("USDT", "")}
        </button>
      </div>
    </div>
  )
}
