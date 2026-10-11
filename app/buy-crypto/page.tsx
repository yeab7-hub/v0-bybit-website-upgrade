"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import {
  ArrowDown, CreditCard, Building2, Wallet, Shield, Zap, Clock,
  ChevronDown, BadgeCheck, Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"
import { MarketAsset } from "@/components/market-asset"

const defaultCryptos = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "USDT", name: "Tether" },
  { symbol: "XRP", name: "XRP" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "BNB", name: "BNB" },
  { symbol: "AVAX", name: "Avalanche" },
]

const currencies = ["USD"]

const payMethods = [
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, status: "Not connected", desc: "Payment provider integration required" },
  { id: "bank", label: "Bank Transfer", icon: Building2, status: "Not connected", desc: "Banking and settlement integration required" },
  { id: "wallet", label: "Third Party", icon: Wallet, status: "Not connected", desc: "Third-party payment integration required" },
]

const features = [
  { icon: Zap, title: "Quote Preview", desc: "An estimate is shown only when a provider quote is available. It does not submit an order." },
  { icon: Shield, title: "Provider Required", desc: "Payment security and settlement cannot be claimed until a payment provider is configured." },
  { icon: Clock, title: "Purchases Unavailable", desc: "Card, bank, and third-party payment processing are not connected yet." },
  { icon: Globe, title: "Regional Coverage", desc: "Supported countries and currencies have not been configured for purchases." },
]

export default function BuyCryptoPage() {
  const { crypto: livePrices } = useLivePrices(5000)
  const [fiatAmount, setFiatAmount] = useState("100")
  const [selectedSymbol, setSelectedSymbol] = useState("BTC")
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [cryptoOpen, setCryptoOpen] = useState(false)

  const cryptos = useMemo(() => {
    return defaultCryptos.map((c) => {
      const live = livePrices.find((p) => p.symbol === c.symbol)
      return { ...c, price: live?.price ?? 0 }
    })
  }, [livePrices])

  const selectedCrypto = cryptos.find((c) => c.symbol === selectedSymbol) || cryptos[0]
  const fiatNum = Number(fiatAmount) || 0
  const cryptoAmount = selectedCrypto.price > 0 && fiatNum > 0 ? fiatNum / selectedCrypto.price : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero with purchase form */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <div className="flex flex-col items-start gap-12 lg:flex-row">
              {/* Left - Text */}
              <div className="flex-1 lg:py-8">
                <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                  Buy Crypto
                </h1>
                <p className="mt-4 max-w-lg text-pretty text-lg text-muted-foreground">
                  Preview an indicative USD-to-crypto amount when a current provider quote is available. Payment processing is not connected, so purchases cannot be completed yet.
                </p>
                <div className="mt-8 flex flex-wrap gap-6">
                  {[
                    { val: "USD", label: "Estimate currency" },
                    { val: "Provider", label: "Quote source" },
                    { val: "Unavailable", label: "Payment processing" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="font-mono text-2xl font-bold text-primary">{s.val}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Purchase Form */}
              <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl lg:min-w-[420px]">
                <h2 className="mb-6 text-lg font-bold text-foreground">Buy Crypto</h2>

                {/* Spend */}
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">I want to spend</label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
                    <input
                      type="number"
                      value={fiatAmount}
                      onChange={(e) => setFiatAmount(e.target.value)}
                      className="flex-1 bg-transparent font-mono text-xl font-bold text-foreground outline-none placeholder:text-muted-foreground"
                      placeholder="0.00"
                    />
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-foreground outline-none"
                    >
                      {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Arrow */}
                <div className="my-2 flex justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Receive */}
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">I will receive</label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
                    <div className="flex-1 font-mono text-xl font-bold text-foreground">
                      {cryptoAmount > 0 ? cryptoAmount.toFixed(8) : "0.00000000"}
                    </div>
                    <div className="relative">
                      <button onClick={() => setCryptoOpen(!cryptoOpen)}
                        className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-foreground">
                  <MarketAsset symbol={selectedCrypto.symbol} size={20} />
                        {selectedCrypto.symbol}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {cryptoOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setCryptoOpen(false)} />
                          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card p-1 shadow-xl">
                            {cryptos.map((c) => (
                              <button key={c.symbol}
                                onClick={() => { setSelectedSymbol(c.symbol); setCryptoOpen(false) }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
                                <MarketAsset symbol={c.symbol} size={20} />
                                {c.symbol} <span className="ml-auto text-[10px] text-muted-foreground">{c.name}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">Payment Method</label>
                  <div className="space-y-2">
                    {payMethods.map((m) => (
                      <button key={m.id} type="button" disabled title="Payment provider is not configured"
                        className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl border border-border p-3 text-left opacity-60">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          "bg-secondary text-muted-foreground"
                        }`}>
                          <m.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{m.label}</div>
                          <div className="text-[10px] text-muted-foreground">{m.desc}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-muted-foreground">{m.status}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-4 rounded-xl bg-secondary/30 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-mono text-foreground">{selectedCrypto.price > 0 ? `1 ${selectedCrypto.symbol} = ${formatPrice(selectedCrypto.price)}` : "Quote unavailable"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Provider fee</span>
                    <span className="font-mono text-muted-foreground">Not configured</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-border pt-2">
                    <span className="font-medium text-foreground">Indicative estimate</span>
                    <span className="font-mono font-bold text-success">{cryptoAmount.toFixed(8)} {selectedCrypto.symbol}</span>
                  </div>
                </div>

                <Button disabled title="Purchases are unavailable until a payment provider and settlement flow are configured" className="w-full" size="lg">
                  Purchases unavailable
                </Button>
                <p role="status" className="mt-2 text-center text-[10px] text-muted-foreground">
                  This is an estimate only. No payment or crypto purchase is submitted.
                </p>

                <p className="mt-3 text-center text-[10px] text-muted-foreground">
                  By continuing you agree to our <Link href="/terms" className="underline">Terms of Service</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-foreground">Purchase Integration Status</h2>
              <p className="mt-2 text-muted-foreground">Payment processing and settlement must be configured before purchases can be enabled.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-foreground">Requirements Before Launch</h2>
              <p className="mt-2 text-muted-foreground">Purchases will remain disabled until these services are implemented and tested.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: "01", title: "Create Account", desc: "Sign up and complete identity verification to unlock all features." },
                { step: "02", title: "Connect a Payment Provider", desc: "Configure supported currencies, fees, regional eligibility, payment verification, and settlement." },
                { step: "03", title: "Test Settlement", desc: "Verify payment reconciliation and wallet crediting before enabling purchases." },
              ].map((s) => (
                <div key={s.step} className="relative rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 font-mono text-4xl font-bold text-primary/20">{s.step}</div>
                  <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
