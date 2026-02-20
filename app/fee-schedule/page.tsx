"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"

const tabs = ["Spot", "Derivatives", "Options", "Convert"]

const spotFees = [
  { tier: "Regular", volume: "< $1M", maker: "0.10%", taker: "0.10%" },
  { tier: "VIP 1", volume: "$1M - $5M", maker: "0.06%", taker: "0.08%" },
  { tier: "VIP 2", volume: "$5M - $10M", maker: "0.04%", taker: "0.06%" },
  { tier: "VIP 3", volume: "$10M - $25M", maker: "0.02%", taker: "0.05%" },
  { tier: "VIP 4", volume: "$25M - $50M", maker: "0.02%", taker: "0.04%" },
  { tier: "VIP 5", volume: "$50M - $100M", maker: "0.01%", taker: "0.03%" },
  { tier: "VVIP", volume: "> $100M", maker: "0.00%", taker: "0.02%" },
]

const derivFees = [
  { tier: "Regular", volume: "< $10M", maker: "0.02%", taker: "0.06%" },
  { tier: "VIP 1", volume: "$10M - $25M", maker: "0.016%", taker: "0.05%" },
  { tier: "VIP 2", volume: "$25M - $50M", maker: "0.014%", taker: "0.04%" },
  { tier: "VIP 3", volume: "$50M - $100M", maker: "0.012%", taker: "0.035%" },
  { tier: "VIP 4", volume: "$100M - $250M", maker: "0.01%", taker: "0.03%" },
  { tier: "VIP 5", volume: "$250M - $500M", maker: "0.008%", taker: "0.025%" },
  { tier: "VVIP", volume: "> $500M", maker: "0.005%", taker: "0.02%" },
]

const optionFees = [
  { tier: "Regular", volume: "< $5M", maker: "0.02%", taker: "0.03%" },
  { tier: "VIP 1", volume: "$5M - $10M", maker: "0.015%", taker: "0.025%" },
  { tier: "VIP 2", volume: "$10M - $25M", maker: "0.012%", taker: "0.02%" },
  { tier: "VIP 3+", volume: "> $25M", maker: "0.01%", taker: "0.015%" },
]

const convertFees = [
  { pair: "BTC/USDT", spread: "0.05%", minAmount: "0.001 BTC" },
  { pair: "ETH/USDT", spread: "0.05%", minAmount: "0.01 ETH" },
  { pair: "SOL/USDT", spread: "0.10%", minAmount: "0.1 SOL" },
  { pair: "Other Pairs", spread: "0.10 - 0.50%", minAmount: "Varies" },
]

function FeeTable({ data, type }: { data: any[]; type: string }) {
  if (type === "Convert") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead><tr className="border-b border-border text-muted-foreground">
            <th className="py-3 pr-4 font-medium">Pair</th>
            <th className="py-3 pr-4 font-medium">Spread</th>
            <th className="py-3 font-medium">Min Amount</th>
          </tr></thead>
          <tbody>{data.map((r: any) => (
            <tr key={r.pair} className="border-b border-border/50">
              <td className="py-3 pr-4 font-medium text-foreground">{r.pair}</td>
              <td className="py-3 pr-4 text-secondary-foreground">{r.spread}</td>
              <td className="py-3 text-secondary-foreground">{r.minAmount}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead><tr className="border-b border-border text-muted-foreground">
          <th className="py-3 pr-4 font-medium">Tier</th>
          <th className="py-3 pr-4 font-medium">30d Volume</th>
          <th className="py-3 pr-4 font-medium">Maker</th>
          <th className="py-3 font-medium">Taker</th>
        </tr></thead>
        <tbody>{data.map((r: any) => (
          <tr key={r.tier} className="border-b border-border/50">
            <td className="py-3 pr-4 font-semibold text-foreground">{r.tier}</td>
            <td className="py-3 pr-4 text-secondary-foreground">{r.volume}</td>
            <td className="py-3 pr-4 text-green-400">{r.maker}</td>
            <td className="py-3 text-secondary-foreground">{r.taker}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

export default function FeeSchedulePage() {
  const [tab, setTab] = useState("Spot")
  const feeData: Record<string, any[]> = { Spot: spotFees, Derivatives: derivFees, Options: optionFees, Convert: convertFees }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-14">
            <h1 className="text-2xl font-bold lg:text-3xl">Fee Schedule</h1>
            <p className="mt-2 text-xs text-muted-foreground">Transparent, competitive fees. Higher volume means lower fees.</p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-8 lg:py-12">
          {/* Tabs */}
          <div className="mb-8 flex items-center gap-1 rounded-lg bg-secondary p-1">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-md px-4 py-2 text-xs font-medium transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <FeeTable data={feeData[tab]} type={tab} />
          </div>

          {/* Notes */}
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h3 className="mb-3 text-sm font-semibold">Fee Notes</h3>
            <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
              <li>- VIP tier is determined by your trailing 30-day trading volume across all markets.</li>
              <li>- Maker orders add liquidity to the order book. Taker orders remove liquidity.</li>
              <li>- BYB token holders receive an additional 20% fee discount.</li>
              <li>- Withdrawal fees vary by network and are updated dynamically based on network conditions.</li>
              <li>- Deposit fees are zero for all assets and networks.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
