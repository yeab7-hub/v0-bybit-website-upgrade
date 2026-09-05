"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowDownUp, ChevronDown, Info, History, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLivePrices, formatPrice, safeFindPrice } from "@/hooks/use-live-prices"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const coinMeta: Record<string, { name: string; icon: string }> = {
  BTC: { name: "Bitcoin", icon: "https://cdn.jsdelivr.net/gh/nicehash/cryptocurrency-icons/SVG/btc.svg" },
  ETH: { name: "Ethereum", icon: "https://cdn.jsdelivr.net/gh/nicehash/cryptocurrency-icons/SVG/eth.svg" },
  USDT: { name: "Tether", icon: "https://cdn.jsdelivr.net/gh/nicehash/cryptocurrency-icons/SVG/usdt.svg" },
  USDC: { name: "USD Coin", icon: "https://cdn.jsdelivr.net/gh/nicehash/cryptocurrency-icons/SVG/usdc.svg" },
  SOL: { name: "Solana", icon: "https://cdn.jsdelivr.net/gh/nicehash/cryptocurrency-icons/SVG/sol.svg" },
  XRP: { name: "Ripple", icon: "https://cdn.jsdelivr.net/gh/nicehash/cryptocurrency-icons/SVG/xrp.svg" },
}
const coinList = Object.keys(coinMeta)

