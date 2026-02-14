"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Eye, EyeOff, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Search,
  ChevronDown, TrendingUp, TrendingDown, History, Wallet, PiggyBank, BarChart3,
  Copy, Check, X, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLivePrices, formatPrice, type PriceData } from "@/hooks/use-live-prices"
import { DEPOSIT_ADDRESSES, type CoinDepositConfig } from "@/lib/deposit-addresses"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const COIN_NAMES: Record<string, string> = {
  BTC: "Bitcoin", ETH: "Ethereum", USDT: "Tether", SOL: "Solana",
  XRP: "XRP", ADA: "Cardano", BNB: "BNB", DOGE: "Dogecoin", AVAX: "Avalanche",
}

const accountTypes = [
  { key: "spot", label: "Spot Account", icon: Wallet },
  { key: "funding", label: "Funding Account", icon: PiggyBank },
  { key: "derivatives", label: "Derivatives", icon: BarChart3 },
]

function getPriceForSymbol(crypto: PriceData[], symbol: string): number {
  if (symbol === "USDT" || symbol === "USDC") return 1
  return crypto.find((c) => c.symbol === symbol)?.price ?? 0
}

function getChangeForSymbol(crypto: PriceData[], symbol: string): number {
  if (symbol === "USDT" || symbol === "USDC") return 0.01
  return crypto.find((c) => c.symbol === symbol)?.change24h ?? 0
}

