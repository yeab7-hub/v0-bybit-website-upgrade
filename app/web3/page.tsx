"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Wallet, Globe, Shield, Zap, ArrowRight, ExternalLink, Layers, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const dapps = [
  { name: "Uniswap", category: "DEX", chain: "Ethereum", tvl: "$4.2B", icon: "U", color: "bg-pink-500/20 text-pink-400" },
  { name: "Aave", category: "Lending", chain: "Ethereum", tvl: "$8.1B", icon: "A", color: "bg-purple-500/20 text-purple-400" },
  { name: "Jupiter", category: "DEX", chain: "Solana", tvl: "$1.8B", icon: "J", color: "bg-green-500/20 text-green-400" },
  { name: "Lido", category: "Staking", chain: "Ethereum", tvl: "$15.2B", icon: "L", color: "bg-blue-500/20 text-blue-400" },
  { name: "Raydium", category: "DEX", chain: "Solana", tvl: "$890M", icon: "R", color: "bg-cyan-500/20 text-cyan-400" },
  { name: "Compound", category: "Lending", chain: "Ethereum", tvl: "$2.4B", icon: "C", color: "bg-emerald-500/20 text-emerald-400" },
  { name: "Marinade", category: "Staking", chain: "Solana", tvl: "$1.2B", icon: "M", color: "bg-orange-500/20 text-orange-400" },
  { name: "GMX", category: "Derivatives", chain: "Arbitrum", tvl: "$520M", icon: "G", color: "bg-indigo-500/20 text-indigo-400" },
]

const chains = [
  { name: "Ethereum", tokens: 245, icon: "ETH" },
  { name: "BNB Chain", tokens: 189, icon: "BNB" },
  { name: "Solana", tokens: 156, icon: "SOL" },
  { name: "Arbitrum", tokens: 98, icon: "ARB" },
  { name: "Polygon", tokens: 124, icon: "MATIC" },
  { name: "Avalanche", tokens: 87, icon: "AVAX" },
]

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
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">Access DeFi, NFTs, and dApps across multiple blockchains. One wallet for everything.</p>
            <div className="mt-6 flex gap-3">
              <Button className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90">Connect Wallet</Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary">Create Web3 Wallet</Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-8">
          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { icon: Wallet, label: "Web3 Wallets", value: "2.4M+", color: "text-primary" },
              { icon: Layers, label: "Supported Chains", value: "12", color: "text-blue-400" },
              { icon: Globe, label: "dApps Integrated", value: "500+", color: "text-green-400" },
              { icon: Shield, label: "Assets Secured", value: "$1.2B+", color: "text-purple-400" },
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
            {chains.map((c, i) => (
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
              <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${cat === c ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{c}</button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((d, i) => (
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
              { icon: Shield, title: "Self-Custody", desc: "You control your private keys. Your assets, your rules." },
              { icon: Zap, title: "Multi-Chain Swaps", desc: "Swap tokens across chains instantly with the best rates." },
              { icon: Coins, title: "On-Chain Earn", desc: "Access DeFi yields directly from your Web3 wallet." },
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
