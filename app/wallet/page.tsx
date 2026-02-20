"use client"

import { useState } from "react"
import useSWR from "swr"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { DEPOSIT_ADDRESSES as FALLBACK_ADDRESSES, type CoinDepositConfig } from "@/lib/deposit-addresses"
import {
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight, RefreshCw, History,
  Copy, Check, X, AlertTriangle, Search, Eye, EyeOff,
  Clock, CheckCircle2, XCircle, Loader2, Home, LineChart,
  TrendingUp, Coins, Wallet, ChevronRight,
} from "lucide-react"
import { MarketAsset } from "@/components/market-asset"
import { BybitLogo } from "@/components/bybit-logo"

const fetcher = (url: string) => fetch(url).then(r => r.json())

type Tab = "overview" | "deposit" | "withdraw" | "transfer" | "history"

const COIN_NAMES: Record<string, string> = {
  BTC: "Bitcoin", ETH: "Ethereum", USDT: "Tether", SOL: "Solana",
  XRP: "XRP", ADA: "Cardano", BNB: "BNB", DOGE: "Dogecoin", AVAX: "Avalanche",
  USDC: "USD Coin", DOT: "Polkadot", LINK: "Chainlink",
}

export default function WalletPage() {
  const [tab, setTab] = useState<Tab>("overview")
  const [hideSmall, setHideSmall] = useState(false)
  const [hideZero, setHideZero] = useState(false)
  const [search, setSearch] = useState("")
  const [showBal, setShowBal] = useState(true)
  const [assetView, setAssetView] = useState<"asset" | "account">("asset")

  const { data: balances, mutate: mutBal } = useSWR("/api/trade?type=balances", fetcher, { refreshInterval: 8000 })
  const { data: transactions, mutate: mutTx } = useSWR("/api/transactions", fetcher, { refreshInterval: 8000 })
  const { data: prices } = useSWR("/api/prices", fetcher, { refreshInterval: 15000 })

  const balArr: any[] = Array.isArray(balances) ? balances : (balances?.balances ?? [])
  const txArr: any[] = Array.isArray(transactions) ? transactions : []
  const pm: Record<string, number> = { USDT: 1 }
  if (prices && !prices.error && prices.crypto) {
    for (const c of prices.crypto) {
      if (c.symbol && c.price) pm[c.symbol] = c.price
    }
  }

  const totalUsd = balArr.reduce((s: number, b: any) => s + (Number(b.available) + Number(b.in_order || 0)) * (pm[b.asset] || 0), 0)
  const btcVal = pm["BTC"] > 0 ? totalUsd / pm["BTC"] : 0
  const todayPnl = 0 // Placeholder for real P&L

  const filteredBal = balArr.filter((b: any) => {
    const total = Number(b.available) + Number(b.in_order || 0)
    if (hideZero && total === 0) return false
    if (hideSmall && total * (pm[b.asset] || 0) < 1) return false
    if (search && !b.asset.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const bottomNav = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "Markets", icon: LineChart, href: "/trade" },
    { label: "Trade", icon: TrendingUp, href: "/trade?pair=BTCUSDT" },
    { label: "Earn", icon: Coins, href: "/earn" },
    { label: "Assets", icon: Wallet, href: "/wallet", active: true },
  ]

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Header - show on desktop, hide on mobile in favor of mobile-specific header */}
      <div className="hidden lg:block">
        <Header />
      </div>

      {/* Mobile header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <BybitLogo className="h-5" />
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {"U"}
          </Link>
          <Link href="/dashboard" className="p-1 text-muted-foreground">
            <X className="h-5 w-5 rotate-45" />
          </Link>
        </div>
      </div>

      <main className="flex-1">
        {/* ===== MOBILE LAYOUT ===== */}
        <div className="lg:hidden">
          {tab === "overview" ? (
            <div className="px-4 pb-20 pt-4">
              {/* Total Assets */}
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Total Assets</span>
                  <button onClick={() => setShowBal(!showBal)} className="text-muted-foreground">
                    {showBal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      {showBal ? totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " USD" : "*********"}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      {showBal ? `~ ${btcVal.toFixed(8)} BTC` : "******"}
                    </p>
                  </div>
                  {/* Mini chart placeholder */}
                  <div className="h-10 w-20">
                    <svg viewBox="0 0 80 40" className="h-full w-full text-[#f7a600]">
                      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,30 10,25 20,28 30,20 40,22 50,15 60,18 70,12 80,16" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Today's P&L */}
              <button className="mb-5 flex items-center gap-1">
                <span className="text-sm text-muted-foreground">{"Today's P&L"}</span>
                <span className={`text-sm font-medium ${todayPnl >= 0 ? "text-success" : "text-destructive"}`}>
                  {showBal ? `${todayPnl >= 0 ? "+" : ""}${todayPnl.toFixed(2)}` : "******"}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {/* Available / In Use */}
              <div className="mb-6 flex gap-8">
                <div>
                  <p className="text-xs text-muted-foreground">Available balance</p>
                  <p className="font-mono text-sm font-semibold text-foreground">
                    {showBal ? totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "******"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">In Use</p>
                  <p className="font-mono text-sm font-semibold text-foreground">
                    {showBal ? balArr.reduce((s: number, b: any) => s + Number(b.in_order || 0) * (pm[b.asset] || 0), 0).toFixed(2) : "******"}
                  </p>
                </div>
              </div>

              {/* My Card */}
              <Link href="/card" className="mb-6 block rounded-xl bg-gradient-to-r from-[#e8e8e8] to-[#d0d0d0] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#1a1a1a]">My Card</span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#1a1a1a]/60" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs tracking-wider text-[#1a1a1a]/60">**** **** **** 4774</span>
                    <div className="flex h-6 w-8 items-center justify-center rounded bg-[#eb001b]/80">
                      <div className="h-4 w-4 rounded-full bg-[#f79e1b]/80" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Action Buttons - circular icons like Bybit */}
              <div className="mb-6 flex items-center justify-around">
                {[
                  { label: "Deposit", icon: ArrowDownLeft, tab: "deposit" as Tab, active: true },
                  { label: "Withdraw", icon: ArrowUpRight, tab: "withdraw" as Tab, active: false },
                  { label: "Transfer", icon: ArrowLeftRight, tab: "transfer" as Tab, active: false },
                  { label: "Convert", icon: RefreshCw, tab: "overview" as Tab, active: false },
                ].map((a) => (
                  <button key={a.label} onClick={() => setTab(a.tab)} className="flex flex-col items-center gap-1.5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${a.active ? "bg-[#f7a600]" : "bg-secondary"}`}>
                      <a.icon className={`h-5 w-5 ${a.active ? "text-[#0a0e17]" : "text-foreground"}`} />
                    </div>
                    <span className="text-xs text-muted-foreground">{a.label}</span>
                  </button>
                ))}
              </div>

              {/* Referral Banner */}
              <div className="mb-6 rounded-xl bg-secondary/50 px-4 py-3">
                <p className="text-center text-sm text-muted-foreground">Grow your assets with every referral</p>
              </div>

              {/* Asset / Account tabs */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setAssetView("asset")} className={`text-base font-semibold ${assetView === "asset" ? "text-foreground" : "text-muted-foreground"}`}>Asset</button>
                  <button onClick={() => setAssetView("account")} className={`text-base font-semibold ${assetView === "account" ? "text-foreground" : "text-muted-foreground"}`}>Account</button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTab("history")} className="p-1.5 text-muted-foreground"><History className="h-4 w-4" /></button>
                  <button onClick={() => setShowBal(!showBal)} className="p-1.5 text-muted-foreground">
                    {showBal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Coin List - Bybit style (mobile) */}
              <div className="flex flex-col gap-0">
                {filteredBal.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">No assets found</p>
                ) : filteredBal.map((b: any) => {
                  const inOrder = Number(b.in_order || 0)
                  const total = Number(b.available) + inOrder
                  const usd = total * (pm[b.asset] || 0)
                  const change = ((pm[b.asset] || 0) - (pm[b.asset] || 0)) // placeholder
                  return (
                    <div key={b.asset} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <MarketAsset symbol={b.asset} size={36} />
                        <div>
                          <p className="text-sm font-bold text-foreground">{b.asset}</p>
                          <p className={`text-xs ${change >= 0 ? "text-muted-foreground" : "text-destructive"}`}>
                            {COIN_NAMES[b.asset] || b.asset}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-foreground">
                          {showBal ? Number(b.available).toFixed(b.asset === "USDT" ? 2 : 6) : "*****"}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {showBal ? `$${usd.toFixed(2)}` : "*****"}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="px-4 pb-20 pt-4">
              {/* Back button */}
              <button onClick={() => setTab("overview")} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <X className="h-4 w-4" /> Back to Assets
              </button>
              {tab === "deposit" && <DepositTab mutTx={mutTx} mutBal={mutBal} />}
              {tab === "withdraw" && <WithdrawTab bals={balArr} mutTx={mutTx} mutBal={mutBal} />}
              {tab === "transfer" && <TransferTab bals={balArr} mutTx={mutTx} mutBal={mutBal} />}
              {tab === "history" && <HistoryTab txs={txArr} />}
            </div>
          )}
        </div>

        {/* ===== DESKTOP LAYOUT ===== */}
        <div className="hidden lg:block">
          <div className="mx-auto max-w-7xl px-6 py-8">
            {/* Top balance card */}
            <div className="mb-8 flex items-start justify-between rounded-2xl border border-border bg-card p-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Total Assets</span>
                  <button onClick={() => setShowBal(!showBal)} className="text-muted-foreground">
                    {showBal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                <h1 className="mt-1 text-4xl font-bold text-foreground">
                  {showBal ? totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " USD" : "*********"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {showBal ? `~ ${btcVal.toFixed(8)} BTC` : "****"}
                </p>
                <div className="mt-4 flex gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Available balance</p>
                    <p className="font-mono text-lg font-semibold text-foreground">{showBal ? `$${totalUsd.toFixed(2)}` : "****"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">In Use</p>
                    <p className="font-mono text-lg font-semibold text-foreground">
                      {showBal ? `$${balArr.reduce((s: number, b: any) => s + Number(b.in_order || 0) * (pm[b.asset] || 0), 0).toFixed(2)}` : "****"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setTab("deposit")} className="rounded-lg bg-[#f7a600] px-6 py-2.5 text-sm font-semibold text-[#0a0e17] transition hover:bg-[#e09800]">Deposit</button>
                <button onClick={() => setTab("withdraw")} className="rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary">Withdraw</button>
                <button onClick={() => setTab("transfer")} className="rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary">Transfer</button>
                <button onClick={() => setTab("history")} className="rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary">History</button>
              </div>
            </div>

            {/* Desktop Tab Content */}
            {tab === "overview" ? (
              <div className="rounded-2xl border border-border bg-card">
                <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coin..."
                      className="rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#f7a600] focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" checked={hideSmall} onChange={e => setHideSmall(e.target.checked)} className="accent-[#f7a600]" />
                      {"Hide small balances"}
                    </label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" checked={hideZero} onChange={e => setHideZero(e.target.checked)} className="accent-[#f7a600]" />
                      {"Hide zero balances"}
                    </label>
                  </div>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-3 text-left font-medium">Coin</th>
                      <th className="px-6 py-3 text-right font-medium">Available</th>
                      <th className="px-6 py-3 text-right font-medium">In Order</th>
                      <th className="px-6 py-3 text-right font-medium">USD Value</th>
                      <th className="px-6 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBal.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No assets found</td></tr>
                    ) : filteredBal.map((b: any) => {
                      const inOrder = Number(b.in_order || 0)
                      const total = Number(b.available) + inOrder
                      const usd = total * (pm[b.asset] || 0)
                      return (
                        <tr key={b.asset} className="border-b border-border/50 transition hover:bg-secondary/20">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <MarketAsset symbol={b.asset} size={36} />
                              <div>
                                <p className="text-sm font-semibold text-foreground">{b.asset}</p>
                                <p className="text-[11px] text-muted-foreground">{COIN_NAMES[b.asset] || b.asset}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-sm text-foreground">{showBal ? Number(b.available).toFixed(b.asset === "USDT" ? 2 : 6) : "****"}</td>
                          <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">{showBal ? inOrder.toFixed(b.asset === "USDT" ? 2 : 6) : "****"}</td>
                          <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">{showBal ? `$${usd.toFixed(2)}` : "****"}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setTab("deposit")} className="rounded px-2.5 py-1 text-xs font-medium text-[#f7a600] transition hover:bg-[#f7a600]/10">Deposit</button>
                              <button onClick={() => setTab("withdraw")} className="rounded px-2.5 py-1 text-xs font-medium text-[#f7a600] transition hover:bg-[#f7a600]/10">Withdraw</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <button onClick={() => setTab("overview")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" /> Back to Overview
                </button>
                {tab === "deposit" && <DepositTab mutTx={mutTx} mutBal={mutBal} />}
                {tab === "withdraw" && <WithdrawTab bals={balArr} mutTx={mutTx} mutBal={mutBal} />}
                {tab === "transfer" && <TransferTab bals={balArr} mutTx={mutTx} mutBal={mutBal} />}
                {tab === "history" && <HistoryTab txs={txArr} />}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer - desktop only */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* Bottom Nav - mobile only */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        {bottomNav.map((n) => (
          <Link key={n.label} href={n.href} className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 ${n.active ? "text-foreground" : "text-muted-foreground"}`}>
            <n.icon className="h-5 w-5" />
            <span className="text-[10px]">{n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

/* ===== Deposit ===== */
function DepositTab({ mutTx, mutBal }: any) {
  const { data: addrData } = useSWR("/api/deposit-addresses", fetcher)
  const DEPOSIT_ADDRESSES: CoinDepositConfig[] = addrData?.addresses ?? FALLBACK_ADDRESSES
  const [coin, setCoin] = useState("USDT")
  const [netIdx, setNetIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const cd = DEPOSIT_ADDRESSES.find(c => c.symbol === coin) || DEPOSIT_ADDRESSES[0]
  const net = cd?.networks?.[netIdx] || cd?.networks?.[0]
  const copy = () => { navigator.clipboard.writeText(net.address); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const submit = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    setSubmitting(true)
    await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deposit", asset: coin, network: net.network, amount, tx_hash: txHash }) })
    mutTx(); mutBal(); setDone(true); setSubmitting(false)
  }

  if (done) return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f7a600]/10"><Clock className="h-8 w-8 text-[#f7a600]" /></div>
      <h3 className="mb-2 text-lg font-bold text-foreground">Deposit Submitted</h3>
      <p className="mb-6 text-sm text-muted-foreground">Your deposit of {amount} {coin} is pending admin review. You will be notified once approved.</p>
      <button onClick={() => { setDone(false); setAmount(""); setTxHash("") }} className="rounded-lg bg-[#f7a600] px-6 py-2.5 text-sm font-semibold text-[#0a0e17]">New Deposit</button>
    </div>
  )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-bold text-foreground">Deposit {coin}</h3>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-muted-foreground">Coin</label>
          <div className="flex flex-wrap gap-2">
            {DEPOSIT_ADDRESSES.map(c => (
              <button key={c.symbol} onClick={() => { setCoin(c.symbol); setNetIdx(0) }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${coin === c.symbol ? "bg-[#f7a600] text-[#0a0e17]" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{c.symbol}</button>
            ))}
          </div>
        </div>
        {cd.networks.length > 1 && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs text-muted-foreground">Network</label>
            <div className="flex gap-2">
              {cd.networks.map((n, i) => (
                <button key={n.network} onClick={() => setNetIdx(i)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${netIdx === i ? "bg-[#f7a600] text-[#0a0e17]" : "bg-secondary text-muted-foreground"}`}>{n.network}</button>
              ))}
            </div>
          </div>
        )}
        <div className="mb-4 flex flex-col items-center rounded-xl bg-secondary/30 p-6">
          <div className="mb-3 flex h-[180px] w-[180px] items-center justify-center rounded-xl bg-white p-2">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(net.address)}&bgcolor=ffffff&color=000000&format=svg`}
              alt={`${coin} ${net.network} QR`} width={160} height={160} className="h-[160px] w-[160px]" crossOrigin="anonymous" />
          </div>
          <p className="text-[10px] text-muted-foreground">Scan QR code or copy address below</p>
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-muted-foreground">Deposit Address</label>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3">
            <code className="flex-1 break-all text-xs text-foreground">{net.address}</code>
            <button onClick={copy} className="shrink-0 rounded p-1.5 hover:bg-secondary">{copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted-foreground" />}</button>
          </div>
        </div>
        <div className="rounded-lg bg-[#f7a600]/5 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#f7a600]" />
            <p className="text-[10px] text-muted-foreground"><span className="font-semibold text-[#f7a600]">Important: </span>Only send {coin} on the {net.network} network. Min deposit: {cd.minDeposit} {coin}. Confirmations: {cd.confirmations}.</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-2 text-lg font-bold text-foreground">Confirm Deposit</h3>
        <p className="mb-6 text-sm text-muted-foreground">After sending funds, submit the details below for admin review.</p>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount</label>
          <div className="flex items-center rounded-lg border border-border bg-background">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
            <span className="px-4 text-sm font-semibold text-muted-foreground">{coin}</span>
          </div>
        </div>
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Transaction Hash (optional)</label>
          <input type="text" value={txHash} onChange={e => setTxHash(e.target.value)} placeholder="0x..." className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#f7a600] focus:outline-none" />
        </div>
        <button onClick={submit} disabled={submitting || !amount || parseFloat(amount) <= 0}
          className="w-full rounded-lg bg-[#f7a600] py-3 text-sm font-bold text-[#0a0e17] transition hover:bg-[#e09800] disabled:opacity-50">
          {submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Submit Deposit Request"}
        </button>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">Deposits require admin approval. Usually processed within 1-24 hours.</p>
      </div>
    </div>
  )
}

/* ===== Withdraw ===== */
function WithdrawTab({ bals, mutTx, mutBal }: any) {
  const { data: addrData } = useSWR("/api/deposit-addresses", fetcher)
  const WITHDRAW_ADDRESSES: CoinDepositConfig[] = addrData?.addresses ?? FALLBACK_ADDRESSES
  const [coin, setCoin] = useState("USDT")
  const [netIdx, setNetIdx] = useState(0)
  const [address, setAddress] = useState("")
  const [memo, setMemo] = useState("")
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const cd = WITHDRAW_ADDRESSES.find(c => c.symbol === coin) || WITHDRAW_ADDRESSES[0]
  const net = cd.networks[netIdx] || cd.networks[0]
  const bal = bals.find((b: any) => b.asset === coin)
  const avail = Number(bal?.available || 0)
  const fee = coin === "USDT" ? 1 : coin === "BTC" ? 0.0005 : coin === "ETH" ? 0.005 : coin === "SOL" ? 0.01 : 0.001

  const submit = async () => {
    if (!amount || !address) return
    setSubmitting(true); setError("")
    const res = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "withdraw", asset: coin, network: net.network, amount, address, memo }) })
    const d = await res.json()
    if (d.error) { setError(d.error); setSubmitting(false); return }
    mutTx(); mutBal(); setDone(true); setSubmitting(false)
  }

  if (done) return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f7a600]/10"><Clock className="h-8 w-8 text-[#f7a600]" /></div>
      <h3 className="mb-2 text-lg font-bold text-foreground">Withdrawal Submitted</h3>
      <p className="mb-6 text-sm text-muted-foreground">Your withdrawal of {amount} {coin} is pending admin review.</p>
      <button onClick={() => { setDone(false); setAmount(""); setAddress("") }} className="rounded-lg bg-[#f7a600] px-6 py-2.5 text-sm font-semibold text-[#0a0e17]">New Withdrawal</button>
    </div>
  )

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-6 text-lg font-bold text-foreground">Withdraw Crypto</h3>
      <div className="mb-4">
        <label className="mb-1.5 block text-xs text-muted-foreground">Coin</label>
        <div className="flex flex-wrap gap-2">
          {WITHDRAW_ADDRESSES.map(c => (
            <button key={c.symbol} onClick={() => { setCoin(c.symbol); setNetIdx(0) }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${coin === c.symbol ? "bg-[#f7a600] text-[#0a0e17]" : "bg-secondary text-muted-foreground"}`}>{c.symbol}</button>
          ))}
        </div>
      </div>
      {cd.networks.length > 1 && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-muted-foreground">Network</label>
          <div className="flex gap-2">
            {cd.networks.map((n, i) => (
              <button key={n.network} onClick={() => setNetIdx(i)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${netIdx === i ? "bg-[#f7a600] text-[#0a0e17]" : "bg-secondary text-muted-foreground"}`}>{n.network}</button>
            ))}
          </div>
        </div>
      )}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Withdraw Address</label>
        <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder={`Enter ${coin} address`}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#f7a600] focus:outline-none" />
      </div>
      {net.memo && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Memo/Tag</label>
          <input type="text" value={memo} onChange={e => setMemo(e.target.value)} placeholder="Enter memo"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
        </div>
      )}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount</label>
        <div className="flex items-center rounded-lg border border-border bg-background">
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
            className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          <button onClick={() => setAmount(String(Math.max(0, avail - fee)))} className="px-2 text-xs font-bold text-[#f7a600]">MAX</button>
          <span className="px-4 text-sm font-semibold text-muted-foreground">{coin}</span>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">Available: {avail.toFixed(coin === "USDT" ? 2 : 6)} {coin}</p>
      </div>
      <div className="mb-6 rounded-lg bg-secondary/50 p-3 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Network Fee</span><span className="text-foreground">{fee} {coin}</span></div>
        <div className="mt-1 flex justify-between"><span className="text-muted-foreground">You Receive</span><span className="font-semibold text-foreground">{amount ? Math.max(0, parseFloat(amount) - fee).toFixed(coin === "USDT" ? 2 : 6) : "0"} {coin}</span></div>
      </div>
      {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
      <button onClick={submit} disabled={submitting || !amount || !address || parseFloat(amount) <= fee}
        className="w-full rounded-lg bg-[#f7a600] py-3 text-sm font-bold text-[#0a0e17] transition hover:bg-[#e09800] disabled:opacity-50">
        {submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Submit Withdrawal Request"}
      </button>
    </div>
  )
}

/* ===== Transfer ===== */
function TransferTab({ bals, mutTx, mutBal }: any) {
  const [coin, setCoin] = useState("USDT")
  const [from, setFrom] = useState("Spot")
  const [to, setTo] = useState("Funding")
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const accounts = ["Spot", "Funding", "Derivatives", "Earn"]
  const bal = bals.find((b: any) => b.asset === coin)
  const avail = Number(bal?.available || 0)
  const swap = () => { setFrom(to); setTo(from) }

  const submit = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    setSubmitting(true)
    await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "transfer", asset: coin, amount, from_account: from, to_account: to }) })
    mutTx(); mutBal(); setDone(true); setSubmitting(false)
  }

  if (done) return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10"><CheckCircle2 className="h-8 w-8 text-success" /></div>
      <h3 className="mb-2 text-lg font-bold text-foreground">Transfer Complete</h3>
      <p className="mb-6 text-sm text-muted-foreground">{amount} {coin} transferred from {from} to {to}.</p>
      <button onClick={() => { setDone(false); setAmount("") }} className="rounded-lg bg-[#f7a600] px-6 py-2.5 text-sm font-semibold text-[#0a0e17]">New Transfer</button>
    </div>
  )

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-6 text-lg font-bold text-foreground">Transfer Between Accounts</h3>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs text-muted-foreground">From</label>
          <select value={from} onChange={e => setFrom(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground">
            {accounts.filter(a => a !== to).map(a => <option key={a} value={a}>{a} Account</option>)}
          </select>
        </div>
        <button onClick={swap} className="mt-5 rounded-full border border-border p-2 hover:bg-secondary"><ArrowLeftRight className="h-4 w-4 text-muted-foreground" /></button>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs text-muted-foreground">To</label>
          <select value={to} onChange={e => setTo(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground">
            {accounts.filter(a => a !== from).map(a => <option key={a} value={a}>{a} Account</option>)}
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="mb-1.5 block text-xs text-muted-foreground">Coin</label>
        <div className="flex flex-wrap gap-2">
          {["USDT", "BTC", "ETH", "SOL"].map(c => (
            <button key={c} onClick={() => setCoin(c)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${coin === c ? "bg-[#f7a600] text-[#0a0e17]" : "bg-secondary text-muted-foreground"}`}>{c}</button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount</label>
        <div className="flex items-center rounded-lg border border-border bg-background">
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          <button onClick={() => setAmount(String(avail))} className="px-2 text-xs font-bold text-[#f7a600]">MAX</button>
          <span className="px-4 text-sm font-semibold text-muted-foreground">{coin}</span>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">Available: {avail.toFixed(coin === "USDT" ? 2 : 6)} {coin}</p>
      </div>
      <button onClick={submit} disabled={submitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > avail}
        className="w-full rounded-lg bg-[#f7a600] py-3 text-sm font-bold text-[#0a0e17] transition hover:bg-[#e09800] disabled:opacity-50">
        {submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Transfer"}
      </button>
    </div>
  )
}

/* ===== History ===== */
function HistoryTab({ txs }: { txs: any[] }) {
  const [filter, setFilter] = useState("all")
  const filtered = filter === "all" ? txs : txs.filter(t => t.type === filter)

  const statusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle2 className="h-4 w-4 text-success" />
    if (s === "rejected") return <XCircle className="h-4 w-4 text-destructive" />
    return <Clock className="h-4 w-4 text-[#f7a600]" />
  }

  const typeLabel = (t: string) => {
    if (t === "deposit") return <span className="rounded bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-success">Deposit</span>
    if (t === "withdrawal") return <span className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-destructive">Withdraw</span>
    return <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">Transfer</span>
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-4">
        {["all", "deposit", "withdrawal", "transfer"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? "bg-[#f7a600] text-[#0a0e17]" : "text-muted-foreground hover:text-foreground"}`}>
            {f === "all" ? "All" : f === "withdrawal" ? "Withdraw" : f}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Coin</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No transactions yet</td></tr>
            ) : filtered.map((t: any) => (
              <tr key={t.id} className="border-b border-border/50 transition hover:bg-secondary/20">
                <td className="px-4 py-3">{typeLabel(t.type)}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{t.asset}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{t.amount}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-1.5">{statusIcon(t.status)}<span className="text-xs capitalize text-muted-foreground">{t.status}</span></div></td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
