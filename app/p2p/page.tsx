"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Shield } from "lucide-react"
import Link from "next/link"

const paymentMethods = ["All", "Bank Transfer", "PayPal", "Wise", "Zelle", "Revolut", "Cash App"]
const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "NGN", "INR"]

const merchants: { name: string; orders: number; completion: number; rating: number; price: number; minMax: string; methods: string[]; available: string; online: boolean; verified: boolean }[] = []

export default function P2PPage() {
  const [tab, setTab] = useState<"buy" | "sell">("buy")
  const crypto = "BTC"
  const fiat = "USD"
  const payment = "All"
  const amount = ""

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero banner */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1400px] px-4 py-6">
            <h1 className="text-xl font-bold text-foreground lg:text-2xl">P2P Trading</h1>
            <p className="mt-1 text-sm text-muted-foreground">Marketplace preview. Live merchant offers, escrow, and order execution are not connected yet.</p>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-6">
          {/* Buy/Sell + Crypto tabs */}
          <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4">
            <div className="flex rounded-lg bg-secondary p-0.5">
              <button disabled title="P2P trading is unavailable until escrow and payment services are connected" className={`rounded-md px-6 py-2 text-sm font-semibold transition-colors ${tab === "buy" ? "bg-[#0ecb81] text-white" : "text-muted-foreground hover:text-foreground"}`}>Buy</button>
              <button disabled title="P2P trading is unavailable until escrow and payment services are connected" className={`rounded-md px-6 py-2 text-sm font-semibold transition-colors ${tab === "sell" ? "bg-[#f6465d] text-white" : "text-muted-foreground hover:text-foreground"}`}>Sell</button>
            </div>
            <div className="flex gap-1">
              {["BTC", "ETH", "USDT", "USDC", "SOL"].map(c => (
                <button key={c} disabled title="P2P trading is unavailable until escrow and payment services are connected" className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${crypto === c ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 py-4">
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <span className="text-xs text-muted-foreground">Amount</span>
              <input type="number" placeholder="P2P service unavailable" value={amount} disabled className="w-24 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">{fiat}</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2">
              <span className="text-xs text-muted-foreground">Fiat</span>
              <select value={fiat} disabled title="P2P trading is unavailable until escrow and payment services are connected" className="bg-transparent text-sm font-medium text-foreground outline-none">
                {currencies.map(c => <option key={c} value={c} className="bg-card">{c}</option>)}
              </select>
            </div>
            <div className="hidden flex-wrap gap-1 lg:flex">
              {paymentMethods.map(m => (
                <button key={m} disabled title="P2P trading is unavailable until escrow and payment services are connected" className={`rounded-md px-3 py-1.5 text-xs transition-colors ${payment === m ? "bg-primary/10 text-primary font-medium" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{m}</button>
              ))}
            </div>

          </div>

          {/* Live offer state */}
          {merchants.length === 0 ? (
            <div role="status" className="my-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-center sm:p-10">
              <Shield className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">No live P2P offers available</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                This project does not yet have a connected P2P merchant, escrow, or payment-verification service. No real offer is shown here and trades cannot be placed from this page.
              </p>
              <Link href="/support" className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-secondary">Contact support</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {merchants.map((merchant) => (
                <div key={merchant.name} className="rounded-lg border border-border p-4">
                  <p className="font-semibold text-foreground">{merchant.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{merchant.price.toLocaleString()} · {merchant.methods.join(", ")}</p>
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { title: "Merchant verification", desc: "Merchant verification will be enabled after a live marketplace integration is configured." },
              { title: "Escrow protection", desc: "Escrow is not enabled yet. Do not send payments based on this preview." },
              { title: "Dispute handling", desc: "Live P2P dispute workflows still need to be connected." },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
