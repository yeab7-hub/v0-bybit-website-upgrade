"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { PriceChart } from "@/components/trading/price-chart"
import { OrderBook } from "@/components/trading/order-book"
import { OrderForm } from "@/components/trading/order-form"
import { TradeHistory } from "@/components/trading/trade-history"
import { OpenOrders } from "@/components/trading/open-orders"
import { PairSelector } from "@/components/trading/pair-selector"

export default function TradePage() {
  const [selectedPair, setSelectedPair] = useState("BTCUSDT")

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      {/* Main trading layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Pair Selector */}
        <div className="hidden w-[240px] shrink-0 border-r border-border lg:block">
          <PairSelector onSelectPair={setSelectedPair} activePair={selectedPair} />
        </div>

        {/* Center: Chart + Bottom panels */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top section: Chart + Order Book + Order Form */}
          <div className="flex flex-1 overflow-hidden">
            {/* Chart */}
            <div className="flex-1 border-r border-border">
              <PriceChart symbol={selectedPair} />
            </div>

            {/* Right sidebar: Order Book + Trade History */}
            <div className="hidden w-[280px] shrink-0 flex-col md:flex lg:w-[300px]">
              <div className="h-1/2 border-b border-border">
                <OrderBook />
              </div>
              <div className="h-1/2">
                <TradeHistory />
              </div>
            </div>

            {/* Order Form */}
            <div className="hidden w-[280px] shrink-0 border-l border-border xl:block">
              <OrderForm />
            </div>
          </div>

          {/* Bottom: Open Orders */}
          <div className="h-[200px] shrink-0 border-t border-border">
            <OpenOrders />
          </div>
        </div>
      </div>

      {/* Trademark bar */}
      <div className="flex h-6 shrink-0 items-center justify-center border-t border-border bg-card">
        <p className="text-[10px] text-muted-foreground">
          {'Bybit\u2122 2026. All rights reserved.'}
        </p>
      </div>

      {/* Mobile Trade Buttons */}
      <div className="fixed bottom-4 left-4 right-4 flex gap-2 xl:hidden">
        <button className="flex-1 rounded-lg bg-[#0ecb81] py-3 text-sm font-semibold text-white">
          Buy
        </button>
        <button className="flex-1 rounded-lg bg-[#f6465d] py-3 text-sm font-semibold text-white">
          Sell
        </button>
      </div>
    </div>
  )
}
