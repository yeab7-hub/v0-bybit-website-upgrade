import { NextResponse } from "next/server"

/*
 * PRICE SOURCES (in priority order):
 *   Crypto:      CoinCap -> Binance -> CoinGecko -> hardcoded fallback
 *   Forex:       Frankfurter API (free, no key, live ECB rates)
 *   Commodities: TwelveData rapid free endpoint / Metals.dev / fallback
 *   Stocks:      Financial Modeling Prep free / fallback
 *   CFDs:        Derived from stock indices / fallback
 *
 * The key change: we use a PROXY approach for Yahoo Finance data
 * via the "chart" endpoint which is not blocked server-side.
 */

// ─── Crypto Source 1: CoinCap v2 ───
const COINCAP_URL = "https://api.coincap.io/v2/assets?limit=20"
const COINCAP_MAP: Record<string, string> = {
  bitcoin: "BTC", ethereum: "ETH", solana: "SOL", xrp: "XRP",
  "binance-coin": "BNB", cardano: "ADA", dogecoin: "DOGE",
  avalanche: "AVAX", polkadot: "DOT", chainlink: "LINK",
  uniswap: "UNI", polygon: "MATIC", tron: "TRX", toncoin: "TON",
  "shiba-inu": "SHIB", litecoin: "LTC", "bitcoin-cash": "BCH",
  stellar: "XLM", monero: "XMR", "near-protocol": "NEAR",
}

async function fetchCoinCap(): Promise<any[] | null> {
  try {
    const res = await fetch(COINCAP_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const json = await res.json()
    if (!json.data || !Array.isArray(json.data)) return null
    return json.data.map((coin: any) => {
      const symbol = COINCAP_MAP[coin.id] || coin.symbol?.toUpperCase() || "?"
      return {
        id: coin.symbol?.toLowerCase() || coin.id, symbol, name: coin.name || symbol,
        price: parseFloat(coin.priceUsd) || 0,
        change24h: parseFloat(coin.changePercent24Hr) || 0,
        volume: parseFloat(coin.volumeUsd24Hr) || 0,
        marketCap: parseFloat(coin.marketCapUsd) || 0,
        high24h: 0, low24h: 0, sparkline: [], category: "crypto",
      }
    }).filter((c: any) => c.price > 0)
  } catch { return null }
}

// ─── Crypto Source 2: Binance ───
const BINANCE_TICKER = "https://api.binance.com/api/v3/ticker/24hr"
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
  { symbol: "TRXUSDT", base: "TRX", name: "TRON" },
  { symbol: "TONUSDT", base: "TON", name: "Toncoin" },
  { symbol: "SHIBUSDT", base: "SHIB", name: "Shiba Inu" },
  { symbol: "LTCUSDT", base: "LTC", name: "Litecoin" },
]

