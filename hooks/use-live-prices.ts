"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import useSWR from "swr"

/* ================================================================
   Types
   ================================================================ */
export interface PriceData {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  change7d?: number
  volume: number
  marketCap: number
  high24h?: number
  low24h?: number
  sparkline?: number[]
  category: "crypto" | "forex" | "commodity" | "stock" | "cfd"
}

export interface PricesResponse {
  crypto: PriceData[]
  forex: PriceData[]
  commodities: PriceData[]
  stocks: PriceData[]
  cfd: PriceData[]
  timestamp: number
}

/* ================================================================
   Static sample data is not used for displayed or executable quotes.
   ================================================================ */
// No hardcoded market prices are permitted as fallbacks.
const INITIAL_DATA: PricesResponse = {
  crypto: [],
  forex: [],
  commodities: [],
  stocks: [],
  cfd: [],
  timestamp: Date.now(),
}

/* ================================================================
   Binance WebSocket for crypto
   ================================================================ */
const BINANCE_SYMBOLS = [
  "btcusdt", "ethusdt", "solusdt", "xrpusdt", "bnbusdt",
  "adausdt", "dogeusdt", "avaxusdt", "dotusdt", "linkusdt",
]
const SYMBOL_MAP: Record<string, string> = {
  btcusdt: "BTC", ethusdt: "ETH", solusdt: "SOL", xrpusdt: "XRP",
  bnbusdt: "BNB", adausdt: "ADA", dogeusdt: "DOGE", avaxusdt: "AVAX",
  dotusdt: "DOT", linkusdt: "LINK",
}

/* ================================================================
   REST fallback fetcher
   ================================================================ */
const restFetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Market data provider returned HTTP " + res.status)
  const json = await res.json()
  if (!json || typeof json !== "object") throw new Error("Market data response was invalid")
  const collections = [json.crypto, json.forex, json.commodities, json.stocks, json.cfd]
  if (!collections.every(Array.isArray)) throw new Error("Market data response is missing an asset collection")
  if (!collections.some((items: unknown[]) => items.length > 0)) throw new Error("No live market data is currently available")
  return json
}

/* ================================================================
   Hook: useLivePrices
   - Primary:  Binance WebSocket (real-time crypto, <100ms)
   - Secondary: REST /api/prices polling (all assets, every N seconds)
   - Client tick: 500ms micro-drift for non-crypto assets
   ================================================================ */
export function useLivePrices(refreshInterval = 8000) {
  const { data: restData, isLoading, error } = useSWR<PricesResponse | null>(
    "/api/prices",
    restFetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 8000,
      fallbackData: INITIAL_DATA,
      keepPreviousData: true,
      errorRetryCount: 2,
      errorRetryInterval: 10000,
      revalidateOnReconnect: true,
    }
  )

  // Crypto WebSocket overrides
  const [wsOverrides, setWsOverrides] = useState<Record<string, { price: number; change24h: number; high24h?: number; low24h?: number }>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)


  const connectWebSocket = useCallback(() => {
    if (!mountedRef.current) return
    if (wsRef.current) {
      try { wsRef.current.close() } catch {}
    }
    try {
      const streams = BINANCE_SYMBOLS.map((s) => `${s}@miniTicker`).join("/")
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.e !== "24hrMiniTicker") return
          const sym = msg.s?.toLowerCase()
          const mapped = SYMBOL_MAP[sym]
          if (!mapped) return
          const price = parseFloat(msg.c)
          const open = parseFloat(msg.o)
          const high = parseFloat(msg.h)
          const low = parseFloat(msg.l)
          if (!price || price <= 0) return
          const change24h = open > 0 ? ((price - open) / open) * 100 : 0
          setWsOverrides((prev) => ({
            ...prev,
            [mapped]: { price, change24h, high24h: high, low24h: low },
          }))
        } catch {}
      }
      ws.onerror = () => {}
      ws.onclose = () => {
        if (mountedRef.current) {
          reconnectTimeout.current = setTimeout(connectWebSocket, 3000)
        }
      }
    } catch {}
  }, [])

  // WebSocket lifecycle
  useEffect(() => {
    mountedRef.current = true
    connectWebSocket()
    return () => {
      mountedRef.current = false
      if (wsRef.current) { try { wsRef.current.close() } catch {} }
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
    }
  }, [connectWebSocket])

  // Merge everything
  const baseData = restData || INITIAL_DATA

  // Crypto: overlay WebSocket real-time prices
  const crypto = (baseData.crypto ?? []).map((coin) => {
    const override = wsOverrides[coin.symbol]
    if (override) {
      return {
        ...coin,
        price: override.price,
        change24h: override.change24h,
        high24h: override.high24h || coin.high24h,
        low24h: override.low24h || coin.low24h,
      }
    }
    return coin
  })

  // Non-crypto values are server-sourced only; never simulate prices in the browser.
  const forex = baseData.forex ?? []
  const commodities = baseData.commodities ?? []
  const stocks = baseData.stocks ?? []
  const cfdArr = baseData.cfd ?? []

  return {
    data: { ...baseData, crypto, forex, commodities, stocks, cfd: cfdArr },
    crypto,
    forex,
    commodities,
    stocks,
    cfd: cfdArr,
    isLoading,
    isError: Boolean(error),
  }
}

