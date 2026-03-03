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
   Static fallback data -- UI is NEVER empty
   ================================================================ */
const FALLBACK_CRYPTO: PriceData[] = [
  { id: "btc", symbol: "BTC", name: "Bitcoin", price: 97842.50, change24h: 2.34, volume: 28.5e9, marketCap: 1.92e12, category: "crypto", sparkline: [96800, 97100, 96500, 97200, 97500, 97000, 97800, 97400, 97600, 97900] },
  { id: "eth", symbol: "ETH", name: "Ethereum", price: 3456.78, change24h: 1.82, volume: 14.2e9, marketCap: 415e9, category: "crypto", sparkline: [3400, 3420, 3380, 3450, 3440, 3460, 3430, 3470, 3450, 3460] },
  { id: "sol", symbol: "SOL", name: "Solana", price: 189.45, change24h: -0.56, volume: 3.8e9, marketCap: 82e9, category: "crypto", sparkline: [192, 191, 190, 189, 190, 188, 189, 190, 189, 189] },
  { id: "xrp", symbol: "XRP", name: "XRP", price: 2.87, change24h: 3.12, volume: 5.1e9, marketCap: 148e9, category: "crypto", sparkline: [2.78, 2.80, 2.82, 2.84, 2.83, 2.85, 2.86, 2.84, 2.87, 2.87] },
  { id: "bnb", symbol: "BNB", name: "BNB", price: 654.32, change24h: 0.94, volume: 1.9e9, marketCap: 97e9, category: "crypto", sparkline: [649, 651, 650, 653, 652, 654, 653, 655, 654, 654] },
  { id: "ada", symbol: "ADA", name: "Cardano", price: 0.9876, change24h: -1.23, volume: 1.2e9, marketCap: 34e9, category: "crypto", sparkline: [1.00, 0.99, 0.995, 0.99, 0.985, 0.99, 0.988, 0.987, 0.988, 0.987] },
  { id: "doge", symbol: "DOGE", name: "Dogecoin", price: 0.3245, change24h: 5.67, volume: 2.3e9, marketCap: 47e9, category: "crypto", sparkline: [0.307, 0.310, 0.312, 0.315, 0.318, 0.320, 0.322, 0.324, 0.323, 0.325] },
  { id: "avax", symbol: "AVAX", name: "Avalanche", price: 35.67, change24h: -2.15, volume: 890e6, marketCap: 14e9, category: "crypto", sparkline: [36.5, 36.2, 36.0, 35.8, 35.9, 35.7, 35.8, 35.6, 35.7, 35.7] },
  { id: "dot", symbol: "DOT", name: "Polkadot", price: 7.89, change24h: 1.45, volume: 560e6, marketCap: 10.5e9, category: "crypto", sparkline: [7.7, 7.75, 7.8, 7.82, 7.85, 7.87, 7.86, 7.88, 7.89, 7.89] },
  { id: "link", symbol: "LINK", name: "Chainlink", price: 19.54, change24h: 0.78, volume: 780e6, marketCap: 12.3e9, category: "crypto", sparkline: [19.2, 19.3, 19.35, 19.4, 19.42, 19.45, 19.48, 19.5, 19.52, 19.54] },
]
const FALLBACK_FOREX: PriceData[] = [
  { id: "eur-usd", symbol: "EUR/USD", name: "EUR/USD", price: 1.0842, change24h: 0.12, volume: 5e9, marketCap: 0, category: "forex" },
  { id: "gbp-usd", symbol: "GBP/USD", name: "GBP/USD", price: 1.2634, change24h: -0.08, volume: 3.2e9, marketCap: 0, category: "forex" },
  { id: "usd-jpy", symbol: "USD/JPY", name: "USD/JPY", price: 149.85, change24h: 0.34, volume: 4.1e9, marketCap: 0, category: "forex" },
  { id: "aud-usd", symbol: "AUD/USD", name: "AUD/USD", price: 0.6543, change24h: -0.15, volume: 2.8e9, marketCap: 0, category: "forex" },
  { id: "usd-chf", symbol: "USD/CHF", name: "USD/CHF", price: 0.8821, change24h: 0.08, volume: 2.1e9, marketCap: 0, category: "forex" },
  { id: "usd-cad", symbol: "USD/CAD", name: "USD/CAD", price: 1.3612, change24h: 0.21, volume: 1.9e9, marketCap: 0, category: "forex" },
  { id: "nzd-usd", symbol: "NZD/USD", name: "NZD/USD", price: 0.6102, change24h: -0.11, volume: 1.5e9, marketCap: 0, category: "forex" },
]
const FALLBACK_COMMODITIES: PriceData[] = [
  { id: "xau-usd", symbol: "XAU/USD", name: "Gold", price: 2924.5, change24h: 0.45, volume: 2e9, marketCap: 0, category: "commodity" },
  { id: "xag-usd", symbol: "XAG/USD", name: "Silver", price: 32.78, change24h: -0.32, volume: 800e6, marketCap: 0, category: "commodity" },
]
const FALLBACK_STOCKS: PriceData[] = [
  { id: "aapl", symbol: "AAPL", name: "Apple Inc.", price: 232.4, change24h: 0.78, volume: 500e6, marketCap: 3.5e12, category: "stock" },
  { id: "msft", symbol: "MSFT", name: "Microsoft", price: 412.65, change24h: 1.23, volume: 350e6, marketCap: 3.1e12, category: "stock" },
]
const FALLBACK_CFD: PriceData[] = [
  { id: "us30", symbol: "US30", name: "US Wall St 30", price: 42850, change24h: 0.28, volume: 3e9, marketCap: 0, category: "cfd" },
  { id: "us500", symbol: "US500", name: "US 500", price: 5920, change24h: 0.34, volume: 2.5e9, marketCap: 0, category: "cfd" },
]

