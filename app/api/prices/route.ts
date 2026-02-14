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
      cachedCrypto = cryptoData
      cacheTime = now
    } catch {
      // give up
    }
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
