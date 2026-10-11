// Single shared live-price lookup, used by every route that needs a current
// market price to execute or settle a trade (open, close, TP/SL & liquidation
// monitor). Previously each route had its OWN separate copy of this logic,
// which had drifted out of sync -- fixing a bug in one place didn't fix it
// in the others. Import this everywhere instead of writing a new copy.
//
// Direct, single-symbol lookups are used (not a self-referential call to
// this project's own /api/prices dashboard endpoint). Trade execution must
// fail closed when no current external price can be verified; stale hardcoded
// prices must never be used to execute or settle a financial transaction.

const FOREX_META: Record<string, { currency: string; isInverse: boolean }> = {
  "EUR/USD": { currency: "EUR", isInverse: true },
  "GBP/USD": { currency: "GBP", isInverse: true },
  "USD/JPY": { currency: "JPY", isInverse: false },
  "AUD/USD": { currency: "AUD", isInverse: true },
  "USD/CHF": { currency: "CHF", isInverse: false },
  "USD/CAD": { currency: "CAD", isInverse: false },
  "NZD/USD": { currency: "NZD", isInverse: true },
}

const YAHOO_META: Record<string, { yahooSymbol: string }> = {
  "XAU/USD": { yahooSymbol: "GC=F" },
  "XAG/USD": { yahooSymbol: "SI=F" },
  WTI: { yahooSymbol: "CL=F" },
  BRENT: { yahooSymbol: "BZ=F" },
  NG: { yahooSymbol: "NG=F" },
  HG: { yahooSymbol: "HG=F" },
  AAPL: { yahooSymbol: "AAPL" },
  MSFT: { yahooSymbol: "MSFT" },
  GOOGL: { yahooSymbol: "GOOGL" },
  AMZN: { yahooSymbol: "AMZN" },
  TSLA: { yahooSymbol: "TSLA" },
  NVDA: { yahooSymbol: "NVDA" },
  META: { yahooSymbol: "META" },
}

const CRYPTO_ID_MAP: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", XRP: "ripple",
  BNB: "binancecoin", ADA: "cardano", DOGE: "dogecoin", AVAX: "avalanche-2",
  DOT: "polkadot", LINK: "chainlink", UNI: "uniswap", MATIC: "matic-network",
  TRX: "tron", TON: "the-open-network", SHIB: "shiba-inu",
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
    return price > 0 ? price : 0
  }

  if (YAHOO_META[lookupSymbol] || YAHOO_META[baseAsset]) {
    const key = YAHOO_META[lookupSymbol] ? lookupSymbol : baseAsset
    const price = await fetchDirectYahoo(key)
    return price > 0 ? price : 0
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
  } catch { /* No verified quote is available from this provider. */ }

  return 0
}
