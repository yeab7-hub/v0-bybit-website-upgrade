"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Wallet, Globe, Shield, Zap, ArrowRight, ExternalLink, Layers, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const dapps: { name: string; category: string; chain: string; tvl: string; icon: string; color: string }[] = []
const chains: { name: string; tokens: number; icon: string }[] = []

const categories = ["All", "DEX", "Lending", "Staking", "Derivatives", "NFT", "GameFi"]

export default function Web3Page() {
  const [cat, setCat] = useState("All")
  const filtered = cat === "All" ? dapps : dapps.filter(d => d.category === cat)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="mx-auto max-w-[1400px] px-4 py-10 lg:py-16">
            <div className="flex items-center gap-2 text-primary"><Globe className="h-5 w-5" /><span className="text-xs font-semibold uppercase tracking-wider">Web3</span></div>
            <h1 className="mt-2 text-2xl font-bold text-foreground lg:text-4xl">Your Gateway to Web3</h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">Wallet connection, dApp access, and on-chain transactions are not integrated in this app yet.</p>
            <div className="mt-6 flex gap-3">
              <Button disabled title="Wallet connectivity is not integrated" className="bg-primary font-semibold text-primary-foreground opacity-60">Wallet connection unavailable</Button>
              <Button disabled title="Wallet creation and key management are not integrated" variant="outline" className="border-border text-foreground opacity-60">Wallet creation unavailable</Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-8">
          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { icon: Wallet, label: "Wallet integration", value: "Not configured", color: "text-primary" },
              { icon: Layers, label: "Network support", value: "Not configured", color: "text-blue-400" },
              { icon: Globe, label: "dApp directory", value: "Not connected", color: "text-green-400" },
              { icon: Shield, label: "Custody status", value: "Not verified", color: "text-purple-400" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <div className="mt-2 text-lg font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Supported Chains */}
          <h2 className="mb-4 text-lg font-bold text-foreground">Supported Chains</h2>
          <div className="mb-8 grid grid-cols-3 gap-3 lg:grid-cols-6">
            {chains.length === 0 ? (
              <p className="col-span-full rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No blockchain networks are configured for wallet transactions.</p>
            ) : chains.map((c, i) => (
              <div key={i} className="flex flex-col items-center rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">{c.icon}</div>
                <div className="mt-2 text-xs font-semibold text-foreground">{c.name}</div>
                <div className="text-[10px] text-muted-foreground">{c.tokens} tokens</div>
              </div>
            ))}
          </div>

          {/* DApps */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Popular dApps</h2>
          </div>
          <div className="mb-4 flex gap-1 overflow-x-auto pb-2">
            {categories.map(c => (
              <button disabled title="dApp listings are not connected" key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${cat === c ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{c}</button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.length === 0 ? (
              <p className="col-span-full rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">The dApp directory is unavailable until verified listings and live data are connected.</p>
            ) : filtered.map((d, i) => (
              <div key={i} className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${d.color} text-sm font-bold`}>{d.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5"><span className="text-sm font-semibold text-foreground">{d.name}</span><ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                    <div className="text-[10px] text-muted-foreground">{d.category} &middot; {d.chain}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                  <span className="text-[10px] text-muted-foreground">TVL</span>
                  <span className="text-xs font-semibold text-foreground">{d.tvl}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              { icon: Shield, title: "Self-Custody", desc: "This page does not create or manage private keys; self-custody is not available here." },
              { icon: Zap, title: "Multi-Chain Swaps", desc: "Cross-chain swaps and quote routing are not integrated." },
              { icon: Coins, title: "On-Chain Earn", desc: "On-chain yield products and transaction signing are not integrated." },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><f.icon className="h-5 w-5 text-primary" /></div>
                <h3 className="mt-3 text-sm font-bold text-foreground">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