export default function ConvertPage() {
  const { crypto, forex, commodities, stocks, cfd } = useLivePrices(5000)
  const allLivePrices = [...crypto, ...forex, ...commodities, ...stocks, ...cfd]

  const { data: balanceData, mutate: mutateBalances } = useSWR("/api/trading/balances", fetcher)
  const balances: { asset: string; available: number }[] = balanceData ?? []
  const getBalance = (symbol: string) => balances.find((b) => b.asset === symbol)?.available ?? 0

  const { data: historyData, mutate: mutateHistory } = useSWR("/api/convert", fetcher)
  const recentConversions = historyData?.conversions ?? []

  const [fromSymbol, setFromSymbol] = useState("BTC")
  const [toSymbol, setToSymbol] = useState("USDT")
  const [amount, setAmount] = useState("")
  const [showFromList, setShowFromList] = useState(false)
  const [showToList, setShowToList] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const swap = () => {
    const temp = fromSymbol
    setFromSymbol(toSymbol)
    setToSymbol(temp)
    setError(null)
    setSuccess(null)
  }

  const getUsdPrice = (symbol: string): number => {
    if (symbol === "USDT" || symbol === "USDC") return 1
    const live = safeFindPrice(allLivePrices, symbol)
    if (live) return live.price
    const fallbacks: Record<string, number> = { BTC: 97842.50, ETH: 3456.78, SOL: 189.45, XRP: 2.87 }
    return fallbacks[symbol] ?? 1
  }

  const fromUsd = getUsdPrice(fromSymbol)
  const toUsd = getUsdPrice(toSymbol)
  const rate = toUsd > 0 ? fromUsd / toUsd : 1
  const estimated = amount ? (parseFloat(amount) * rate).toFixed(toUsd >= 100 ? 4 : toUsd >= 1 ? 6 : 8) : "0.00"
  const availableFrom = getBalance(fromSymbol)

  const canConvert = useMemo(() => {
    const amt = parseFloat(amount)
    return !!amount && amt > 0 && amt <= availableFrom && !submitting
  }, [amount, availableFrom, submitting])

  const setPct = (pct: number) => {
    setAmount((availableFrom * pct).toFixed(8).replace(/\.?0+$/, ""))
  }

  const handleConvert = async () => {
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_asset: fromSymbol, to_asset: toSymbol, amount: parseFloat(amount) }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || "Conversion failed")
      } else {
        setSuccess(`Converted ${amount} ${fromSymbol} to ${data.to_amount.toFixed(6)} ${toSymbol}`)
        setAmount("")
        mutateBalances()
        mutateHistory()
      }
    } catch {
      setError("Network error, please try again")
    }
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[480px] px-4 py-8 lg:py-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Convert</h1>
              <p className="text-xs text-muted-foreground">Zero fees. Instant conversion.</p>
            </div>
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">
              <History className="h-3.5 w-3.5" /> History
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            {/* From */}
            <div className="rounded-lg bg-secondary p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">From</span>
                <span className="text-xs text-muted-foreground">Available: {availableFrom.toFixed(8)} {fromSymbol}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button onClick={() => { setShowFromList(!showFromList); setShowToList(false) }} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-background/50">
                    <img src={coinMeta[fromSymbol].icon} alt={fromSymbol} className="h-6 w-6" crossOrigin="anonymous" />
                    <span className="text-sm font-semibold text-foreground">{fromSymbol}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {showFromList && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-xl">
                      {coinList.filter((c) => c !== toSymbol).map((c) => (
                        <button key={c} onClick={() => { setFromSymbol(c); setShowFromList(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary">
                          <img src={coinMeta[c].icon} alt={c} className="h-5 w-5" crossOrigin="anonymous" />
                          <span className="font-medium text-foreground">{c}</span>
                          <span className="text-xs text-muted-foreground">{coinMeta[c].name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(null); setSuccess(null) }}
                  className="w-full bg-transparent text-right text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="mt-1 flex justify-end gap-2">
                {[{ label: "25%", pct: 0.25 }, { label: "50%", pct: 0.5 }, { label: "75%", pct: 0.75 }, { label: "Max", pct: 1 }].map((p) => (
                  <button key={p.label} onClick={() => setPct(p.pct)} className="rounded px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10">{p.label}</button>
                ))}
              </div>
            </div>

            {/* Swap */}
            <div className="flex justify-center -my-2 relative z-10">
              <button onClick={swap} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground hover:text-primary transition-colors">
                <ArrowDownUp className="h-4 w-4" />
              </button>
            </div>

            {/* To */}
            <div className="rounded-lg bg-secondary p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">To</span>
                <span className="text-xs text-muted-foreground">Balance: {getBalance(toSymbol).toFixed(8)} {toSymbol}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button onClick={() => { setShowToList(!showToList); setShowFromList(false) }} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-background/50">
                    <img src={coinMeta[toSymbol].icon} alt={toSymbol} className="h-6 w-6" crossOrigin="anonymous" />
                    <span className="text-sm font-semibold text-foreground">{toSymbol}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {showToList && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-xl">
                      {coinList.filter((c) => c !== fromSymbol).map((c) => (
                        <button key={c} onClick={() => { setToSymbol(c); setShowToList(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary">
                          <img src={coinMeta[c].icon} alt={c} className="h-5 w-5" crossOrigin="anonymous" />
                          <span className="font-medium text-foreground">{c}</span>
                          <span className="text-xs text-muted-foreground">{coinMeta[c].name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="w-full text-right text-lg font-semibold text-foreground">{estimated}</div>
              </div>
            </div>

            {/* Rate */}
            <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3" /> Rate
              </div>
              <span className="text-xs text-foreground">1 {fromSymbol} = {rate >= 1 ? formatPrice(rate) : rate.toFixed(8)} {toSymbol}</span>
            </div>

            {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}
            {success && <p className="mt-3 text-center text-xs text-green-400">{success}</p>}

            <Button onClick={handleConvert} disabled={!canConvert} className="mt-4 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90" size="lg">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : amount && parseFloat(amount) > availableFrom ? "Insufficient balance" : "Convert"}
            </Button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">No trading fees. Price refreshes every 15s.</p>
          </div>

          {/* History */}
          {showHistory && (
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Recent Conversions</h3>
              {recentConversions.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No conversions yet</p>
              ) : (
                recentConversions.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-foreground">{Number(c.from_amount).toFixed(6)} {c.from_asset}</span>
                      <span className="mx-2 text-muted-foreground">{"-->"}</span>
                      <span className="text-sm font-medium text-[#0ecb81]">{Number(c.to_amount).toFixed(6)} {c.to_asset}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {new Date(c.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