// ---- Deposit Modal ----
function DepositModal({ coin, onClose }: { coin: CoinDepositConfig; onClose: () => void }) {
  const [selectedNetwork, setSelectedNetwork] = useState(0)
  const [copied, setCopied] = useState(false)
  const network = coin.networks[selectedNetwork]

  const copyAddress = () => {
    navigator.clipboard.writeText(network.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"><X className="h-4 w-4" /></button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{coin.symbol.charAt(0)}</div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Deposit {coin.symbol}</h2>
            <p className="text-xs text-muted-foreground">{coin.name}</p>
          </div>
        </div>

        {/* Network selector */}
        {coin.networks.length > 1 && (
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Select Network</label>
            <div className="flex gap-2">
              {coin.networks.map((n, i) => (
                <button key={n.network} onClick={() => setSelectedNetwork(i)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${selectedNetwork === i ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                  {n.network}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real QR code */}
        <div className="mb-4 flex flex-col items-center rounded-xl bg-secondary/30 p-6">
          <div className="mb-3 flex h-[180px] w-[180px] items-center justify-center rounded-xl bg-white p-2">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(network.address)}&bgcolor=ffffff&color=000000&format=svg`}
              alt={`QR code for ${coin.symbol} ${network.network} deposit address`}
              width={160}
              height={160}
              className="h-[160px] w-[160px]"
              crossOrigin="anonymous"
            />
          </div>
          <p className="text-center text-[10px] text-muted-foreground">Scan QR code or copy address below</p>
        </div>

        {/* Address display */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-muted-foreground">{network.network} Deposit Address</label>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-3">
            <code className="flex-1 break-all font-mono text-xs text-foreground">{network.address}</code>
            <button onClick={copyAddress} className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {network.memo && (
          <div className="mb-4 rounded-lg border border-chart-4/30 bg-chart-4/5 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-chart-4"><AlertTriangle className="h-3.5 w-3.5" />Memo / Tag Required</div>
            <p className="mt-1 text-[10px] text-muted-foreground">A memo/tag is required for this deposit. Failure to include it may result in loss of funds.</p>
          </div>
        )}

        {/* Info */}
        <div className="space-y-2 rounded-lg bg-secondary/20 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Min. Deposit</span>
            <span className="font-mono text-foreground">{coin.minDeposit} {coin.symbol}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Confirmations</span>
            <span className="font-mono text-foreground">{coin.confirmations}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Est. Arrival</span>
            <span className="font-mono text-foreground">After {coin.confirmations} network confirmations</span>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Only send <span className="font-semibold text-foreground">{coin.symbol}</span> to this address via the <span className="font-semibold text-foreground">{network.network}</span> network.
            Sending any other asset or using a different network may result in permanent loss of funds.
          </p>
        </div>
      </div>
    </div>
  )
}

// ---- Withdraw Modal ----
function WithdrawModal({ symbol, available, onClose }: { symbol: string; available: number; onClose: () => void }) {
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const config = DEPOSIT_ADDRESSES.find((c) => c.symbol === symbol)

  const handleSubmit = () => {
    if (!address || !amount || Number(amount) <= 0 || Number(amount) > available) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSuccess(true)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"><X className="h-4 w-4" /></button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-sm font-bold text-destructive">{symbol.charAt(0)}</div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Withdraw {symbol}</h2>
            <p className="text-xs text-muted-foreground">{COIN_NAMES[symbol] || symbol}</p>
          </div>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <Check className="h-7 w-7 text-success" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Withdrawal Submitted</h3>
            <p className="text-center text-sm text-muted-foreground">Your withdrawal of {amount} {symbol} is being processed. It may take up to 30 minutes.</p>
            <Button onClick={onClose} className="mt-4">Done</Button>
          </div>
        ) : (
          <>
            {/* Network */}
            {config && config.networks.length > 0 && (
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Network</label>
                <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground">{config.networks[0].network}</div>
              </div>
            )}

            {/* Address */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-muted-foreground">Withdrawal Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder={`Enter ${symbol} address`}
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2.5 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" />
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-muted-foreground">Amount</label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" step="any"
                  className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                <button onClick={() => setAmount(String(available))} className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20">MAX</button>
                <span className="text-sm font-medium text-muted-foreground">{symbol}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Available: {available.toLocaleString("en-US", { maximumFractionDigits: 8 })} {symbol}</span>
                <span>Fee: 0.0005 {symbol}</span>
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-secondary/20 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">You will receive</span>
                <span className="font-mono font-medium text-foreground">{amount ? (Math.max(0, Number(amount) - 0.0005)).toFixed(8) : "0.00000000"} {symbol}</span>
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-chart-4/30 bg-chart-4/5 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-chart-4"><AlertTriangle className="h-3.5 w-3.5" />Security Notice</div>
              <p className="mt-1 text-[10px] text-muted-foreground">Withdrawals are reviewed for security. Large amounts may require additional verification.</p>
            </div>

            <Button onClick={handleSubmit} disabled={submitting || !address || !amount || Number(amount) <= 0}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {submitting ? "Processing..." : `Withdraw ${symbol}`}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default function WalletPage() {
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [search, setSearch] = useState("")
  const [hideSmall, setHideSmall] = useState(false)
  const [activeAccount, setActiveAccount] = useState("spot")
  const [depositCoin, setDepositCoin] = useState<CoinDepositConfig | null>(null)
  const [withdrawCoin, setWithdrawCoin] = useState<{ symbol: string; available: number } | null>(null)
  const { crypto, isLoading: priceLoading } = useLivePrices(5000)

  const { data: balData, isLoading: balLoading } = useSWR("/api/trade?type=balances", fetcher, { refreshInterval: 5000 })
  const { data: tradeData } = useSWR("/api/trade?type=trades", fetcher, { refreshInterval: 10000 })
  const balances = balData?.balances ?? []
  const trades = tradeData?.trades ?? []
  const isLoading = priceLoading || balLoading

  const enrichedAssets = useMemo(() => {
    return balances.map((b: { asset: string; available: number; in_order: number }) => {
      const total = Number(b.available) + Number(b.in_order)
      const livePrice = getPriceForSymbol(crypto, b.asset)
      const usdValue = total * livePrice
      const change24h = getChangeForSymbol(crypto, b.asset)
      return { symbol: b.asset, name: COIN_NAMES[b.asset] || b.asset, balance: total, available: Number(b.available), inOrder: Number(b.in_order), usdValue, change24h, livePrice }
    })
  }, [crypto, balances])

  const totalUsd = enrichedAssets.reduce((sum: number, a: { usdValue: number }) => sum + a.usdValue, 0)
  const btcPrice = getPriceForSymbol(crypto, "BTC")
  const totalBtc = btcPrice > 0 ? totalUsd / btcPrice : 0

  const filtered = enrichedAssets.filter((a: { name: string; symbol: string; usdValue: number }) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase())
    const matchSmall = hideSmall ? a.usdValue > 1 : true
    return matchSearch && matchSmall
  })

  const handleDeposit = (symbol?: string) => {
    const coin = DEPOSIT_ADDRESSES.find((c) => c.symbol === (symbol || "USDT"))
    if (coin) setDepositCoin(coin)
  }

  const handleWithdraw = (symbol?: string, available?: number) => {
    setWithdrawCoin({ symbol: symbol || "USDT", available: available || 0 })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {depositCoin && <DepositModal coin={depositCoin} onClose={() => setDepositCoin(null)} />}
      {withdrawCoin && <WithdrawModal symbol={withdrawCoin.symbol} available={withdrawCoin.available} onClose={() => setWithdrawCoin(null)} />}

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Account type tabs */}
        <div className="mb-6 flex items-center gap-2">
          {accountTypes.map((acc) => (
            <button key={acc.key} onClick={() => setActiveAccount(acc.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeAccount === acc.key ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}>
              <acc.icon className="h-4 w-4" />{acc.label}
            </button>
          ))}
        </div>

        {/* Balance overview */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Estimated Balance</span>
                <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-muted-foreground hover:text-foreground">
                  {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                {!isLoading && (
                  <span className="ml-2 flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] text-success">
                    <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" /></span>
                    Live
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                {isLoading ? <div className="h-9 w-64 animate-pulse rounded bg-secondary" /> : (
                  <>
                    <span className="font-mono text-3xl font-bold text-foreground">{balanceVisible ? `${totalBtc.toFixed(8)} BTC` : "********"}</span>
                    <span className="font-mono text-sm text-muted-foreground">{balanceVisible ? `$${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "****"}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => handleDeposit()} className="bg-primary text-primary-foreground hover:bg-primary/90"><ArrowDownLeft className="mr-2 h-4 w-4" />Deposit</Button>
              <Button onClick={() => handleWithdraw("USDT", enrichedAssets.find((a: { symbol: string }) => a.symbol === "USDT")?.available || 0)} variant="outline" className="border-border text-foreground hover:bg-secondary"><ArrowUpRight className="mr-2 h-4 w-4" />Withdraw</Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary"><ArrowLeftRight className="mr-2 h-4 w-4" />Transfer</Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary"><History className="mr-2 h-4 w-4" />History</Button>
            </div>
          </div>
        </div>

        {/* Assets */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-border p-4 md:flex-row md:items-center">
            <h2 className="text-lg font-semibold text-foreground">Assets</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input type="text" placeholder="Search coin" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground" />
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={hideSmall} onChange={(e) => setHideSmall(e.target.checked)} className="rounded border-border" />
                <span className="text-xs text-muted-foreground">Hide small balances</span>
              </label>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Coin</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">Live Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">Available</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">In Order</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">USD Value</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground lg:table-cell"><div className="flex items-center justify-end gap-1">24h<ChevronDown className="h-3 w-3" /></div></th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="h-8 w-8 animate-pulse rounded-full bg-secondary" /><div className="h-4 w-16 animate-pulse rounded bg-secondary" /></div></td>
                    <td className="hidden px-4 py-4 md:table-cell"><div className="ml-auto h-4 w-20 animate-pulse rounded bg-secondary" /></td>
                    <td className="px-4 py-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-secondary" /></td>
                    <td className="hidden px-4 py-4 md:table-cell"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-secondary" /></td>
                    <td className="hidden px-4 py-4 md:table-cell"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-secondary" /></td>
                    <td className="px-4 py-4"><div className="ml-auto h-4 w-20 animate-pulse rounded bg-secondary" /></td>
                    <td className="hidden px-4 py-4 lg:table-cell"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-secondary" /></td>
                    <td className="px-4 py-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-secondary" /></td>
                  </tr>
                )) : filtered.map((asset: { symbol: string; name: string; balance: number; available: number; inOrder: number; usdValue: number; change24h: number; livePrice: number }) => (
                  <tr key={asset.symbol} className="border-b border-border last:border-0 hover:bg-secondary/20">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">{asset.symbol.charAt(0)}</div>
                        <div><div className="text-sm font-medium text-foreground">{asset.symbol}</div><div className="text-[10px] text-muted-foreground">{asset.name}</div></div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-4 text-right font-mono text-sm text-foreground md:table-cell">${formatPrice(asset.livePrice)}</td>
                    <td className="px-4 py-4 text-right font-mono text-sm text-foreground">{balanceVisible ? asset.balance.toLocaleString("en-US", { minimumFractionDigits: 4 }) : "****"}</td>
                    <td className="hidden px-4 py-4 text-right font-mono text-sm text-foreground md:table-cell">{balanceVisible ? asset.available.toLocaleString("en-US", { minimumFractionDigits: 4 }) : "****"}</td>
                    <td className="hidden px-4 py-4 text-right font-mono text-sm text-muted-foreground md:table-cell">{balanceVisible ? asset.inOrder.toLocaleString("en-US", { minimumFractionDigits: 4 }) : "****"}</td>
                    <td className="px-4 py-4 text-right font-mono text-sm text-foreground">{balanceVisible ? `$${asset.usdValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "****"}</td>
                    <td className="hidden px-4 py-4 text-right lg:table-cell">
                      <span className={`inline-flex items-center gap-1 font-mono text-xs ${asset.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                        {asset.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDeposit(asset.symbol)} className="text-xs font-medium text-primary hover:underline">Deposit</button>
                        <button onClick={() => handleWithdraw(asset.symbol, asset.available)} className="text-xs font-medium text-primary hover:underline">Withdraw</button>
                        <a href="/trade" className="text-xs font-medium text-primary hover:underline">Trade</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Trades from DB */}
        {trades.length > 0 && (
          <div className="mt-8 rounded-xl border border-border bg-card">
            <div className="border-b border-border p-4"><h2 className="text-lg font-semibold text-foreground">Recent Trades</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Pair</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Side</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">P&L</th>
                </tr></thead>
                <tbody>
                  {trades.slice(0, 10).map((t: { id: string; created_at: string; pair: string; side: string; price: number; amount: number; pnl: number }) => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{t.pair}</td>
                      <td className={`px-4 py-3 text-sm font-medium uppercase ${t.side === "buy" ? "text-success" : "text-destructive"}`}>{t.side}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">${Number(t.price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{Number(t.amount).toFixed(6)}</td>
                      <td className={`px-4 py-3 text-right font-mono text-sm font-semibold ${Number(t.pnl) >= 0 ? "text-success" : "text-destructive"}`}>
                        {Number(t.pnl) >= 0 ? "+" : ""}{Number(t.pnl).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
