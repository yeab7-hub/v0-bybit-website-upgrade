import { NextResponse } from "next/server"

// ─── CRYPTO: CoinGecko free API (primary) + Binance (fallback) ───
const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h,7d"

const BINANCE_TICKER = "https://api.binance.com/api/v3/ticker/24hr"

const CRYPTO_IDS: Record<string, { symbol: string; name: string }> = {
  bitcoin: { symbol: "BTC", name: "Bitcoin" },
  ethereum: { symbol: "ETH", name: "Ethereum" },
  solana: { symbol: "SOL", name: "Solana" },
  ripple: { symbol: "XRP", name: "XRP" },
  binancecoin: { symbol: "BNB", name: "BNB" },
  cardano: { symbol: "ADA", name: "Cardano" },
  dogecoin: { symbol: "DOGE", name: "Dogecoin" },
  avalanche_2: { symbol: "AVAX", name: "Avalanche" }, // CoinGecko uses "avalanche-2"
  polkadot: { symbol: "DOT", name: "Polkadot" },
  chainlink: { symbol: "LINK", name: "Chainlink" },
  uniswap: { symbol: "UNI", name: "Uniswap" },
  "matic-network": { symbol: "MATIC", name: "Polygon" },
  tron: { symbol: "TRX", name: "TRON" },
  toncoin: { symbol: "TON", name: "Toncoin" },
  shiba_inu: { symbol: "SHIB", name: "Shiba Inu" }, // CoinGecko uses "shiba-inu"
}

const BINANCE_SYMBOLS = [
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

// ─── Forex / Commodities / Stocks / CFD (drift-simulated) ───
const FOREX_PAIRS = [
  { symbol: "EUR/USD", name: "EUR/USD", base: 1.0842 },
  { symbol: "GBP/USD", name: "GBP/USD", base: 1.2634 },
  { symbol: "USD/JPY", name: "USD/JPY", base: 149.85 },
  { symbol: "AUD/USD", name: "AUD/USD", base: 0.6543 },
  { symbol: "USD/CHF", name: "USD/CHF", base: 0.8821 },
  { symbol: "USD/CAD", name: "USD/CAD", base: 1.3612 },
  { symbol: "NZD/USD", name: "NZD/USD", base: 0.6102 },
]
const COMMODITIES = [
  { symbol: "XAU/USD", name: "Gold", base: 2924.5 },
  { symbol: "XAG/USD", name: "Silver", base: 32.78 },
  { symbol: "WTI", name: "Crude Oil WTI", base: 71.24 },
  { symbol: "BRENT", name: "Brent Crude", base: 74.89 },
  { symbol: "NG", name: "Natural Gas", base: 3.42 },
  { symbol: "HG", name: "Copper", base: 4.52 },
]
const STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", base: 232.4 },
  { symbol: "MSFT", name: "Microsoft", base: 412.65 },
  { symbol: "GOOGL", name: "Alphabet", base: 178.2 },
  { symbol: "AMZN", name: "Amazon", base: 215.8 },
  { symbol: "TSLA", name: "Tesla", base: 348.9 },
  { symbol: "NVDA", name: "NVIDIA", base: 138.5 },
  { symbol: "META", name: "Meta Platforms", base: 582.3 },
]
const CFDS = [
  { symbol: "US30", name: "US Wall St 30", base: 42850 },
  { symbol: "US500", name: "US 500", base: 5920 },
  { symbol: "US100", name: "US Tech 100", base: 21150 },
  { symbol: "UK100", name: "UK 100", base: 8415 },
  { symbol: "DE40", name: "Germany 40", base: 22340 },
  { symbol: "JP225", name: "Japan 225", base: 38750 },
  { symbol: "HK50", name: "Hong Kong 50", base: 22480 },
  { symbol: "VIX", name: "Volatility Index", base: 15.8 },
]

// ─── Cache ───
let cachedCrypto: any[] | null = null
let cacheTime = 0
const CACHE_DURATION = 15_000 // 15s -- CoinGecko free = 10-30 req/min

// ─── Drift state for non-crypto assets ───
const driftState = new Map<string, number>()
function getDriftPrice(symbol: string, base: number) {
  const existing = driftState.get(symbol)
  const maxDrift = base * 0.015
  const step = base * 0.0004
  let current: number
  if (existing !== undefined) {
    current = Math.max(base - maxDrift, Math.min(base + maxDrift, existing + (Math.random() - 0.48) * step * 2))
  } else {
    current = base + (Math.random() - 0.5) * base * 0.004
  }
  driftState.set(symbol, current)
  return { price: current, change: ((current - base) / base) * 100 }
}

// ─── Fetch helpers ───
async function fetchCoinGecko(): Promise<any[] | null> {
  try {
    const res = await fetch(COINGECKO_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 15 },
    })
    if (!res.ok) return null
    const data: any[] = await res.json()
    return data.map((coin) => ({
      id: coin.symbol?.toLowerCase() || coin.id,
      symbol: coin.symbol?.toUpperCase(),
      name: coin.name,
      price: coin.current_price ?? 0,
      change24h: coin.price_change_percentage_24h ?? 0,
      change7d: coin.price_change_percentage_7d_in_currency ?? 0,
      volume: coin.total_volume ?? 0,
      marketCap: coin.market_cap ?? 0,
      high24h: coin.high_24h ?? 0,
      low24h: coin.low_24h ?? 0,
      sparkline: coin.sparkline_in_7d?.price?.slice(-24) ?? [],
      category: "crypto",
    }))
  } catch {
    return null
  }
}

