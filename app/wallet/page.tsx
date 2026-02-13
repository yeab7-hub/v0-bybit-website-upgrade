"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Eye, EyeOff, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Search,
  ChevronDown, TrendingUp, TrendingDown, History, Wallet, PiggyBank, BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLivePrices, formatPrice, type PriceData } from "@/hooks/use-live-prices"
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

export default function WalletPage() {
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [search, setSearch] = useState("")
  const [hideSmall, setHideSmall] = useState(false)
  const [activeAccount, setActiveAccount] = useState("spot")
  const { crypto, isLoading: priceLoading } = useLivePrices(5000)

  // Real balances from DB
  const { data: balData, isLoading: balLoading } = useSWR("/api/trade?type=balances", fetcher, { refreshInterval: 5000 })
  // Real trades for transaction history
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
      return {
        symbol: b.asset,
        name: COIN_NAMES[b.asset] || b.asset,
        balance: total,
        available: Number(b.available),
        inOrder: Number(b.in_order),
        usdValue, change24h, livePrice,
      }
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
                {isLoading ? (
                  <div className="h-9 w-64 animate-pulse rounded bg-secondary" />
                ) : (
                  <>
                    <span className="font-mono text-3xl font-bold text-foreground">{balanceVisible ? `${totalBtc.toFixed(8)} BTC` : "********"}</span>
                    <span className="font-mono text-sm text-muted-foreground">{balanceVisible ? `$${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "****"}</span>
                  </>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-success" />
                <span className="text-xs text-success">Real-time from database</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90"><ArrowDownLeft className="mr-2 h-4 w-4" />Deposit</Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary"><ArrowUpRight className="mr-2 h-4 w-4" />Withdraw</Button>
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
                        <button className="text-xs text-primary hover:underline">Deposit</button>
                        <button className="text-xs text-primary hover:underline">Withdraw</button>
                        <a href="/trade" className="text-xs text-primary hover:underline">Trade</a>
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
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Pair</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Side</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 10).map((t: { id: string; created_at: string; pair: string; side: string; price: number; amount: number; total: number; pnl: number }) => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{t.pair}</td>
                      <td className={`px-4 py-3 text-sm font-medium uppercase ${t.side === "buy" ? "text-success" : "text-destructive"}`}>{t.side}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">${Number(t.price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{Number(t.amount).toFixed(6)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">${Number(t.total).toLocaleString()}</td>
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
