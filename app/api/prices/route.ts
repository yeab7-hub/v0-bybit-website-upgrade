import { NextResponse } from "next/server"

// Use Binance public API - no key needed, generous rate limits
const BINANCE_TICKER = "https://api.binance.com/api/v3/ticker/24hr"

const SYMBOLS = [
  { symbol: "BTCUSDT", base: "BTC", name: "Bitcoin" },
  { symbol: "ETHUSDT", base: "ETH", name: "Ethereum" },
  { symbol: "SOLUSDT", base: "SOL", name: "Solana" },
  { symbol: "XRPUSDT", base: "XRP", name: "XRP" },
  { symbol: "BNBUSDT", base: "BNB", name: "BNB" },
  { symbol: "ADAUSDT", base: "ADA", name: "Cardano" },
  { symbol: "DOGEUSDT", base: "DOGE", name: "Dogecoin" },
  { symbol: "AVAXUSDT", base: "AVAX", name: "Avalanche" },
  { symbol: "DOTUSDT", base: "DOT", name: "Polkadot" },
  { symbol: "LINKUSDT", base: "LINK", name: "Chainlink" },
  { symbol: "UNIUSDT", base: "UNI", name: "Uniswap" },
  { symbol: "MATICUSDT", base: "MATIC", name: "Polygon" },
  { symbol: "TRXUSDT", base: "TRX", name: "TRON" },
  { symbol: "TONUSDT", base: "TON", name: "Toncoin" },
  { symbol: "SHIBUSDT", base: "SHIB", name: "Shiba Inu" },
]

// Forex + Commodities + Stocks (simulated drift from realistic base prices)
const FOREX_PAIRS = [
  { symbol: "EUR/USD", base: 1.0842 },
  { symbol: "GBP/USD", base: 1.2634 },
  { symbol: "USD/JPY", base: 149.85 },
  { symbol: "AUD/USD", base: 0.6543 },
  { symbol: "USD/CHF", base: 0.8821 },
]

const COMMODITIES = [
  { symbol: "XAU/USD", name: "Gold", base: 2924.5 },
  { symbol: "XAG/USD", name: "Silver", base: 32.78 },
  { symbol: "WTI", name: "Crude Oil WTI", base: 71.24 },
  { symbol: "BRENT", name: "Brent Crude", base: 74.89 },
  { symbol: "NG", name: "Natural Gas", base: 3.42 },
]

const STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", base: 232.4 },
  { symbol: "MSFT", name: "Microsoft", base: 412.65 },
  { symbol: "GOOGL", name: "Alphabet", base: 178.2 },
  { symbol: "AMZN", name: "Amazon", base: 215.8 },
  { symbol: "TSLA", name: "Tesla", base: 348.9 },
  { symbol: "NVDA", name: "NVIDIA", base: 138.5 },
]

// Cache
let cachedCrypto: Record<string, unknown>[] | null = null
let cacheTime = 0
const CACHE_DURATION = 5000

// Drift state
const driftState = new Map<string, number>()
function getDriftPrice(symbol: string, base: number) {
  const existing = driftState.get(symbol)
  const maxDrift = base * 0.02
  const step = base * 0.0003
  let current: number
  if (existing !== undefined) {
    current = Math.max(base - maxDrift, Math.min(base + maxDrift, existing + (Math.random() - 0.48) * step * 2))
  } else {
    current = base + (Math.random() - 0.5) * base * 0.005
  }
  driftState.set(symbol, current)
  return { price: current, change: ((current - base) / base) * 100 }
}

