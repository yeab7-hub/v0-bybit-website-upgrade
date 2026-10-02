"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import useSWR from "swr"
import { Loader2 } from "lucide-react"

const tabs = ["Spot", "Derivatives", "Options", "Convert"]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

interface ApiTier { name: string; minVolume: number; maker: number; taker: number }
interface FeesResponse {
  tiers: ApiTier[]
  volume30d: number
  currentTier: string
  nextTier: { name: string; volumeNeeded: number } | null
}

/** Real fee table -- these are the ACTUAL rates applied to every Spot and
 * Futures trade, based on the user's real trailing 30-day trading volume. */
function RealFeeTable() {
  const { data, isLoading } = useSWR<FeesResponse>("/api/fees", fetcher, { refreshInterval: 30000 })

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 rounded-lg bg-secondary/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Your 30-Day Volume</p>
            <p className="text-lg font-bold text-foreground">${data.volume30d.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Tier</p>
            <p className="text-lg font-bold text-primary">{data.currentTier}</p>
          </div>
        </div>
        {data.nextTier && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Trade ${data.nextTier.volumeNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })} more in the next 30 days to reach {data.nextTier.name}.
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-3 pr-4 font-medium">Tier</th>
              <th className="py-3 pr-4 font-medium">30d Volume</th>
              <th className="py-3 pr-4 font-medium">Maker</th>
              <th className="py-3 font-medium">Taker</th>
            </tr>
          </thead>
          <tbody>
            {data.tiers.map((t, i) => {
              const next = data.tiers[i + 1]
              const range = next ? `${formatVolume(t.minVolume)} - ${formatVolume(next.minVolume)}` : `> ${formatVolume(t.minVolume)}`
              const isCurrent = t.name === data.currentTier
              return (
                <tr key={t.name} className={`border-b border-border/50 ${isCurrent ? "bg-primary/5" : ""}`}>
                  <td className="py-3 pr-4 font-semibold text-foreground">
                    {t.name} {isCurrent && <span className="ml-1 rounded bg-primary/20 px-1.5 py-0.5 text-[9px] text-primary">YOU</span>}
                  </td>
                  <td className="py-3 pr-4 text-secondary-foreground">{t.minVolume === 0 ? `< ${formatVolume(next?.minVolume ?? 0)}` : range}</td>
                  <td className="py-3 pr-4 text-green-400">{(t.maker * 100).toFixed(2)}%</td>
                  <td className="py-3 text-secondary-foreground">{(t.taker * 100).toFixed(2)}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OptionsPlaceholder() {
  return (
    <div className="py-10 text-center text-sm text-muted-foreground">
      Options trading isn't available on this platform yet.
    </div>
  )
}

function ConvertFeeInfo() {
  return (
    <div className="py-6 text-center">
      <p className="text-2xl font-bold text-green-400">0%</p>
      <p className="mt-1 text-xs text-muted-foreground">Convert is zero-fee on every pair. The only cost is the live market rate at the moment you convert.</p>
    </div>
  )
}

export default function FeeSchedulePage() {
  const [tab, setTab] = useState("Spot")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-14">
            <h1 className="text-2xl font-bold lg:text-3xl">Fee Schedule</h1>
            <p className="mt-2 text-xs text-muted-foreground">Real rates, based on your actual trailing 30-day trading volume.</p>
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
            {(tab === "Spot" || tab === "Derivatives") && <RealFeeTable />}
            {tab === "Options" && <OptionsPlaceholder />}
            {tab === "Convert" && <ConvertFeeInfo />}
          </div>

          {/* Notes */}
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h3 className="mb-3 text-sm font-semibold">Fee Notes</h3>
            <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
              <li>- Your tier is calculated live from your actual trailing 30-day trading volume across Spot and Futures combined.</li>
              <li>- Spot and Futures (Derivatives) share the same real tier table and rates.</li>
              <li>- Every order on this platform settles against the live market price, so in practice the rate charged behaves as a taker fee.</li>
              <li>- Deposit fees are zero for all assets and networks.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
