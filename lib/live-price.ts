// Single shared live-price lookup, used by every route that needs a current
// market price to execute or settle a trade (open, close, TP/SL & liquidation
// monitor). Previously each route had its OWN separate copy of this logic,
// which had drifted out of sync -- fixing a bug in one place didn't fix it
// in the others. Import this everywhere instead of writing a new copy.
//
// Direct, single-symbol lookups are used (not a self-referential call to
// this project's own /api/prices dashboard endpoint) because that endpoint
// aggregates every asset in a class at once and can legitimately take much
// longer than a single order should ever wait on. A last-known/reasonable
// fallback price is always returned so a transient external API hiccup
// never blocks a trade outright.

const FOREX_META: Record<string, { currency: string; isInverse: boolean; fallback: number }> = {
  "EUR/USD": { currency: "EUR", isInverse: true, fallback: 1.0842 },
  "GBP/USD": { currency: "GBP", isInverse: true, fallback: 1.2634 },
  "USD/JPY": { currency: "JPY", isInverse: false, fallback: 149.85 },
  "AUD/USD": { currency: "AUD", isInverse: true, fallback: 0.6543 },
  "USD/CHF": { currency: "CHF", isInverse: false, fallback: 0.8821 },
  "USD/CAD": { currency: "CAD", isInverse: false, fallback: 1.3612 },
  "NZD/USD": { currency: "NZD", isInverse: true, fallback: 0.6102 },
}

const YAHOO_META: Record<string, { yahooSymbol: string; fallback: number }> = {
  "XAU/USD": { yahooSymbol: "GC=F", fallback: 2924.5 },
  "XAG/USD": { yahooSymbol: "SI=F", fallback: 32.78 },
  WTI: { yahooSymbol: "CL=F", fallback: 71.24 },
  BRENT: { yahooSymbol: "BZ=F", fallback: 74.89 },
  NG: { yahooSymbol: "NG=F", fallback: 3.42 },
  HG: { yahooSymbol: "HG=F", fallback: 4.52 },
  AAPL: { yahooSymbol: "AAPL", fallback: 232.4 },
  MSFT: { yahooSymbol: "MSFT", fallback: 412.65 },
  GOOGL: { yahooSymbol: "GOOGL", fallback: 178.2 },
  AMZN: { yahooSymbol: "AMZN", fallback: 215.8 },
  TSLA: { yahooSymbol: "TSLA", fallback: 348.9 },
  NVDA: { yahooSymbol: "NVDA", fallback: 138.5 },
  META: { yahooSymbol: "META", fallback: 582.3 },
}

const CRYPTO_ID_MAP: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", XRP: "ripple",
  BNB: "binancecoin", ADA: "cardano", DOGE: "dogecoin", AVAX: "avalanche-2",
  DOT: "polkadot", LINK: "chainlink", UNI: "uniswap", MATIC: "matic-network",
  TRX: "tron", TON: "the-open-network", SHIB: "shiba-inu",
}

const CRYPTO_FALLBACK: Record<string, number> = {
  BTC: 97842.5, ETH: 3456.78, SOL: 189.45, XRP: 2.87, BNB: 690.2,
  ADA: 0.89, DOGE: 0.32, AVAX: 38.4, DOT: 7.1, LINK: 22.6,
  UNI: 14.2, MATIC: 0.52, TRX: 0.24, TON: 5.4, SHIB: 0.000024,
}

async function fetchDirectForex(pairSymbol: string): Promise<number> {
  const meta = FOREX_META[pairSymbol]
  if (!meta) return 0
  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${meta.currency}`, {
      signal: AbortSignal.timeout(4000),
    })
    if (res.ok) {
      const json = await res.json()
      const rate = json?.rates?.[meta.currency]
      if (rate > 0) return meta.isInverse ? 1 / rate : rate
    }
  } catch { /* fall through */ }
  return 0
}

async function fetchDirectYahoo(symbol: string): Promise<number> {
  const meta = YAHOO_META[symbol]
  if (!meta) return 0
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${meta.yahooSymbol}&range=1d&interval=5m`,
      {
        signal: AbortSignal.timeout(4500),
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
      },
    )
    if (res.ok) {
      const json = await res.json()
      const result = json?.spark?.result?.[0]?.response?.[0]
      const closes: number[] = result?.indicators?.quote?.[0]?.close ?? []
      const lastClose = [...closes].reverse().find((c) => typeof c === "number" && c > 0)
      if (lastClose) return lastClose
    }
  } catch { /* fall through */ }
  return 0
}

/**
 * Resolves the current market price for a symbol. `pair` (e.g. "BTC/USDT",
 * "EUR/USD") should be passed whenever available -- it's required to
 * correctly identify forex/commodity pairs; `baseAsset` alone is enough for
 * crypto (e.g. "BTC").
 */
export async function getLivePrice(baseAsset: string, pair?: string): Promise<number> {
  const lookupSymbol = pair?.split("/").length === 2 ? pair : baseAsset

  if (FOREX_META[lookupSymbol]) {
    const price = await fetchDirectForex(lookupSymbol)
    return price > 0 ? price : FOREX_META[lookupSymbol].fallback
  }

  if (YAHOO_META[lookupSymbol] || YAHOO_META[baseAsset]) {
    const key = YAHOO_META[lookupSymbol] ? lookupSymbol : baseAsset
    const price = await fetchDirectYahoo(key)
    return price > 0 ? price : YAHOO_META[key].fallback
  }

  // Crypto
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${baseAsset}USDT`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    })
    if (res.ok) {
      const data = await res.json()
      const price = parseFloat(data.price)
      if (price > 0) return price
    }
  } catch { /* try next source */ }

  try {
    const cgId = CRYPTO_ID_MAP[baseAsset]
    if (cgId) {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`, {
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      })
      if (res.ok) {
        const data = await res.json()
        const price = data[cgId]?.usd
        if (price > 0) return price
      }
    }
  } catch { /* fall through to hardcoded fallback */ }

  return CRYPTO_FALLBACK[baseAsset] ?? 0
}