const INITIAL_DATA: PricesResponse = {
  crypto: FALLBACK_CRYPTO,
  forex: FALLBACK_FOREX,
  commodities: FALLBACK_COMMODITIES,
  stocks: FALLBACK_STOCKS,
  cfd: FALLBACK_CFD,
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
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    if (!json || !json.crypto || json.crypto.length === 0) return null
    return json
  } catch {
    return null
  }
}

/* ================================================================
   Micro-drift: simulate real-time price ticks for non-WebSocket
   assets (forex, commodities, stocks, CFD) on the client side.
   Updates every 500ms with small random movement around the
   last known REST price.
   ================================================================ */
function applyMicroDrift(items: PriceData[], driftMap: Map<string, number>): PriceData[] {
  return items.map((item) => {
    const base = item.price
    if (base <= 0) return item
    const prev = driftMap.get(item.symbol) ?? base
    // Volatility factor per asset class
    const vol = item.category === "forex" ? 0.00002 : item.category === "commodity" ? 0.0003 : item.category === "stock" ? 0.0002 : 0.0003
    const drift = prev + (Math.random() - 0.49) * base * vol
    // Clamp within +-0.5% of base REST price
    const clamped = Math.max(base * 0.995, Math.min(base * 1.005, drift))
    driftMap.set(item.symbol, clamped)
    const change = base > 0 ? ((clamped - base) / base) * 100 + item.change24h : item.change24h
    return { ...item, price: clamped, change24h: change }
  })
}

/* ================================================================
   Hook: useLivePrices
   - Primary:  Binance WebSocket (real-time crypto, <100ms)
   - Secondary: REST /api/prices polling (all assets, every N seconds)
   - Client tick: 500ms micro-drift for non-crypto assets
   ================================================================ */