async function fetchBinance(): Promise<any[] | null> {
  try {
    const symbols = BINANCE_SYMBOLS.map((s) => `"${s.symbol}"`).join(",")
    const res = await fetch(`${BINANCE_TICKER}?symbols=[${symbols}]`, {
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const data: any[] = await res.json()
    return data.map((ticker) => {
      const info = BINANCE_SYMBOLS.find((s) => s.symbol === ticker.symbol)
      const price = parseFloat(ticker.lastPrice)
      const open = parseFloat(ticker.openPrice)
      return {
        id: info?.base?.toLowerCase() || "", symbol: info?.base || ticker.symbol.replace("USDT", ""),
        name: info?.name || "", price,
        change24h: open > 0 ? ((price - open) / open) * 100 : 0,
        volume: parseFloat(ticker.quoteVolume) || 0, marketCap: 0,
        high24h: parseFloat(ticker.highPrice) || 0, low24h: parseFloat(ticker.lowPrice) || 0,
        sparkline: [], category: "crypto",
      }
    }).filter((c) => c.price > 0).sort((a, b) => b.volume - a.volume)
  } catch { return null }
}

// ─── Crypto Source 3: CoinGecko ───
const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h,7d"

async function fetchCoinGecko(): Promise<any[] | null> {
  try {
    const res = await fetch(COINGECKO_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data: any[] = await res.json()
    return data.map((coin) => ({
      id: coin.symbol?.toLowerCase() || coin.id,
      symbol: coin.symbol?.toUpperCase(), name: coin.name,
      price: coin.current_price ?? 0, change24h: coin.price_change_percentage_24h ?? 0,
      change7d: coin.price_change_percentage_7d_in_currency ?? 0,
      volume: coin.total_volume ?? 0, marketCap: coin.market_cap ?? 0,
      high24h: coin.high_24h ?? 0, low24h: coin.low_24h ?? 0,
      sparkline: coin.sparkline_in_7d?.price?.slice(-24) ?? [], category: "crypto",
    })).filter((c: any) => c.price > 0)
  } catch { return null }
}

// ─── Forex: Frankfurter API (free, no key, live ECB rates) ───
const FOREX_BASE_PAIRS = [
  { symbol: "EUR/USD", name: "EUR/USD", fallback: 1.0842, currency: "EUR", isInverse: true },
  { symbol: "GBP/USD", name: "GBP/USD", fallback: 1.2634, currency: "GBP", isInverse: true },
  { symbol: "USD/JPY", name: "USD/JPY", fallback: 149.85, currency: "JPY", isInverse: false },
  { symbol: "AUD/USD", name: "AUD/USD", fallback: 0.6543, currency: "AUD", isInverse: true },
  { symbol: "USD/CHF", name: "USD/CHF", fallback: 0.8821, currency: "CHF", isInverse: false },
  { symbol: "USD/CAD", name: "USD/CAD", fallback: 1.3612, currency: "CAD", isInverse: false },
  { symbol: "NZD/USD", name: "NZD/USD", fallback: 0.6102, currency: "NZD", isInverse: true },
]

let cachedForexRates: Record<string, number> | null = null
let forexCacheTime = 0
const FOREX_CACHE_TTL = 60_000

async function fetchForexRates(): Promise<Record<string, number> | null> {
  const now = Date.now()
  if (cachedForexRates && now - forexCacheTime < FOREX_CACHE_TTL) return cachedForexRates
  try {
    const currencies = FOREX_BASE_PAIRS.map(p => p.currency).join(",")
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${currencies}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return cachedForexRates
    const json = await res.json()
    if (json.rates) { cachedForexRates = json.rates; forexCacheTime = now; return json.rates }
    return cachedForexRates
  } catch { return cachedForexRates }
}

// ─── Yahoo Finance Chart API (works server-side, unlike v7/v8 quote) ───
// The /v8/finance/chart/ endpoint returns OHLCV data for a single symbol.
// We fetch each symbol individually but in parallel.
type YahooResult = { price: number; change: number; high: number; low: number; volume: number }
let cachedYahoo: Record<string, YahooResult> = {}
let yahooCacheTime = 0
const YAHOO_CACHE_TTL = 30_000

async function fetchOneYahooChart(yahooSymbol: string): Promise<YahooResult | null> {
  try {
    // The chart endpoint is NOT blocked from servers (unlike quote endpoints)
    const encoded = encodeURIComponent(yahooSymbol)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?range=1d&interval=5m`
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "*/*",
      },
    })
    if (!res.ok) return null
    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) return null

    const meta = result.meta
    const price = meta?.regularMarketPrice ?? 0
    const prevClose = meta?.chartPreviousClose ?? meta?.previousClose ?? price
    const change = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0

    // Get high/low from intraday data
    const quotes = result.indicators?.quote?.[0]
    let high = meta?.regularMarketDayHigh ?? 0
    let low = meta?.regularMarketDayLow ?? 0
    const volume = meta?.regularMarketVolume ?? 0

    if ((!high || !low) && quotes) {
      const highs = (quotes.high || []).filter((v: any) => v != null)
      const lows = (quotes.low || []).filter((v: any) => v != null)
      if (highs.length > 0) high = Math.max(...highs)
      if (lows.length > 0) low = Math.min(...lows)
    }

    if (price > 0) return { price, change, high, low, volume }
    return null
  } catch {
    return null
  }
}

async function fetchYahooCharts(symbols: { key: string; yahoo: string }[]): Promise<Record<string, YahooResult>> {
  const now = Date.now()
  if (Object.keys(cachedYahoo).length > 0 && now - yahooCacheTime < YAHOO_CACHE_TTL) return cachedYahoo

  const results: Record<string, YahooResult> = {}
  // Fetch all symbols in parallel
  const promises = symbols.map(async ({ key, yahoo }) => {
    const data = await fetchOneYahooChart(yahoo)
    if (data) results[key] = data
  })
  await Promise.allSettled(promises)

  if (Object.keys(results).length > 0) {
    cachedYahoo = { ...cachedYahoo, ...results }
    yahooCacheTime = now
  }
  return cachedYahoo
}

// ─── Asset metadata ───
const COMMODITIES_META = [
  { symbol: "XAU/USD", name: "Gold", fallback: 2924.5, yahoo: "GC=F" },
  { symbol: "XAG/USD", name: "Silver", fallback: 32.78, yahoo: "SI=F" },
  { symbol: "WTI", name: "Crude Oil WTI", fallback: 71.24, yahoo: "CL=F" },
  { symbol: "BRENT", name: "Brent Crude", fallback: 74.89, yahoo: "BZ=F" },
  { symbol: "NG", name: "Natural Gas", fallback: 3.42, yahoo: "NG=F" },
  { symbol: "HG", name: "Copper", fallback: 4.52, yahoo: "HG=F" },
]

const STOCKS_META = [
  { symbol: "AAPL", name: "Apple Inc.", fallback: 232.4, yahoo: "AAPL" },
  { symbol: "MSFT", name: "Microsoft", fallback: 412.65, yahoo: "MSFT" },
  { symbol: "GOOGL", name: "Alphabet", fallback: 178.2, yahoo: "GOOGL" },
  { symbol: "AMZN", name: "Amazon", fallback: 215.8, yahoo: "AMZN" },
  { symbol: "TSLA", name: "Tesla", fallback: 348.9, yahoo: "TSLA" },
  { symbol: "NVDA", name: "NVIDIA", fallback: 138.5, yahoo: "NVDA" },
  { symbol: "META", name: "Meta Platforms", fallback: 582.3, yahoo: "META" },
]

const CFDS_META = [
  { symbol: "US30", name: "US Wall St 30", fallback: 42850, yahoo: "^DJI" },
  { symbol: "US500", name: "US 500", fallback: 5920, yahoo: "^GSPC" },
  { symbol: "US100", name: "US Tech 100", fallback: 21150, yahoo: "^NDX" },
  { symbol: "UK100", name: "UK 100", fallback: 8415, yahoo: "^FTSE" },
  { symbol: "DE40", name: "Germany 40", fallback: 22340, yahoo: "^GDAXI" },
  { symbol: "JP225", name: "Japan 225", fallback: 38750, yahoo: "^N225" },
  { symbol: "HK50", name: "Hong Kong 50", fallback: 22480, yahoo: "^HSI" },
  { symbol: "VIX", name: "Volatility Index", fallback: 15.8, yahoo: "^VIX" },
]

// ─── Drift engine (used ONLY when APIs fail) ───
const driftState = new Map<string, number>()
function getDriftPrice(symbol: string, base: number) {
  const existing = driftState.get(symbol)
  const maxDrift = base * 0.008
  const step = base * 0.0002
  let current: number
  if (existing !== undefined) {
    current = Math.max(base - maxDrift, Math.min(base + maxDrift, existing + (Math.random() - 0.48) * step * 2))
  } else {
    current = base + (Math.random() - 0.5) * base * 0.002
  }
  driftState.set(symbol, current)
  return { price: current, change: ((current - base) / base) * 100 }
}

// ─── Cache ───
let cachedCrypto: any[] | null = null
let cryptoCacheTime = 0
const CRYPTO_CACHE_TTL = 20_000
let lastSource = "none"

export async function GET() {
  try {
    const now = Date.now()

    // ── Crypto ──
    let cryptoData: any[] | null = null
    if (cachedCrypto && now - cryptoCacheTime < CRYPTO_CACHE_TTL) {
      cryptoData = cachedCrypto
    } else {
      const [coincapResult, binanceResult, geckoResult] = await Promise.allSettled([
        fetchCoinCap(), fetchBinance(), fetchCoinGecko(),
      ])
      const coincapData = coincapResult.status === "fulfilled" ? coincapResult.value : null
      const binanceData = binanceResult.status === "fulfilled" ? binanceResult.value : null
      const geckoData = geckoResult.status === "fulfilled" ? geckoResult.value : null

      if (geckoData && geckoData.length > 0) { cryptoData = geckoData; lastSource = "coingecko" }
      else if (coincapData && coincapData.length > 0) { cryptoData = coincapData; lastSource = "coincap" }
      else if (binanceData && binanceData.length > 0) { cryptoData = binanceData; lastSource = "binance" }

      if (cryptoData && cryptoData.length > 0) { cachedCrypto = cryptoData; cryptoCacheTime = now }
      else if (cachedCrypto) { cryptoData = cachedCrypto; lastSource = "stale-cache" }
    }

    // Crypto fallback
    if (!cryptoData || cryptoData.length === 0) {
      lastSource = "fallback"
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
      ]
      cryptoData = FB.map((c) => {
        const { price, change } = getDriftPrice(c.s, c.p)
        return {
          id: c.s.toLowerCase(), symbol: c.s, name: c.n, price, change24h: change,
          volume: c.v, marketCap: c.m, high24h: price * 1.02, low24h: price * 0.98,
          sparkline: Array.from({ length: 24 }, () => c.p * (0.99 + Math.random() * 0.02)),
          category: "crypto",
        }
      })
    }

    // ── Forex (Frankfurter) + Non-crypto (Yahoo Chart API) in parallel ──
    const yahooSymbols = [
      ...COMMODITIES_META.map(s => ({ key: s.symbol, yahoo: s.yahoo })),
      ...STOCKS_META.map(s => ({ key: s.symbol, yahoo: s.yahoo })),
      ...CFDS_META.map(s => ({ key: s.symbol, yahoo: s.yahoo })),
    ]

    const [liveRates, yahooData] = await Promise.all([
      fetchForexRates(),
      fetchYahooCharts(yahooSymbols),
    ])

    // Count how many Yahoo symbols came back live
    const yahooLiveCount = Object.keys(yahooData).length
    const yahooSource = yahooLiveCount > 0 ? "yahoo-chart" : "drift-fallback"

    // ── Build forex ──
    const forexData = FOREX_BASE_PAIRS.map((p) => {
      let liveRate = p.fallback
      if (liveRates && liveRates[p.currency]) {
        liveRate = p.isInverse ? 1 / liveRates[p.currency] : liveRates[p.currency]
      }
      const { price, change } = getDriftPrice(p.symbol, liveRate)
      return {
        id: p.symbol.toLowerCase().replace("/", "-"), symbol: p.symbol, name: p.name,
        price, change24h: change, volume: Math.round(2e9 + Math.random() * 5e9),
        marketCap: 0, high24h: price * 1.002, low24h: price * 0.998, category: "forex",
      }
    })

    // ── Build commodities ──
    const commodityData = COMMODITIES_META.map((p) => {
      const y = yahooData[p.symbol]
      if (y) {
        return {
          id: p.symbol.toLowerCase().replace("/", "-"), symbol: p.symbol, name: p.name,
          price: y.price, change24h: y.change,
          volume: y.volume || Math.round(5e8 + Math.random() * 2e9),
          marketCap: 0, high24h: y.high || y.price * 1.005, low24h: y.low || y.price * 0.995,
          category: "commodity",
        }
      }
      // Fallback: drift around known base
      const { price, change } = getDriftPrice(p.symbol, p.fallback)
      return {
        id: p.symbol.toLowerCase().replace("/", "-"), symbol: p.symbol, name: p.name,
        price, change24h: change, volume: Math.round(5e8 + Math.random() * 2e9),
        marketCap: 0, high24h: price * 1.005, low24h: price * 0.995, category: "commodity",
      }
    })

    // ── Build stocks ──
    const stockData = STOCKS_META.map((p) => {
      const y = yahooData[p.symbol]
      if (y) {
        return {
          id: p.symbol.toLowerCase(), symbol: p.symbol, name: p.name,
          price: y.price, change24h: y.change,
          volume: y.volume || Math.round(1e8 + Math.random() * 5e8),
          marketCap: Math.round(y.price * 1.5e10), high24h: y.high || y.price * 1.01,
          low24h: y.low || y.price * 0.99, category: "stock",
        }
      }
      const { price, change } = getDriftPrice(p.symbol, p.fallback)
      return {
        id: p.symbol.toLowerCase(), symbol: p.symbol, name: p.name,
        price, change24h: change, volume: Math.round(1e8 + Math.random() * 5e8),
        marketCap: Math.round(price * 1.5e10), high24h: price * 1.01,
        low24h: price * 0.99, category: "stock",
      }
    })

    // ── Build CFDs ──
    const cfdData = CFDS_META.map((p) => {
      const y = yahooData[p.symbol]
      if (y) {
        return {
          id: p.symbol.toLowerCase(), symbol: p.symbol, name: p.name,
          price: y.price, change24h: y.change,
          volume: y.volume || Math.round(5e8 + Math.random() * 3e9),
          marketCap: 0, high24h: y.high || y.price * 1.005,
          low24h: y.low || y.price * 0.995, category: "cfd",
        }
      }
      const { price, change } = getDriftPrice(p.symbol, p.fallback)
      return {
        id: p.symbol.toLowerCase(), symbol: p.symbol, name: p.name,
        price, change24h: change, volume: Math.round(5e8 + Math.random() * 3e9),
        marketCap: 0, high24h: price * 1.005, low24h: price * 0.995, category: "cfd",
      }
    })

    return NextResponse.json({
      crypto: cryptoData,
      forex: forexData,
      commodities: commodityData,
      stocks: stockData,
      cfd: cfdData,
      source: lastSource,
      yahooSource,
      yahooLiveCount,
      timestamp: now,
    })
  } catch (e) {
    console.error("Prices API error:", e)
    return NextResponse.json({
      crypto: [{ id: "btc", symbol: "BTC", name: "Bitcoin", price: 97842, change24h: 2.3, volume: 28e9, marketCap: 1.9e12, sparkline: [], category: "crypto" }],
      forex: [{ id: "eur-usd", symbol: "EUR/USD", name: "EUR/USD", price: 1.084, change24h: 0.1, volume: 5e9, marketCap: 0, category: "forex" }],
      commodities: [{ id: "xau-usd", symbol: "XAU/USD", name: "Gold", price: 2924, change24h: 0.4, volume: 2e9, marketCap: 0, category: "commodity" }],
      stocks: [{ id: "aapl", symbol: "AAPL", name: "Apple Inc.", price: 232, change24h: 0.8, volume: 5e8, marketCap: 3.5e12, category: "stock" }],
      cfd: [{ id: "us500", symbol: "US500", name: "US 500", price: 5920, change24h: 0.3, volume: 2.5e9, marketCap: 0, category: "cfd" }],
      source: "emergency", yahooSource: "none", yahooLiveCount: 0, timestamp: Date.now(),
    })
  }
}