export async function GET() {
  const now = Date.now()

  let cryptoData: Record<string, unknown>[] = []

  if (cachedCrypto && now - cacheTime < CACHE_DURATION) {
    cryptoData = cachedCrypto
  } else {
    try {
      // Fetch all tickers from Binance in a single call
      const symbols = SYMBOLS.map((s) => `"${s.symbol}"`).join(",")
      const res = await fetch(`${BINANCE_TICKER}?symbols=[${symbols}]`, {
        next: { revalidate: 5 },
      })

      if (res.ok) {
        const data: Record<string, string>[] = await res.json()

        cryptoData = data.map((ticker) => {
          const info = SYMBOLS.find((s) => s.symbol === ticker.symbol)
          const price = parseFloat(ticker.lastPrice)
          const open = parseFloat(ticker.openPrice)
          const change24h = open > 0 ? ((price - open) / open) * 100 : 0

          return {
            id: info?.base?.toLowerCase() || ticker.symbol.toLowerCase(),
            symbol: info?.base || ticker.symbol.replace("USDT", ""),
            name: info?.name || ticker.symbol,
            price,
            change24h,
            change7d: 0,
            volume: parseFloat(ticker.quoteVolume),
            marketCap: 0,
            high24h: parseFloat(ticker.highPrice),
            low24h: parseFloat(ticker.lowPrice),
            sparkline: [],
            category: "crypto",
          }
        })

        // Sort by volume descending
        cryptoData.sort((a, b) => (b.volume as number) - (a.volume as number))
        cachedCrypto = cryptoData
        cacheTime = now
      }
    } catch {
      if (cachedCrypto) cryptoData = cachedCrypto
    }
  }

  // If Binance failed and no cache, try individual ticker fallback
  if (cryptoData.length === 0) {
    try {
      const promises = SYMBOLS.slice(0, 5).map(async (s) => {
        const r = await fetch(`${BINANCE_TICKER}?symbol=${s.symbol}`)
        if (!r.ok) return null
        return r.json()
      })
      const results = await Promise.all(promises)
      cryptoData = results
        .filter(Boolean)
        .map((ticker: Record<string, string>) => {
          const info = SYMBOLS.find((si) => si.symbol === ticker.symbol)
          const price = parseFloat(ticker.lastPrice)
          const open = parseFloat(ticker.openPrice)
          return {
            id: info?.base?.toLowerCase() || "",
            symbol: info?.base || ticker.symbol.replace("USDT", ""),
            name: info?.name || "",
            price,
            change24h: open > 0 ? ((price - open) / open) * 100 : 0,
            volume: parseFloat(ticker.quoteVolume),
            marketCap: 0,
            high24h: parseFloat(ticker.highPrice),
            low24h: parseFloat(ticker.lowPrice),
            sparkline: [],
            category: "crypto",
          }
        })
      if (cryptoData.length > 0) {
        cachedCrypto = cryptoData
        cacheTime = now
      }
    } catch {
      // continue to hardcoded fallback below
    }
  }

  // Ultimate fallback: hardcoded realistic prices with small random drift
  if (cryptoData.length === 0) {
    const FALLBACK_CRYPTO = [
      { base: "BTC", name: "Bitcoin", basePrice: 97842.50, vol: 28.5e9, mcap: 1.92e12 },
      { base: "ETH", name: "Ethereum", basePrice: 3456.78, vol: 14.2e9, mcap: 415e9 },
      { base: "SOL", name: "Solana", basePrice: 189.45, vol: 3.8e9, mcap: 82e9 },
      { base: "XRP", name: "XRP", basePrice: 2.87, vol: 5.1e9, mcap: 148e9 },
      { base: "BNB", name: "BNB", basePrice: 654.32, vol: 1.9e9, mcap: 97e9 },
      { base: "ADA", name: "Cardano", basePrice: 0.9876, vol: 1.2e9, mcap: 34e9 },
      { base: "DOGE", name: "Dogecoin", basePrice: 0.3245, vol: 2.3e9, mcap: 47e9 },
      { base: "AVAX", name: "Avalanche", basePrice: 35.67, vol: 890e6, mcap: 14e9 },
      { base: "DOT", name: "Polkadot", basePrice: 7.89, vol: 560e6, mcap: 10.5e9 },
      { base: "LINK", name: "Chainlink", basePrice: 19.54, vol: 780e6, mcap: 12.3e9 },
      { base: "UNI", name: "Uniswap", basePrice: 13.42, vol: 340e6, mcap: 8.1e9 },
      { base: "MATIC", name: "Polygon", basePrice: 0.5623, vol: 410e6, mcap: 5.6e9 },
      { base: "TRX", name: "TRON", basePrice: 0.2456, vol: 620e6, mcap: 21e9 },
      { base: "TON", name: "Toncoin", basePrice: 5.67, vol: 280e6, mcap: 19e9 },
      { base: "SHIB", name: "Shiba Inu", basePrice: 0.00002245, vol: 1.1e9, mcap: 13e9 },
    ]

    cryptoData = FALLBACK_CRYPTO.map((c) => {
      const { price, change } = getDriftPrice(c.base, c.basePrice)
      const sparkline = Array.from({ length: 24 }, (_, i) => {
        const drift = (Math.random() - 0.5) * c.basePrice * 0.02
        return c.basePrice + drift * Math.sin(i / 3)
      })
      return {
        id: c.base.toLowerCase(),
        symbol: c.base,
        name: c.name,
        price,
        change24h: change,
        change7d: (Math.random() - 0.4) * 8,
        volume: c.vol * (0.8 + Math.random() * 0.4),
        marketCap: c.mcap,
        high24h: price * 1.02,
        low24h: price * 0.98,
        sparkline,
        category: "crypto",
      }
    })
  }

  const forexData = FOREX_PAIRS.map((pair) => {
    const { price, change } = getDriftPrice(pair.symbol, pair.base)
    return { id: pair.symbol.toLowerCase().replace("/", "-"), symbol: pair.symbol, name: pair.symbol, price, change24h: change, volume: Math.round(Math.random() * 5e9), marketCap: 0, category: "forex" }
  })

  const commodityData = COMMODITIES.map((item) => {
    const { price, change } = getDriftPrice(item.symbol, item.base)
    return { id: item.symbol.toLowerCase(), symbol: item.symbol, name: item.name, price, change24h: change, volume: Math.round(Math.random() * 2e9), marketCap: 0, category: "commodity" }
  })

  const stockData = STOCKS.map((item) => {
    const { price, change } = getDriftPrice(item.symbol, item.base)
    return { id: item.symbol.toLowerCase(), symbol: item.symbol, name: item.name, price, change24h: change, volume: Math.round(Math.random() * 5e8), marketCap: Math.round(price * (1e9 + Math.random() * 2e9)), category: "stock" }
  })

  return NextResponse.json({
    crypto: cryptoData,
    forex: forexData,
    commodities: commodityData,
    stocks: stockData,
    timestamp: now,
  })
}
