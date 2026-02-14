"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import {
  ArrowDown, CreditCard, Building2, Wallet, Shield, Zap, Clock,
  ChevronDown, BadgeCheck, Globe, ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices"

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

const currencies = ["USD", "EUR", "GBP", "AED", "INR", "TRY"]

const payMethods = [
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, fee: "1.8%", time: "Instant", desc: "Visa, Mastercard accepted" },
  { id: "bank", label: "Bank Transfer", icon: Building2, fee: "0.5%", time: "1-3 days", desc: "SWIFT, SEPA, Wire" },
  { id: "wallet", label: "Third Party", icon: Wallet, fee: "1.2%", time: "Instant", desc: "Apple Pay, Google Pay" },
]

const features = [
  { icon: Zap, title: "Instant Purchase", desc: "Buy crypto in seconds with your preferred payment method. No complicated steps." },
  { icon: Shield, title: "Secure Payments", desc: "All transactions are encrypted and processed through PCI-compliant payment gateways." },
  { icon: Clock, title: "24/7 Available", desc: "Purchase crypto anytime, anywhere. Our service is available around the clock." },
  { icon: Globe, title: "170+ Countries", desc: "Available in over 170 countries with local currency and payment method support." },
]

export default function BuyCryptoPage() {
  const { crypto: livePrices } = useLivePrices(5000)
  const [fiatAmount, setFiatAmount] = useState("100")
  const [selectedSymbol, setSelectedSymbol] = useState("BTC")
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [selectedMethod, setSelectedMethod] = useState("card")
  const [cryptoOpen, setCryptoOpen] = useState(false)

  const cryptos = useMemo(() => {
    return defaultCryptos.map((c) => {
      const live = livePrices.find((p) => p.symbol === c.symbol)
      return { ...c, price: c.symbol === "USDT" ? 1 : (live?.price ?? 0) }
    })
  }, [livePrices])

  const selectedCrypto = cryptos.find((c) => c.symbol === selectedSymbol) || cryptos[0]
  const fee = selectedMethod === "card" ? 0.018 : selectedMethod === "bank" ? 0.005 : 0.012
  const fiatNum = Number(fiatAmount) || 0
  const feeAmount = fiatNum * fee
  const cryptoAmount = selectedCrypto.price > 0 ? (fiatNum - feeAmount) / selectedCrypto.price : 0

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
                  Buy Crypto Instantly
                </h1>
                <p className="mt-4 max-w-lg text-pretty text-lg text-muted-foreground">
                  Purchase Bitcoin, Ethereum, and 200+ cryptocurrencies using your credit card,
                  bank transfer, or third-party payment methods.
                </p>
                <div className="mt-8 flex flex-wrap gap-6">
                  {[
                    { val: "200+", label: "Supported Coins" },
                    { val: "170+", label: "Countries" },
                    { val: "$0", label: "Hidden Fees" },
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
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary">
                          {selectedCrypto.symbol.charAt(0)}
                        </span>
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
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-foreground">{c.symbol.charAt(0)}</span>
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
                      <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                          selectedMethod === m.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          selectedMethod === m.id ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                        }`}>
                          <m.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{m.label}</div>
                          <div className="text-[10px] text-muted-foreground">{m.desc}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-foreground">Fee: {m.fee}</div>
                          <div className="text-[10px] text-muted-foreground">{m.time}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-4 rounded-xl bg-secondary/30 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-mono text-foreground">1 {selectedCrypto.symbol} = ${formatPrice(selectedCrypto.price)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-mono text-foreground">${feeAmount.toFixed(2)} ({(fee * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-border pt-2">
                    <span className="font-medium text-foreground">You receive</span>
                    <span className="font-mono font-bold text-success">{cryptoAmount.toFixed(8)} {selectedCrypto.symbol}</span>
                  </div>
                </div>

                <Link href="/register">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                    Buy {selectedCrypto.symbol} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

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
              <h2 className="text-3xl font-bold text-foreground">Why Buy Crypto on Bybit</h2>
              <p className="mt-2 text-muted-foreground">The fastest and most secure way to buy digital assets</p>
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
              <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
              <p className="mt-2 text-muted-foreground">Get started in 3 simple steps</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: "01", title: "Create Account", desc: "Sign up and complete identity verification to unlock all features." },
                { step: "02", title: "Select Payment", desc: "Choose your preferred payment method and enter the amount you want to spend." },
                { step: "03", title: "Receive Crypto", desc: "Your purchased crypto is instantly deposited into your Bybit wallet." },
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
