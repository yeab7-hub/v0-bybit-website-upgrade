"use client"

import { Header } from "@/components/header"
import { PriceChart } from "@/components/trading/price-chart"
import { OrderBook } from "@/components/trading/order-book"
import { OrderForm } from "@/components/trading/order-form"
import { TradeHistory } from "@/components/trading/trade-history"
import { OpenOrders } from "@/components/trading/open-orders"
import { PairSelector } from "@/components/trading/pair-selector"

export default function TradePage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      {/* Main trading layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Pair Selector */}
        <div className="hidden w-[240px] shrink-0 border-r border-border lg:block">
          <PairSelector />
        </div>

        {/* Center: Chart + Bottom panels */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top section: Chart + Order Book + Order Form */}
          <div className="flex flex-1 overflow-hidden">
            {/* Chart */}
            <div className="flex-1 border-r border-border">
              <PriceChart />
            </div>

            {/* Right sidebar: Order Book + Order Form */}
            <div className="hidden w-[280px] shrink-0 flex-col md:flex lg:w-[300px]">
              {/* Order Book */}
              <div className="h-1/2 border-b border-border">
                <OrderBook />
              </div>
              {/* Trade History */}
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
          Tryd&trade; 2026. All rights reserved.
        </p>
      </div>

      {/* Mobile Order Form Floating Button */}
      <div className="fixed bottom-4 left-4 right-4 flex gap-2 xl:hidden">
        <MobileTradeButton side="buy" />
        <MobileTradeButton side="sell" />
      </div>
    </div>
  )
}

function MobileTradeButton({ side }: { side: "buy" | "sell" }) {
  const isBuy = side === "buy"
  return (
    <button
      className={`flex-1 rounded-lg py-3 text-sm font-semibold xl:hidden ${
        isBuy
          ? "bg-success text-success-foreground"
          : "bg-destructive text-destructive-foreground"
      }`}
    >
      {isBuy ? "Buy" : "Sell"}
    </button>
  )
}