async function fetchBinance(): Promise<any[] | null> {
  try {
    const symbols = BINANCE_SYMBOLS.map((s) => `"${s.symbol}"`).join(",")
    const res = await fetch(`${BINANCE_TICKER}?symbols=[${symbols}]`, {
      next: { revalidate: 10 },
    })
    if (!res.ok) return null
    const data: any[] = await res.json()
    return data.map((ticker) => {
      const info = BINANCE_SYMBOLS.find((s) => s.symbol === ticker.symbol)
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
    }).sort((a, b) => b.volume - a.volume)
  } catch {
    return null
  }
}

export async function GET() {
  const now = Date.now()

  // ── Crypto: Use cache if fresh ──
  let cryptoData: any[] | null = null
  if (cachedCrypto && now - cacheTime < CACHE_DURATION) {
    cryptoData = cachedCrypto
  } else {
    // Try CoinGecko first (most reliable from Vercel edge)
    cryptoData = await fetchCoinGecko()

    // Fallback to Binance if CoinGecko failed
    if (!cryptoData || cryptoData.length === 0) {
      cryptoData = await fetchBinance()
    }

    // Cache whatever we got
    if (cryptoData && cryptoData.length > 0) {
      cachedCrypto = cryptoData
      cacheTime = now
    } else if (cachedCrypto) {
      // Use stale cache if everything failed
      cryptoData = cachedCrypto
    }
  }

  // Ultimate fallback with drift simulation
  if (!cryptoData || cryptoData.length === 0) {
    const FB = [
      { s: "BTC", n: "Bitcoin", p: 97842.50, v: 28.5e9, m: 1.92e12 },
      { s: "ETH", n: "Ethereum", p: 3456.78, v: 14.2e9, m: 415e9 },
      { s: "SOL", n: "Solana", p: 189.45, v: 3.8e9, m: 82e9 },
      { s: "XRP", n: "XRP", p: 2.87, v: 5.1e9, m: 148e9 },
      { s: "BNB", n: "BNB", p: 654.32, v: 1.9e9, m: 97e9 },
      { s: "ADA", n: "Cardano", p: 0.9876, v: 1.2e9, m: 34e9 },
      { s: "DOGE", n: "Dogecoin", p: 0.3245, v: 2.3e9, m: 47e9 },
      { s: "AVAX", n: "Avalanche", p: 35.67, v: 890e6, m: 14e9 },
      { s: "DOT", n: "Polkadot", p: 7.89, v: 560e6, m: 10.5e9 },
      { s: "LINK", n: "Chainlink", p: 19.54, v: 780e6, m: 12.3e9 },
      { s: "UNI", n: "Uniswap", p: 13.42, v: 340e6, m: 8.1e9 },
      { s: "MATIC", n: "Polygon", p: 0.5623, v: 410e6, m: 5.6e9 },
      { s: "TRX", n: "TRON", p: 0.2456, v: 620e6, m: 21e9 },
      { s: "TON", n: "Toncoin", p: 5.67, v: 280e6, m: 19e9 },
      { s: "SHIB", n: "Shiba Inu", p: 0.00002245, v: 1.1e9, m: 13e9 },
    ]
    cryptoData = FB.map((c) => {
      const { price, change } = getDriftPrice(c.s, c.p)
      return {
        id: c.s.toLowerCase(), symbol: c.s, name: c.n, price, change24h: change,
        change7d: (Math.random() - 0.4) * 8,
        volume: c.v * (0.9 + Math.random() * 0.2), marketCap: c.m,
        high24h: price * 1.02, low24h: price * 0.98,
        sparkline: Array.from({ length: 24 }, () => c.p * (0.99 + Math.random() * 0.02)),
        category: "crypto",
      }
    })
  }

  // ── Forex / Commodities / Stocks / CFD ──
  const forexData = FOREX_PAIRS.map((p) => {
    const { price, change } = getDriftPrice(p.symbol, p.base)
    return { id: p.symbol.toLowerCase().replace("/", "-"), symbol: p.symbol, name: p.name, price, change24h: change, volume: Math.round(2e9 + Math.random() * 5e9), marketCap: 0, category: "forex" }
  })
  const commodityData = COMMODITIES.map((p) => {
    const { price, change } = getDriftPrice(p.symbol, p.base)
    return { id: p.symbol.toLowerCase().replace("/", "-"), symbol: p.symbol, name: p.name, price, change24h: change, volume: Math.round(5e8 + Math.random() * 2e9), marketCap: 0, category: "commodity" }
  })
  const stockData = STOCKS.map((p) => {
    const { price, change } = getDriftPrice(p.symbol, p.base)
    return { id: p.symbol.toLowerCase(), symbol: p.symbol, name: p.name, price, change24h: change, volume: Math.round(1e8 + Math.random() * 5e8), marketCap: Math.round(price * (1e9 + Math.random() * 2e9)), category: "stock" }
  })
  const cfdData = CFDS.map((p) => {
    const { price, change } = getDriftPrice(p.symbol, p.base)
    return { id: p.symbol.toLowerCase(), symbol: p.symbol, name: p.name, price, change24h: change, volume: Math.round(5e8 + Math.random() * 3e9), marketCap: 0, category: "cfd" }
  })

  return NextResponse.json({
    crypto: cryptoData,
    forex: forexData,
    commodities: commodityData,
    stocks: stockData,
    cfd: cfdData,
    timestamp: now,
  })
}