/* ================================================================
   Universal price lookup -- handles ALL pair formats
   Call with any format: "BTCUSDT", "BTC/USDT", "BTC", "EUR/USD",
   "EURUSD", "XAU/USD", "XAUUSD", "AAPL", "US30", etc.
   Returns the matching PriceData or null.
   ================================================================ */
export function findPrice(allPrices: PriceData[], pair: string): PriceData | null {
  if (!pair || !allPrices?.length) return null
  const p = pair.trim()

  // 1. Exact match (highest priority)
  const exact = allPrices.find((c) => c.symbol === p)
  if (exact) return exact

  // 2. Slash-removed match: "EUR/USD" -> "EURUSD" or vice versa
  const noSlash = p.replace(/\//g, "")
  const matchNoSlash = allPrices.find((c) => c.symbol.replace(/\//g, "") === noSlash)
  if (matchNoSlash) return matchNoSlash

  // 3. Try inserting slash for forex/commodities: "EURUSD" -> "EUR/USD", "XAUUSD" -> "XAU/USD"
  if (!p.includes("/") && noSlash.length >= 6) {
    const withSlash3 = noSlash.slice(0, 3) + "/" + noSlash.slice(3)
    const match3 = allPrices.find((c) => c.symbol === withSlash3)
    if (match3) return match3
  }

  // 4. Strip "USDT" suffix for crypto: "BTCUSDT" -> "BTC"
  if (noSlash.endsWith("USDT")) {
    const base = noSlash.slice(0, -4)
    const matchBase = allPrices.find((c) => c.symbol === base && c.category === "crypto")
    if (matchBase) return matchBase
    // Also check without category restriction
    const matchBaseAny = allPrices.find((c) => c.symbol === base)
    if (matchBaseAny) return matchBaseAny
  }

  // 5. Base symbol extraction -- but ONLY match if the input looks like
  // a crypto pair (e.g. "BTC/USDT") to avoid "XAU/USD" -> "XAU" -> wrong crypto
  if (p.includes("/")) {
    const [base, quote] = p.split("/")
    if (quote === "USDT" || quote === "USDC" || quote === "BUSD") {
      const matchCrypto = allPrices.find((c) => c.symbol === base && c.category === "crypto")
      if (matchCrypto) return matchCrypto
    }
  }

  // 6. Case-insensitive fallback
  const pLower = p.toLowerCase()
  const noSlashLower = noSlash.toLowerCase()
  const caseMatch = allPrices.find((c) =>
    c.symbol.toLowerCase() === pLower ||
    c.symbol.replace(/\//g, "").toLowerCase() === noSlashLower
  )
  if (caseMatch) return caseMatch

  return null
}

/* ================================================================
   Known non-crypto symbols -- used as a GUARD to prevent
   XAU/USD, EUR/USD etc. from ever resolving to a crypto price.
   Price fields are zeroed; this map only guards symbol/category resolution.
   ================================================================ */
export const NON_CRYPTO_BASE: Record<string, { price: number; category: string; name: string }> = {
  // Commodities symbol classification only; price is always zero until provider data arrives.
  "XAU/USD": { price: 0, category: "commodity", name: "Gold" },
  "XAG/USD": { price: 0, category: "commodity", name: "Silver" },
  "WTI": { price: 0, category: "commodity", name: "Crude Oil WTI" },
  "BRENT": { price: 0, category: "commodity", name: "Brent Crude" },
  "NG": { price: 0, category: "commodity", name: "Natural Gas" },
  "HG": { price: 0, category: "commodity", name: "Copper" },
  // Forex symbol classification only; price is always zero until provider data arrives.
  "EUR/USD": { price: 0, category: "forex", name: "EUR/USD" },
  "GBP/USD": { price: 0, category: "forex", name: "GBP/USD" },
  "USD/JPY": { price: 0, category: "forex", name: "USD/JPY" },
  "AUD/USD": { price: 0, category: "forex", name: "AUD/USD" },
  "USD/CHF": { price: 0, category: "forex", name: "USD/CHF" },
  "USD/CAD": { price: 0, category: "forex", name: "USD/CAD" },
  "NZD/USD": { price: 0, category: "forex", name: "NZD/USD" },
  // Stock symbol classification only; price is always zero until provider data arrives.
  "AAPL": { price: 0, category: "stock", name: "Apple Inc." },
  "MSFT": { price: 0, category: "stock", name: "Microsoft" },
  "GOOGL": { price: 0, category: "stock", name: "Alphabet" },
  "AMZN": { price: 0, category: "stock", name: "Amazon" },
  "TSLA": { price: 0, category: "stock", name: "Tesla" },
  "NVDA": { price: 0, category: "stock", name: "NVIDIA" },
  "META": { price: 0, category: "stock", name: "Meta Platforms" },
  // CFD symbol classification only; price is always zero until provider data arrives.
  "US30": { price: 0, category: "cfd", name: "US Wall St 30" },
  "US500": { price: 0, category: "cfd", name: "US 500" },
  "US100": { price: 0, category: "cfd", name: "US Tech 100" },
  "UK100": { price: 0, category: "cfd", name: "UK 100" },
  "DE40": { price: 0, category: "cfd", name: "Germany 40" },
  "JP225": { price: 0, category: "cfd", name: "Japan 225" },
  "HK50": { price: 0, category: "cfd", name: "Hong Kong 50" },
  "VIX": { price: 0, category: "cfd", name: "Volatility Index" },
}

/** Safely resolve a price for any pair symbol.
 *
 *  ISOLATION RULE: If the pair is a known non-crypto asset (forex,
 *  commodity, stock, CFD) this function ONLY searches within
 *  non-crypto entries. It will NEVER fall through to the Binance
 *  WebSocket crypto data, even as a fallback. If no live non-crypto
 *  match is found, it returns a synthetic PriceData from the
 *  NON_CRYPTO_BASE table. */
export function safeFindPrice(allPrices: PriceData[], pair: string): PriceData | null {
  const p = pair?.trim()
  if (!p) return null

  // Always return a provider-sourced quote or null. NON_CRYPTO_BASE is used
  // only to prevent a non-crypto symbol from ever resolving to a crypto quote.
  if (NON_CRYPTO_BASE[p]) {
    const live = findPrice(allPrices.filter((asset) => asset.category !== "crypto"), p)
    return live && Number.isFinite(live.price) && live.price > 0 ? live : null
  }

  const match = findPrice(allPrices, p)
  return match && Number.isFinite(match.price) && match.price > 0 ? match : null
}

/* ================================================================
   Helpers
   ================================================================ */
export function formatPrice(price: number): string {
  if (!price || !isFinite(price)) return "0.00"
  if (price >= 10000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 100) return price.toFixed(2)
  if (price >= 1) return price.toFixed(4)
  if (price >= 0.01) return price.toFixed(6)
  return price.toFixed(8)
}

export function formatVolume(vol: number): string {
  if (!vol || !isFinite(vol)) return "0"
  if (vol >= 1e12) return `${(vol / 1e12).toFixed(2)}T`
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`
  return vol.toString()
}

export function formatMarketCap(cap: number): string {
  if (!cap || !isFinite(cap)) return "$0"
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`
  return `$${cap.toLocaleString()}`
}