export function useLivePrices(refreshInterval = 8000) {
  const { data: restData } = useSWR<PricesResponse | null>(
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

  // Client-side micro-drift state for non-crypto
  const [tickCount, setTickCount] = useState(0)
  const driftMapRef = useRef(new Map<string, number>())

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

  // 500ms micro-drift tick for non-crypto assets
  useEffect(() => {
    const iv = setInterval(() => {
      setTickCount((c) => c + 1)
    }, 500)
    return () => clearInterval(iv)
  }, [])

  // Merge everything
  const baseData = restData || INITIAL_DATA

  // Crypto: overlay WebSocket real-time prices
  const crypto = (baseData.crypto?.length ? baseData.crypto : FALLBACK_CRYPTO).map((coin) => {
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

  // Non-crypto: apply client-side micro-drift so prices tick every 500ms
  // The tickCount dependency forces re-computation
  void tickCount // eslint -- force dependency
  const forex = applyMicroDrift(baseData.forex?.length ? baseData.forex : FALLBACK_FOREX, driftMapRef.current)
  const commodities = applyMicroDrift(baseData.commodities?.length ? baseData.commodities : FALLBACK_COMMODITIES, driftMapRef.current)
  const stocks = applyMicroDrift(baseData.stocks?.length ? baseData.stocks : FALLBACK_STOCKS, driftMapRef.current)
  const cfdArr = applyMicroDrift(baseData.cfd?.length ? baseData.cfd : FALLBACK_CFD, driftMapRef.current)

  return {
    data: { ...baseData, crypto, forex, commodities, stocks, cfd: cfdArr },
    crypto,
    forex,
    commodities,
    stocks,
    cfd: cfdArr,
    isLoading: false,
    isError: false,
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
   Prices here are fallbacks only; real prices come from the API.
   ================================================================ */
export const NON_CRYPTO_BASE: Record<string, { price: number; category: string; name: string }> = {
  // Commodities (fallback -- real prices from metals.live API)
  "XAU/USD": { price: 2924.5, category: "commodity", name: "Gold" },
  "XAG/USD": { price: 32.78, category: "commodity", name: "Silver" },
  "WTI": { price: 71.24, category: "commodity", name: "Crude Oil WTI" },
  "BRENT": { price: 74.89, category: "commodity", name: "Brent Crude" },
  "NG": { price: 3.42, category: "commodity", name: "Natural Gas" },
  "HG": { price: 4.52, category: "commodity", name: "Copper" },
  // Forex (fallback -- real prices from Frankfurter API)
  "EUR/USD": { price: 1.0842, category: "forex", name: "EUR/USD" },
  "GBP/USD": { price: 1.2634, category: "forex", name: "GBP/USD" },
  "USD/JPY": { price: 149.85, category: "forex", name: "USD/JPY" },
  "AUD/USD": { price: 0.6543, category: "forex", name: "AUD/USD" },
  "USD/CHF": { price: 0.8821, category: "forex", name: "USD/CHF" },
  "USD/CAD": { price: 1.3612, category: "forex", name: "USD/CAD" },
  "NZD/USD": { price: 0.6102, category: "forex", name: "NZD/USD" },
  // Stocks (fallback -- real prices from Yahoo Finance)
  "AAPL": { price: 232.4, category: "stock", name: "Apple Inc." },
  "MSFT": { price: 412.65, category: "stock", name: "Microsoft" },
  "GOOGL": { price: 178.2, category: "stock", name: "Alphabet" },
  "AMZN": { price: 215.8, category: "stock", name: "Amazon" },
  "TSLA": { price: 348.9, category: "stock", name: "Tesla" },
  "NVDA": { price: 138.5, category: "stock", name: "NVIDIA" },
  "META": { price: 582.3, category: "stock", name: "Meta Platforms" },
  // CFDs / Indices (fallback -- real prices from Yahoo Finance)
  "US30": { price: 42850, category: "cfd", name: "US Wall St 30" },
  "US500": { price: 5920, category: "cfd", name: "US 500" },
  "US100": { price: 21150, category: "cfd", name: "US Tech 100" },
  "UK100": { price: 8415, category: "cfd", name: "UK 100" },
  "DE40": { price: 22340, category: "cfd", name: "Germany 40" },
  "JP225": { price: 38750, category: "cfd", name: "Japan 225" },
  "HK50": { price: 22480, category: "cfd", name: "Hong Kong 50" },
  "VIX": { price: 15.8, category: "cfd", name: "Volatility Index" },
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

  const nonCrypto = NON_CRYPTO_BASE[p]

  if (nonCrypto) {
    // STRICT: only search non-crypto entries -- filter out ALL crypto first
    const nonCryptoPool = allPrices.filter((a) => a.category !== "crypto")
    const live = findPrice(nonCryptoPool, p)

    // If found a real live price in non-crypto pool, use it
    if (live && live.price > 0) return live

    // Otherwise return the known base price (never falls back to crypto)
    return {
      id: p.toLowerCase().replace(/\//g, "-"),
      symbol: p,
      name: nonCrypto.name,
      price: nonCrypto.price,
      change24h: 0,
      volume: 0,
      marketCap: 0,
      category: nonCrypto.category as PriceData["category"],
    }
  }

  // For crypto pairs, search everything normally
  return findPrice(allPrices, p)
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
