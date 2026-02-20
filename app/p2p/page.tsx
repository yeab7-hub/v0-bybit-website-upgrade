"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Search, ChevronDown, Shield, Clock, Star, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const paymentMethods = ["All", "Bank Transfer", "PayPal", "Wise", "Zelle", "Revolut", "Cash App"]
const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "NGN", "INR"]

const merchants = [
  { name: "CryptoKing_88", orders: 1847, completion: 99.2, rating: 4.9, price: 65120, minMax: "100 - 10,000", methods: ["Bank Transfer", "Zelle"], available: "2.4521 BTC", online: true, verified: true },
  { name: "TradeMax_Pro", orders: 3291, completion: 98.8, rating: 4.8, price: 65050, minMax: "500 - 50,000", methods: ["Bank Transfer", "Wise"], available: "5.1200 BTC", online: true, verified: true },
  { name: "BitTrader_VN", orders: 892, completion: 97.5, rating: 4.7, price: 65200, minMax: "50 - 5,000", methods: ["PayPal", "Revolut"], available: "0.8500 BTC", online: false, verified: true },
  { name: "P2P_Master", orders: 5120, completion: 99.5, rating: 5.0, price: 64980, minMax: "1,000 - 100,000", methods: ["Bank Transfer"], available: "12.000 BTC", online: true, verified: true },
  { name: "FastCrypto_EU", orders: 1203, completion: 98.1, rating: 4.6, price: 65180, minMax: "200 - 20,000", methods: ["Wise", "Revolut"], available: "1.5000 BTC", online: true, verified: false },
  { name: "Whale_OTC", orders: 7540, completion: 99.8, rating: 5.0, price: 64900, minMax: "5,000 - 500,000", methods: ["Bank Transfer", "Wise"], available: "45.000 BTC", online: true, verified: true },
]

export default function P2PPage() {
  const [tab, setTab] = useState<"buy" | "sell">("buy")
  const [crypto, setCrypto] = useState("BTC")
  const [fiat, setFiat] = useState("USD")
  const [payment, setPayment] = useState("All")
  const [amount, setAmount] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero banner */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1400px] px-4 py-6">
            <h1 className="text-xl font-bold text-foreground lg:text-2xl">P2P Trading</h1>
            <p className="mt-1 text-sm text-muted-foreground">Buy and sell crypto directly with other users. Zero trading fees.</p>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-6">
          {/* Buy/Sell + Crypto tabs */}
          <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4">
            <div className="flex rounded-lg bg-secondary p-0.5">
              <button onClick={() => setTab("buy")} className={`rounded-md px-6 py-2 text-sm font-semibold transition-colors ${tab === "buy" ? "bg-[#0ecb81] text-white" : "text-muted-foreground hover:text-foreground"}`}>Buy</button>
              <button onClick={() => setTab("sell")} className={`rounded-md px-6 py-2 text-sm font-semibold transition-colors ${tab === "sell" ? "bg-[#f6465d] text-white" : "text-muted-foreground hover:text-foreground"}`}>Sell</button>
            </div>
            <div className="flex gap-1">
              {["BTC", "ETH", "USDT", "USDC", "SOL"].map(c => (
                <button key={c} onClick={() => setCrypto(c)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${crypto === c ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 py-4">
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <span className="text-xs text-muted-foreground">Amount</span>
              <input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-24 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">{fiat}</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2">
              <span className="text-xs text-muted-foreground">Fiat</span>
              <select value={fiat} onChange={(e) => setFiat(e.target.value)} className="bg-transparent text-sm font-medium text-foreground outline-none">
                {currencies.map(c => <option key={c} value={c} className="bg-card">{c}</option>)}
              </select>
            </div>
            <div className="hidden flex-wrap gap-1 lg:flex">
              {paymentMethods.map(m => (
                <button key={m} onClick={() => setPayment(m)} className={`rounded-md px-3 py-1.5 text-xs transition-colors ${payment === m ? "bg-primary/10 text-primary font-medium" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{m}</button>
              ))}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground hover:text-foreground lg:hidden">
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="mb-4 flex flex-wrap gap-1 lg:hidden">
              {paymentMethods.map(m => (
                <button key={m} onClick={() => setPayment(m)} className={`rounded-md px-3 py-1.5 text-xs transition-colors ${payment === m ? "bg-primary/10 text-primary font-medium" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{m}</button>
              ))}
            </div>
          )}

          {/* Table header */}
          <div className="hidden border-b border-border pb-2 lg:grid lg:grid-cols-[2fr_1fr_1fr_1.5fr_1fr_1fr]">
            {["Advertiser", "Price", "Available / Limit", "Payment", "Trade"].map(h => (
              <div key={h} className="text-xs font-medium text-muted-foreground">{h}</div>
            ))}
          </div>

          {/* Merchant rows */}
          {merchants.map((m, i) => (
            <div key={i} className="grid items-center gap-4 border-b border-border py-4 lg:grid-cols-[2fr_1fr_1fr_1.5fr_1fr_1fr]">
              {/* Advertiser */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">{m.name.charAt(0)}</div>
                  {m.online && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-[#0ecb81]" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground">{m.name}</span>
                    {m.verified && <Shield className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{m.orders} orders</span>
                    <span>{m.completion}% completion</span>
                    <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 fill-primary text-primary" />{m.rating}</span>
                  </div>
                </div>
              </div>
              {/* Price */}
              <div className="text-sm font-semibold text-foreground">{m.price.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{fiat}</span></div>
              {/* Available */}
              <div>
                <div className="text-xs text-muted-foreground">Available: <span className="text-foreground">{m.available}</span></div>
                <div className="text-xs text-muted-foreground">Limit: <span className="text-foreground">{m.minMax} {fiat}</span></div>
              </div>
              {/* Payment */}
              <div className="flex flex-wrap gap-1">
                {m.methods.map(p => (
                  <span key={p} className="rounded bg-secondary px-2 py-0.5 text-[10px] text-foreground">{p}</span>
                ))}
              </div>
              {/* Trade button */}
              <div>
                <Button size="sm" className={`w-full text-xs font-semibold ${tab === "buy" ? "bg-[#0ecb81] hover:bg-[#0ecb81]/90" : "bg-[#f6465d] hover:bg-[#f6465d]/90"} text-white`}>
                  {tab === "buy" ? "Buy" : "Sell"} {crypto}
                </Button>
              </div>
            </div>
          ))}

          {/* Info */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { title: "Secure Escrow", desc: "Crypto is held in escrow during the trade to protect both parties." },
              { title: "Zero Fees", desc: "No trading fees for P2P transactions. Only pay the advertised price." },
              { title: "24/7 Support", desc: "Customer support available around the clock for dispute resolution." },
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
