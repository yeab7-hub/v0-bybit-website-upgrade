import { NextResponse } from "next/server"

const COINGECKO_IDS = [
  "bitcoin",
  "ethereum",
  "solana",
  "ripple",
  "binancecoin",
  "cardano",
  "dogecoin",
  "avalanche-2",
  "polkadot",
  "chainlink",
  "uniswap",
  "polygon-ecosystem-token",
  "tron",
  "toncoin",
  "shiba-inu",
]

const SYMBOL_MAP: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
  ripple: "XRP",
  binancecoin: "BNB",
  cardano: "ADA",
  dogecoin: "DOGE",
  "avalanche-2": "AVAX",
  polkadot: "DOT",
  chainlink: "LINK",
  uniswap: "UNI",
  "polygon-ecosystem-token": "MATIC",
  tron: "TRX",
  toncoin: "TON",
  "shiba-inu": "SHIB",
}

const NAME_MAP: Record<string, string> = {
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
  solana: "Solana",
  ripple: "XRP",
  binancecoin: "BNB",
  cardano: "Cardano",
  dogecoin: "Dogecoin",
  "avalanche-2": "Avalanche",
  polkadot: "Polkadot",
  chainlink: "Chainlink",
  uniswap: "Uniswap",
  "polygon-ecosystem-token": "Polygon",
  tron: "TRON",
  toncoin: "Toncoin",
  "shiba-inu": "Shiba Inu",
}

// Forex, commodities, stocks - simulated with realistic base prices
// (Free real-time forex/stock APIs require keys; we simulate with drift from real base values)
const FOREX_PAIRS = [
  { symbol: "EUR/USD", base: 1.0842, category: "forex" },
  { symbol: "GBP/USD", base: 1.2634, category: "forex" },
  { symbol: "USD/JPY", base: 149.85, category: "forex" },
  { symbol: "AUD/USD", base: 0.6543, category: "forex" },
  { symbol: "USD/CHF", base: 0.8821, category: "forex" },
]

const COMMODITIES = [
  { symbol: "XAU/USD", name: "Gold", base: 2924.50, category: "commodity" },
  { symbol: "XAG/USD", name: "Silver", base: 32.78, category: "commodity" },
  { symbol: "WTI", name: "Crude Oil WTI", base: 71.24, category: "commodity" },
  { symbol: "BRENT", name: "Brent Crude", base: 74.89, category: "commodity" },
  { symbol: "NG", name: "Natural Gas", base: 3.42, category: "commodity" },
]

const STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", base: 232.40, category: "stock" },
  { symbol: "MSFT", name: "Microsoft", base: 412.65, category: "stock" },
  { symbol: "GOOGL", name: "Alphabet", base: 178.20, category: "stock" },
  { symbol: "AMZN", name: "Amazon", base: 215.80, category: "stock" },
  { symbol: "TSLA", name: "Tesla", base: 348.90, category: "stock" },
  { symbol: "NVDA", name: "NVIDIA", base: 138.50, category: "stock" },
]

// Cache with timestamp
let cachedCrypto: Record<string, unknown>[] | null = null
let cacheTime = 0
const CACHE_DURATION = 15000 // 15s cache

// Drift state for forex/commodities/stocks (keeps prices moving realistically)
const driftState = new Map<string, number>()

function getDriftPrice(symbol: string, base: number): { price: number; change: number } {
  const existing = driftState.get(symbol)
  const maxDrift = base * 0.02 // max 2% drift
  const step = base * 0.0003 // small step per request

  let current: number
  if (existing !== undefined) {
    const delta = (Math.random() - 0.48) * step * 2
    current = Math.max(base - maxDrift, Math.min(base + maxDrift, existing + delta))
  } else {
    current = base + (Math.random() - 0.5) * base * 0.005
  }

  driftState.set(symbol, current)
  const change = ((current - base) / base) * 100
  return { price: current, change }
}

export async function GET() {
  const now = Date.now()

  // Fetch crypto from CoinGecko (with cache)
  let cryptoData: Record<string, unknown>[] = []

  if (cachedCrypto && now - cacheTime < CACHE_DURATION) {
    cryptoData = cachedCrypto
  } else {
    try {
      const ids = COINGECKO_IDS.join(",")
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d`,
        {
          headers: { accept: "application/json" },
          next: { revalidate: 15 },
        }
      )

      if (res.ok) {
        const data = await res.json()
        cryptoData = data.map((coin: Record<string, unknown>) => ({
          id: coin.id as string,
          symbol: SYMBOL_MAP[coin.id as string] || (coin.symbol as string).toUpperCase(),
          name: NAME_MAP[coin.id as string] || coin.name,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h || 0,
          change7d: coin.price_change_percentage_7d_in_currency || 0,
          volume: coin.total_volume,
          marketCap: coin.market_cap,
          high24h: coin.high_24h,
          low24h: coin.low_24h,
          sparkline: (coin.sparkline_in_7d as Record<string, number[]>)?.price?.slice(-24) || [],
          category: "crypto",
        }))
        cachedCrypto = cryptoData
        cacheTime = now
      }
    } catch {
      // If CoinGecko fails, use cached data or empty
      if (cachedCrypto) {
        cryptoData = cachedCrypto
      }
    }
  }

  // Generate forex data
  const forexData = FOREX_PAIRS.map((pair) => {
    const { price, change } = getDriftPrice(pair.symbol, pair.base)
    return {
      id: pair.symbol.toLowerCase().replace("/", "-"),
      symbol: pair.symbol,
      name: pair.symbol,
      price,
      change24h: change,
      volume: Math.round(Math.random() * 5000000000),
      marketCap: 0,
      category: "forex",
    }
  })

  // Generate commodity data
  const commodityData = COMMODITIES.map((item) => {
    const { price, change } = getDriftPrice(item.symbol, item.base)
    return {
      id: item.symbol.toLowerCase(),
      symbol: item.symbol,
      name: item.name,
      price,
      change24h: change,
      volume: Math.round(Math.random() * 2000000000),
      marketCap: 0,
      category: "commodity",
    }
  })

  // Generate stock data
  const stockData = STOCKS.map((item) => {
    const { price, change } = getDriftPrice(item.symbol, item.base)
    return {
      id: item.symbol.toLowerCase(),
      symbol: item.symbol,
      name: item.name,
      price,
      change24h: change,
      volume: Math.round(Math.random() * 500000000),
      marketCap: Math.round(price * (1000000000 + Math.random() * 2000000000)),
      category: "stock",
    }
  })

  return NextResponse.json({
    crypto: cryptoData,
    forex: forexData,
    commodities: commodityData,
    stocks: stockData,
    timestamp: now,
  })
}
